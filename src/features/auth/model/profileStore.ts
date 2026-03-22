import { create } from 'zustand';
import { profileApi } from '../api/profileApi';
import { useAuthStore } from './authStore';
import type { Profile } from '@entities/user';

type ProfileState = {
  viewedProfile: Profile | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
};

type ProfileActions = {
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (params: { nombre?: string; bio?: string; ciudad?: string }) => Promise<boolean>;
  uploadAvatar: (uri: string) => Promise<boolean>;
  clearError: () => void;
};

type ProfileStore = ProfileState & ProfileActions;

export const useProfileStore = create<ProfileStore>((set) => ({
  viewedProfile: null,
  loading: false,
  updating: false,
  error: null,

  fetchProfile: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await profileApi.getById(userId);
    set({ viewedProfile: data, loading: false, error });
  },

  updateProfile: async (params) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return false;

    set({ updating: true, error: null });
    const { data, error } = await profileApi.update(userId, params);

    if (error || !data) {
      set({ updating: false, error });
      return false;
    }

    // Actualizar también el store de auth con el perfil nuevo
    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, profile: data } : null,
    }));

    set({ updating: false });
    return true;
  },

  uploadAvatar: async (uri) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return false;

    set({ updating: true, error: null });
    const { data: url, error: uploadError } = await profileApi.uploadAvatar(userId, uri);

    if (uploadError || !url) {
      set({ updating: false, error: uploadError });
      return false;
    }

    const { data, error } = await profileApi.update(userId, { avatar_url: url });

    if (error || !data) {
      set({ updating: false, error });
      return false;
    }

    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, profile: data } : null,
    }));

    set({ updating: false });
    return true;
  },

  clearError: () => set({ error: null }),
}));