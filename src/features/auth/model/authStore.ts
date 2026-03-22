import { create } from 'zustand';
import { supabase } from '@shared/lib/supabase';
import { authApi } from '../api/authApi';
import type { AuthUser, AuthStatus, Profile } from '@entities/user';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
};

type AuthActions = {
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nombre: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  _setUser: (profile: Profile, email: string | undefined) => void;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  status: 'loading',
  error: null,

  _setUser: (profile, email) => {
    set({
      user: { id: profile.id, email, profile },
      status: 'authenticated',
      error: null,
    });
  },

  initialize: async () => {
    const session = await authApi.getSession();

    if (!session?.user) {
      set({ status: 'unauthenticated', user: null });
      return;
    }

    const { data: profile, error } = await authApi.getProfile(session.user.id);

    if (error || !profile) {
      set({ status: 'unauthenticated', user: null });
      return;
    }

    get()._setUser(profile, session.user.email);

    // Escuchar cambios de sesión en tiempo real
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT' || !newSession) {
        set({ user: null, status: 'unauthenticated', error: null });
        return;
      }

      if (event === 'SIGNED_IN' && newSession.user) {
        const { data: updatedProfile } = await authApi.getProfile(newSession.user.id);
        if (updatedProfile) {
          get()._setUser(updatedProfile, newSession.user.email);
        }
      }
    });
  },

  login: async (email, password) => {
    set({ error: null });
    const { data, error } = await authApi.login({ email, password });

    if (error || !data) {
      set({ error });
      return false;
    }

    get()._setUser(data, email);
    return true;
  },

  register: async (email, password, nombre) => {
    set({ error: null });
    const { data, error } = await authApi.register({ email, password, nombre });

    if (error || !data) {
      set({ error });
      return false;
    }

    get()._setUser(data, email);
    return true;
  },

  loginWithGoogle: async () => {
    set({ error: null });
    const { error } = await authApi.loginWithGoogle();

    if (error) {
      set({ error });
      return false;
    }

    return true;
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, status: 'unauthenticated', error: null });
  },

  clearError: () => set({ error: null }),
}));