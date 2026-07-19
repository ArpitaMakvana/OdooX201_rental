import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { OPEN_RENTAL_STATUSES } from '../constants/rental.constants.js';
import { toRentalDTOList, toBookableItemDTO } from '../dto/rental.dto.js';

const latestRentalInclude = {
  rentals: { take: 1, orderBy: { createdAt: 'desc' } },
};

export const rentalService = {
  /**
   * Returns booking history.
   *
   * Compatibility note: the bundled admin dashboard
   * (`src/pages/admin/AdminDashboard.tsx`) reuses this same
   * `GET /rentals/mine` call to power its system-wide "rentals in
   * flight" / "overdue" stats -- admins don't have personal rentals of
   * their own, so for an ADMIN caller this returns every rental in the
   * system rather than an empty list. Regular users only ever see their
   * own history.
   */
  async listMine(user) {
    const rentals = await prisma.rental.findMany({
      where: user.role === 'ADMIN' ? {} : { userId: user.id },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
    return toRentalDTOList(rentals);
  },

  /** Lists bookable inventory at the caller's home branch. */
  async browseAvailable(user, filters = {}) {
    const { category, brand, size, startDate, endDate } = filters;
    
    let whereClause = {
      branchId: user.branchId,
      isActive: true,
    };

    if (category) whereClause.category = category;
    if (brand && brand !== 'All brands') whereClause.brand = brand;
    if (size && size !== 'Any size') whereClause.size = size;

    if (startDate && endDate) {
      whereClause.rentals = {
        none: {
          status: { in: ['RESERVED', 'ACTIVE', 'OVERDUE'] },
          AND: [
            { startDate: { lte: new Date(endDate) } },
            { dueDate: { gte: new Date(startDate) } }
          ]
        }
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      include: latestRentalInclude,
      orderBy: { name: 'asc' },
    });
    return items.map(toBookableItemDTO);
  },

  /** Reserves an item for the requesting user, if it isn't already spoken for. */
  async requestRental(user, itemId) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: latestRentalInclude,
    });

    if (!item || !item.isActive) {
      throw AppError.notFound('Item not found.');
    }

    const latest = item.rentals[0];
    if (latest && OPEN_RENTAL_STATUSES.includes(latest.status)) {
      throw AppError.conflict('This item is already reserved.');
    }

    const startDate = new Date();
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + env.DEFAULT_RENTAL_DAYS);

    const created = await prisma.rental.create({
      data: {
        userId: user.id,
        itemId: item.id,
        branchId: item.branchId,
        status: 'PENDING',
        startDate,
        dueDate,
      },
    });

    return toBookableItemDTO({ ...item, rentals: [created] });
  },

  /** Admin/Vendor/User: update rental status based on role */
  async updateStatus(user, rentalId, status) {
    const role = user.role.toUpperCase(); // normalize to uppercase

    // Admin and Vendor can update any status; Users can only cancel or request returns
    const adminVendorStatuses = ['PENDING', 'RESERVED', 'REJECTED', 'CANCELLED', 'ACTIVE', 'DELIVERED', 'RETURNED', 'OVERDUE', 'COMPLETED', 'RETURN_REQUESTED'];
    const userAllowedStatuses = ['RETURN_REQUESTED', 'CANCELLED'];

    if (role === 'USER' && !userAllowedStatuses.includes(status)) {
      throw AppError.forbidden('Users can only request returns or cancel bookings.');
    }
    if (!adminVendorStatuses.includes(status)) {
      throw AppError.badRequest('Invalid status.');
    }

    const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
    if (!rental) throw AppError.notFound('Rental not found.');

    // For users, verify they own this rental
    if (role === 'USER' && rental.userId !== user.id) {
      throw AppError.forbidden('You do not own this rental.');
    }

    // RETURN_REQUESTED is a virtual status — map to RETURNED in the DB
    const dbStatus = status === 'RETURN_REQUESTED' ? 'RETURNED' : status;

    const updated = await prisma.rental.update({
      where: { id: rentalId },
      data: { status: dbStatus },
      include: { item: true }
    });

    // Return with the virtual RETURN_REQUESTED status so the frontend can show it
    return { ...updated, status: status === 'RETURN_REQUESTED' ? 'RETURN_REQUESTED' : updated.status };
  },
};

export default rentalService;
