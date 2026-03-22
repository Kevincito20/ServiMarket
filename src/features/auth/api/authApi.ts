import { supabase } from '@shared/lib/supabase';
import type { Profile } from '@entities/user';

type RegisterParams = {
  email: string;
  password: string;
  nombre: string;
};

type LoginParams = {
  email: string;
  password: string;
};

type AuthResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export const authApi = {
  async register({ email, password, nombre }: RegisterParams): Promise<AuthResult<Profile>> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: nombre },
      },
    });

    if (error || !data.user) {
      return { data: null, error: error?.message ?? 'Error al registrarse' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return { data: null, error: 'Error al obtener el perfil' };
    }

    return { data: profile, error: null };
  },

  async login({ email, password }: LoginParams): Promise<AuthResult<Profile>> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { data: null, error: error?.message ?? 'Error al iniciar sesión' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return { data: null, error: 'Error al obtener el perfil' };
    }

    return { data: profile, error: null };
  },

  async loginWithGoogle(): Promise<AuthResult<null>> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getProfile(userId: string): Promise<AuthResult<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return { data: null, error: 'Perfil no encontrado' };
    return { data, error: null };
  },
};