import { supabase } from '@shared/lib/supabase';
import type { Profile } from '@entities/user';

type UpdateProfileParams = {
  nombre?: string;
  bio?: string;
  ciudad?: string;
  avatar_url?: string;
};

type ProfileResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export const profileApi = {
  async getById(userId: string): Promise<ProfileResult<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return { data: null, error: 'Perfil no encontrado' };
    return { data, error: null };
  },

  async update(userId: string, params: UpdateProfileParams): Promise<ProfileResult<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...params, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) return { data: null, error: 'Error al actualizar el perfil' };
    return { data, error: null };
  },

  async uploadAvatar(userId: string, uri: string): Promise<ProfileResult<string>> {
    const ext = uri.split('.').pop() ?? 'jpg';
    const path = `avatars/${userId}.${ext}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

    if (error) return { data: null, error: 'Error al subir la imagen' };

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return { data: data.publicUrl, error: null };
  },
};