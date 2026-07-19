import { api } from './api';
import type { Equipment } from './itemService';

export const wishlistService = {
  async getMyWishlist(): Promise<Equipment[]> {
    const { data } = await api.get<Equipment[]>('/wishlist');
    return data;
  },

  async toggleWishlist(itemId: string): Promise<{ status: 'added' | 'removed', itemId: string }> {
    const { data } = await api.post(`/wishlist/${itemId}/toggle`);
    return data;
  }
};
