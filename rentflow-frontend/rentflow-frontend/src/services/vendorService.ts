import { api } from './api'

export interface VendorDashboardData {
  totalEquipment: number
  pendingRequests: number
  activeRentals: number
  totalRevenue: number
  monthlyRevenue: { month: string; amount: number }[]
  recentBookings: {
    id: string
    itemName: string
    customerName: string
    customerEmail: string
    status: string
    startDate: string
    dueDate: string
    amount: number
  }[]
}

export interface VendorBooking {
  id: string
  itemId: string
  itemName: string
  itemCategory: string
  customerId: string
  customerName: string
  customerEmail: string
  status: string
  startDate: string
  dueDate: string
  amount: number
  createdAt: string
  /** Whether this is a home delivery or store pickup */
  deliveryType: 'DELIVERY' | 'PICKUP'
  /** Populated for DELIVERY orders — the customer's address */
  deliveryAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
  } | null
  /** Returned by updateBookingStatus when RESERVED — tells vendor next step */
  fulfillmentAction?: 'SCHEDULE_DELIVERY' | 'PREPARE_PICKUP' | null
}

export interface VendorEarnings {
  total: number
  byMonth: { month: string; amount: number }[]
  transactions: { id: string; itemName: string; amount: number; date: string }[]
}

export interface VendorEquipment {
  id: string
  name: string
  category: string
  dailyRate: number
  available: boolean
  branchId: string
  createdAt: string
  brand?: string
  description?: string
}

export interface CreateEquipmentPayload {
  name: string
  category: string
  dailyRate: number
  brand?: string
  description?: string
  available?: boolean
}

export const vendorService = {
  async getDashboard(): Promise<VendorDashboardData> {
    const { data } = await api.get('/vendor/dashboard')
    return data
  },

  async getBookings(): Promise<VendorBooking[]> {
    const { data } = await api.get('/vendor/bookings')
    return data
  },

  async updateBookingStatus(rentalId: string, status: string): Promise<VendorBooking> {
    const { data } = await api.put(`/vendor/bookings/${rentalId}/status`, { status })
    return data
  },

  async getEarnings(): Promise<VendorEarnings> {
    const { data } = await api.get('/vendor/earnings')
    return data
  },

  async getEquipment(): Promise<VendorEquipment[]> {
    const { data } = await api.get('/vendor/equipment')
    return data
  },

  async addEquipment(payload: CreateEquipmentPayload): Promise<VendorEquipment> {
    const { data } = await api.post('/vendor/equipment', payload)
    return data
  },

  async updateEquipmentStatus(id: string, available: boolean): Promise<VendorEquipment> {
    const { data } = await api.patch(`/vendor/equipment/${id}/status`, { available })
    return data
  },
}
