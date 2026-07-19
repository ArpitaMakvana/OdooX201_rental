import { prisma } from '../config/prisma.js';

export const checkoutService = {
  /**
   * Process checkout from the cart.
   *
   * cartItems shape (sent from frontend CartContext):
   *   [ { item: { id, branchId, dailyRate, ... }, durationDays }, ... ]
   *
   * The order is created as PAID (payment is mocked), but each rental
   * starts in PENDING status — waiting for the vendor to Accept/Reject.
   * The deliveryType is stored on the Order so the vendor knows whether
   * to arrange delivery or store pickup.
   */
  async processCheckout(user, { cartItems, securityDeposit, totalAmount, deliveryType, addressId }) {
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: deliveryType === 'DELIVERY' && addressId ? addressId : null,
        totalAmount,
        securityDeposit,
        deliveryType,
        status: 'PAID', // payment is simulated as instantly successful
        payments: {
          create: {
            userId: user.id,
            amount: totalAmount + securityDeposit,
            status: 'COMPLETED',
            stripeSession: 'mock_session_' + Date.now(),
          },
        },
        rentals: {
          // Each cart item becomes an individual rental record.
          // branchId comes from the item (item.item.branchId).
          // Status starts as PENDING — vendor must Accept before equipment moves.
          create: cartItems.map((cartItem) => {
            const startDate = new Date();
            const dueDate = new Date(startDate);
            dueDate.setDate(dueDate.getDate() + (cartItem.durationDays ?? 1));
            return {
              itemId: cartItem.item.id,
              branchId: cartItem.item.branchId ?? user.branchId,
              userId: user.id,
              startDate,
              dueDate,
              status: 'PENDING', // awaits vendor approval
            };
          }),
        },
      },
      include: {
        payments: true,
        rentals: {
          include: { item: true },
        },
      },
    });

    return order;
  },

  async uploadVerificationDoc(user, type, fileUrl) {
    return await prisma.verificationDocument.create({
      data: {
        userId: user.id,
        type,
        url: fileUrl,
        status: 'PENDING',
      },
    });
  },

  async getMyDocs(user) {
    return await prisma.verificationDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  },
};
