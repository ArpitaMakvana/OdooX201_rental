import { api } from './api';
import type { CartItem } from '@/context/CartContext';

export interface CheckoutPayload {
  cartItems: CartItem[];
  securityDeposit: number;
  totalAmount: number;
  deliveryType: 'DELIVERY' | 'PICKUP';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export const checkoutService = {
  async processCheckout(payload: CheckoutPayload) {
    const { data } = await api.post('/checkout', payload);
    return data;
  },

  async uploadDoc(file: File, type: string) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    const { data } = await api.post('/checkout/docs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getMyDocs() {
    const { data } = await api.get('/checkout/docs');
    return data;
  },
};
