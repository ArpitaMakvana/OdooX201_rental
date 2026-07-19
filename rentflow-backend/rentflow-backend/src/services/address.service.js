import prisma from '../config/prisma.js';

export const addressService = {
  async getAddresses(user) {
    return prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createAddress(user, addressData) {
    return prisma.address.create({
      data: {
        ...addressData,
        userId: user.id,
      },
    });
  },
};
