import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

function formatItem(item) {
  if (!item) return item;
  return {
    ...item,
    dailyRate: Number(item.dailyRate),
    available: Boolean(item.isActive),
  };
}

export const itemService = {
  async listItems(user) {
    // Admins and Vendors see all items; regular users see only their branch
    const where = (user.role === 'ADMIN' || user.role === 'VENDOR') ? {} : { branchId: user.branchId };
    const items = await prisma.item.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { branch: true }
    });
    return items.map(formatItem);
  },

  async getById(id) {
    const item = await prisma.item.findUnique({
      where: { id }
    });
    if (!item) throw AppError.notFound('Item not found');
    return formatItem(item);
  },

  async getItem(id) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { branch: true }
    });
    if (!item) throw AppError.notFound('Item not found');
    return formatItem(item);
  },

  async createItem(data) {
    const inputData = { ...data };
    if (inputData.available !== undefined) {
      inputData.isActive = Boolean(inputData.available);
      delete inputData.available;
    }
    const newItem = await prisma.item.create({
      data: inputData,
      include: { branch: true }
    });
    return formatItem(newItem);
  },

  async updateItem(id, data) {
    // Check if exists
    await this.getItem(id);

    const updateData = { ...data };
    if (updateData.available !== undefined) {
      updateData.isActive = Boolean(updateData.available);
      delete updateData.available;
    }

    const updated = await prisma.item.update({
      where: { id },
      data: updateData,
      include: { branch: true }
    });
    return formatItem(updated);
  },

  async deleteItem(id) {
    await this.getItem(id);
    await prisma.item.delete({ where: { id } });
  }
};

export default itemService;
