import { create } from 'zustand';
import { ordersApi } from '../api/ordersApi';
import type { OrderWithDetails, CreateOrderParams, OrderStatus } from '@entities/orders';

type OrdersState = {
  orders: OrderWithDetails[];
  selectedOrder: OrderWithDetails | null;
  loading: boolean;
  loadingDetail: boolean;
  submitting: boolean;
  error: string | null;
};

type OrdersActions = {
  fetchMyOrders: (userId: string) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  createOrder: (userId: string, params: CreateOrderParams) => Promise<string | null>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  clearSelected: () => void;
  clearError: () => void;
};

type OrdersStore = OrdersState & OrdersActions;

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: false,
  loadingDetail: false,
  submitting: false,
  error: null,

  fetchMyOrders: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await ordersApi.getMyOrders(userId);
    set({ orders: data ?? [], loading: false, error });
  },

  fetchOrderById: async (orderId) => {
    set({ loadingDetail: true, error: null });
    const { data, error } = await ordersApi.getById(orderId);
    set({ selectedOrder: data, loadingDetail: false, error });
  },

  createOrder: async (userId, params) => {
    set({ submitting: true, error: null });
    const { data, error } = await ordersApi.create(userId, params);
    if (error || !data) {
      set({ submitting: false, error });
      return null;
    }
    set((state) => ({ orders: [data, ...state.orders], submitting: false }));
    return data.id;
  },

  updateStatus: async (orderId, status) => {
    set({ submitting: true, error: null });
    const { data, error } = await ordersApi.updateStatus(orderId, status);
    if (error || !data) {
      set({ submitting: false, error });
      return false;
    }
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? data : o)),
      selectedOrder: state.selectedOrder?.id === orderId ? data : state.selectedOrder,
      submitting: false,
    }));
    return true;
  },

  clearSelected: () => set({ selectedOrder: null }),
  clearError: () => set({ error: null }),
}));