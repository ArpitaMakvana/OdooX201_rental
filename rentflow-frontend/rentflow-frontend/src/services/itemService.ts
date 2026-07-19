import api from './api';

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  model?: string;
  condition?: string;
  quantity: number;
  
  hourlyRate?: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  securityDeposit?: number;

  images: string[];
  documents: string[];
  specifications?: any;

  branchId: string;
  isActive: boolean;
}

export const itemService = {
  async list(): Promise<Equipment[]> {
    const { data } = await api.get<Equipment[]>('/items');
    return data;
  },

  async getById(id: string): Promise<Equipment> {
    const { data } = await api.get<Equipment>(`/items/${id}`);
    return data;
  },

  async create(payload: Partial<Equipment>): Promise<Equipment> {
    const { data } = await api.post<Equipment>('/items', payload);
    return data;
  },

  async update(id: string, payload: Partial<Equipment>): Promise<Equipment> {
    const { data } = await api.put<Equipment>(`/items/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/items/${id}`);
  },

  async uploadMedia(id: string, images: File[], documents: File[]): Promise<Equipment> {
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    documents.forEach(doc => formData.append('documents', doc));

    const { data } = await api.post<Equipment>(`/items/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};
