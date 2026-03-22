import { create } from 'zustand';
import { servicesApi } from '../api/sevicesApi';
import type { ServiceWithDetails, CreateServiceParams, UpdateServiceParams } from '@entities/service';
import type { Category } from '@entities/service';

type ServicesState = {
  services: ServiceWithDetails[];
  myServices: ServiceWithDetails[];
  selectedService: ServiceWithDetails | null;
  categories: Category[];
  loading: boolean;
  loadingDetail: boolean;
  submitting: boolean;
  error: string | null;
  searchQuery: string;
};

type ServicesActions = {
  fetchServices: (params?: { search?: string; category_slug?: string }) => Promise<void>;
  fetchMyServices: (userId: string) => Promise<void>;
  fetchServiceById: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createService: (userId: string, params: CreateServiceParams) => Promise<boolean>;
  updateService: (id: string, params: UpdateServiceParams) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  setSearchQuery: (q: string) => void;
  clearSelected: () => void;
  clearError: () => void;
};

type ServicesStore = ServicesState & ServicesActions;

export const useServicesStore = create<ServicesStore>((set, get) => ({
  services: [],
  myServices: [],
  selectedService: null,
  categories: [],
  loading: false,
  loadingDetail: false,
  submitting: false,
  error: null,
  searchQuery: '',

  fetchServices: async (params) => {
    set({ loading: true, error: null });
    const { data, error } = await servicesApi.getAll(params);
    set({ services: data ?? [], loading: false, error });
  },

  fetchMyServices: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await servicesApi.getByUser(userId);
    set({ myServices: data ?? [], loading: false, error });
  },

  fetchServiceById: async (id) => {
    set({ loadingDetail: true, error: null });
    const { data, error } = await servicesApi.getById(id);
    set({ selectedService: data, loadingDetail: false, error });
  },

  fetchCategories: async () => {
    const { data } = await servicesApi.getCategories();
    if (data) set({ categories: data });
  },

  createService: async (userId, params) => {
    set({ submitting: true, error: null });
    const { data, error } = await servicesApi.create(userId, params);
    if (error || !data) {
      set({ submitting: false, error });
      return false;
    }
    set((state) => ({
      myServices: [data, ...state.myServices],
      submitting: false,
    }));
    return true;
  },

  updateService: async (id, params) => {
    set({ submitting: true, error: null });
    const { data, error } = await servicesApi.update(id, params);
    if (error || !data) {
      set({ submitting: false, error });
      return false;
    }
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? data : s)),
      myServices: state.myServices.map((s) => (s.id === id ? data : s)),
      selectedService: state.selectedService?.id === id ? data : state.selectedService,
      submitting: false,
    }));
    return true;
  },

  deleteService: async (id) => {
    set({ submitting: true, error: null });
    const { error } = await servicesApi.softDelete(id);
    if (error) {
      set({ submitting: false, error });
      return false;
    }
    set((state) => ({
      myServices: state.myServices.filter((s) => s.id !== id),
      services: state.services.filter((s) => s.id !== id),
      submitting: false,
    }));
    return true;
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  clearSelected: () => set({ selectedService: null }),
  clearError: () => set({ error: null }),
}));