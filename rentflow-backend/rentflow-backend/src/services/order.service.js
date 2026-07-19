import prisma from '../config/prisma.js';

export const orderService = {
  async createOrder(user, orderData) {
    const { items, deliveryType, addressId, totalAmount, securityDeposit } = orderData;
    
    // Create the order and the individual rentals associated with it
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          securityDeposit,
          deliveryType,
          addressId: deliveryType === 'DELIVERY' ? addressId : null,
          status: 'PAID', // Simulating successful payment
        },
      });

      // Create a rental for each item in the cart
      const rentalPromises = items.map((cartItem) => {
        const startDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + cartItem.durationDays);

        return tx.rental.create({
          data: {
            userId: user.id,
            itemId: cartItem.item.id,
            branchId: cartItem.item.branchId || user.branchId, // fallback to user's branch
            startDate,
            dueDate,
            orderId: order.id,
            status: 'ACTIVE',
          },
        });
      });

      await Promise.all(rentalPromises);

      return order;
    });
  },

  async getMyOrders(user) {
    return prisma.order.findMany({
      where: { userId: user.id },
      include: {
        rentals: {
          include: {
            item: true,
          }
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
};
