import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export const wishlistService = {
  async getMyWishlist(user) {
    const wishlists = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { item: true },
      orderBy: { createdAt: 'desc' }
    });
    return wishlists.map(w => w.item);
  },

  async toggleWishlist(user, itemId) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw AppError.notFound('Item not found');

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: item.id
        }
      }
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return { status: 'removed', itemId };
    } else {
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          itemId: item.id
        }
      });
      return { status: 'added', itemId };
    }
  }
};
