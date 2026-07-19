import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

function calcAmount(item, rental) {
  const days = Math.max(1, Math.ceil(
    (new Date(rental.dueDate) - new Date(rental.startDate)) / 86400000
  ));
  return Number(item.dailyRate) * days;
}

export const vendorService = {
  /** Dashboard summary for a vendor */
  async getDashboard(user) {
    const [equipment, allRentals] = await Promise.all([
      prisma.item.findMany({ where: { branchId: user.branchId } }),
      prisma.rental.findMany({
        where: { item: { branchId: user.branchId } },
        include: { item: true, user: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const pending  = allRentals.filter(r => r.status === 'PENDING');
    const active   = allRentals.filter(r => ['ACTIVE','DELIVERED','RESERVED'].includes(r.status));
    const completed = allRentals.filter(r => r.status === 'COMPLETED');
    const revenue  = completed.reduce((s, r) => s + calcAmount(r.item, r), 0);

    // Monthly revenue for chart
    const byMonth = {};
    completed.forEach(r => {
      const key = new Date(r.updatedAt).toLocaleString('en', { month: 'short', year: '2-digit' });
      byMonth[key] = (byMonth[key] || 0) + calcAmount(r.item, r);
    });

    return {
      totalEquipment: equipment.length,
      pendingRequests: pending.length,
      activeRentals: active.length,
      totalRevenue: parseFloat(revenue.toFixed(2)),
      monthlyRevenue: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })),
      recentBookings: allRentals.slice(0, 8).map(r => ({
        id: r.id,
        itemName: r.item.name,
        customerName: r.user.name,
        customerEmail: r.user.email,
        status: r.status,
        startDate: r.startDate,
        dueDate: r.dueDate,
        amount: calcAmount(r.item, r),
      })),
    };
  },

  /** All bookings for vendor's equipment */
  async getBookings(user) {
    const rentals = await prisma.rental.findMany({
      where: { item: { branchId: user.branchId } },
      include: {
        item: true,
        user: true,
        // Include the order so we can surface deliveryType and address to vendor
        order: { include: { address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rentals.map(r => ({
      id: r.id,
      itemId: r.item.id,
      itemName: r.item.name,
      itemCategory: r.item.category,
      customerId: r.user.id,
      customerName: r.user.name,
      customerEmail: r.user.email,
      status: r.status,
      startDate: r.startDate,
      dueDate: r.dueDate,
      amount: calcAmount(r.item, r),
      createdAt: r.createdAt,
      // Fulfillment info — needed for vendor to decide delivery vs pickup actions
      deliveryType: r.order?.deliveryType ?? 'PICKUP',
      deliveryAddress: r.order?.address ?? null,
    }));
  },

  /** Update a booking status (vendor actions: accept/reject/deliver/complete) */
  async updateBookingStatus(user, rentalId, newStatus) {
    const allowed = ['RESERVED', 'REJECTED', 'ACTIVE', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    const status = newStatus.toUpperCase();
    if (!allowed.includes(status)) throw AppError.badRequest('Invalid status');

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { item: true, order: { include: { address: true } } },
    });
    if (!rental) throw AppError.notFound('Rental not found');
    if (rental.item.branchId !== user.branchId) throw AppError.forbidden('Not your rental');

    const updated = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        status,
        ...(status === 'COMPLETED' ? { returnedAt: new Date() } : {}),
      },
      include: { item: true, user: true, order: { include: { address: true } } },
    });

    return {
      id: updated.id,
      itemName: updated.item.name,
      itemCategory: updated.item.category,
      customerName: updated.user.name,
      customerEmail: updated.user.email,
      status: updated.status,
      startDate: updated.startDate,
      dueDate: updated.dueDate,
      amount: calcAmount(updated.item, updated),
      // Return fulfillment info so frontend can update its UI without a re-fetch
      deliveryType: updated.order?.deliveryType ?? 'PICKUP',
      deliveryAddress: updated.order?.address ?? null,
      // If RESERVED and deliveryType=DELIVERY, vendor knows to schedule delivery
      fulfillmentAction:
        status === 'RESERVED' && updated.order?.deliveryType === 'DELIVERY'
          ? 'SCHEDULE_DELIVERY'
          : status === 'RESERVED'
          ? 'PREPARE_PICKUP'
          : null,
    };
  },

  /** Earnings summary */
  async getEarnings(user) {
    const rentals = await prisma.rental.findMany({
      where: { item: { branchId: user.branchId }, status: 'COMPLETED' },
      include: { item: true },
      orderBy: { updatedAt: 'desc' },
    });

    const byMonth = {};
    rentals.forEach(r => {
      const key = new Date(r.updatedAt).toLocaleString('en', { month: 'short', year: '2-digit' });
      byMonth[key] = (byMonth[key] || 0) + calcAmount(r.item, r);
    });

    const total = rentals.reduce((s, r) => s + calcAmount(r.item, r), 0);

    return {
      total: parseFloat(total.toFixed(2)),
      byMonth: Object.entries(byMonth).map(([month, amount]) => ({
        month,
        amount: parseFloat(amount.toFixed(2)),
      })),
      transactions: rentals.slice(0, 50).map(r => ({
        id: r.id,
        itemName: r.item.name,
        amount: parseFloat(calcAmount(r.item, r).toFixed(2)),
        date: r.updatedAt,
      })),
    };
  },

  /** Vendor's own equipment */
  async getEquipment(user) {
    const items = await prisma.item.findMany({
      where: { branchId: user.branchId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(formatEquipment);
  },

  /** Add new equipment for vendor */
  async addEquipment(user, data) {
    const { name, category, dailyRate, brand, description, available, isActive, size, condition } = data;
    if (!name || !category || dailyRate === undefined || dailyRate === null) {
      throw AppError.badRequest('Name, category, and dailyRate are required');
    }

    const isAvailable = available !== undefined ? Boolean(available) : (isActive !== undefined ? Boolean(isActive) : true);

    const newItem = await prisma.item.create({
      data: {
        name,
        category,
        dailyRate: Number(dailyRate),
        brand: brand || null,
        description: description || null,
        size: size || null,
        condition: condition || null,
        isActive: isAvailable,
        branchId: user.branchId,
      },
    });

    return formatEquipment(newItem);
  },

  /** Update equipment availability status */
  async updateEquipmentStatus(user, equipmentId, availableValue) {
    const item = await prisma.item.findUnique({
      where: { id: equipmentId },
    });

    if (!item) throw AppError.notFound('Equipment not found');
    if (item.branchId !== user.branchId) throw AppError.forbidden('Not authorized to modify this equipment');

    const updated = await prisma.item.update({
      where: { id: equipmentId },
      data: {
        isActive: Boolean(availableValue),
      },
    });

    return formatEquipment(updated);
  },
};

function formatEquipment(item) {
  return {
    ...item,
    dailyRate: Number(item.dailyRate),
    available: Boolean(item.isActive),
    isActive: Boolean(item.isActive),
  };
}

export default vendorService;
