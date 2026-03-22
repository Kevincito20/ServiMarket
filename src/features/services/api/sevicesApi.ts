import { supabase } from '@shared/lib/supabase';
import type { ServiceWithDetails, CreateServiceParams, UpdateServiceParams } from '@entities/service';

type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const SERVICE_SELECT = `
  *,
  profiles ( id, nombre, avatar_url, rating_promedio, total_reviews ),
  categories ( id, nombre, slug ),
  service_images ( id, url, orden )
`;

export const servicesApi = {
  async getAll(params?: {
    category_slug?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    limit?: number;
    offset?: number;
  }): Promise<ServiceResult<ServiceWithDetails[]>> {
    let query = supabase
      .from('services')
      .select(SERVICE_SELECT)
      .eq('estado', 'activo')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (params?.search) {
      query = query.or(`titulo.ilike.%${params.search}%,descripcion.ilike.%${params.search}%`);
    }
    if (params?.min_price !== undefined) {
      query = query.gte('precio', params.min_price);
    }
    if (params?.max_price !== undefined) {
      query = query.lte('precio', params.max_price);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit ?? 10) - 1);
    }

    const { data, error } = await query;
    if (error) return { data: null, error: error.message };
    return { data: (data as ServiceWithDetails[]), error: null };
  },

  async getById(id: string): Promise<ServiceResult<ServiceWithDetails>> {
    const { data, error } = await supabase
      .from('services')
      .select(SERVICE_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return { data: null, error: 'Servicio no encontrado' };
    return { data: data as ServiceWithDetails, error: null };
  },

  async getByUser(userId: string): Promise<ServiceResult<ServiceWithDetails[]>> {
    const { data, error } = await supabase
      .from('services')
      .select(SERVICE_SELECT)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as ServiceWithDetails[], error: null };
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('nombre');

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  },

  async create(
    userId: string,
    params: CreateServiceParams
  ): Promise<ServiceResult<ServiceWithDetails>> {
    const { imageUris, ...serviceData } = params;

    const { data: service, error } = await supabase
      .from('services')
      .insert({ ...serviceData, user_id: userId })
      .select()
      .single();

    if (error || !service) return { data: null, error: 'Error al crear el servicio' };

    // Subir imágenes si hay
    if (imageUris.length > 0) {
      await servicesApi.uploadImages(service.id, imageUris);
    }

    return servicesApi.getById(service.id);
  },

  async update(
    serviceId: string,
    params: UpdateServiceParams
  ): Promise<ServiceResult<ServiceWithDetails>> {
    const { data, error } = await supabase
      .from('services')
      .update({ ...params, updated_at: new Date().toISOString() })
      .eq('id', serviceId)
      .select()
      .single();

    if (error || !data) return { data: null, error: 'Error al actualizar el servicio' };
    return servicesApi.getById(serviceId);
  },

  async softDelete(serviceId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('services')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', serviceId);

    return { error: error?.message ?? null };
  },

  async uploadImages(serviceId: string, uris: string[]): Promise<void> {
    const uploads = uris.map(async (uri, index) => {
      const ext = uri.split('.').pop() ?? 'jpg';
      const path = `services/${serviceId}/${Date.now()}_${index}.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('service-images')
        .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

      if (!error) {
        const { data } = supabase.storage.from('service-images').getPublicUrl(path);
        await supabase
          .from('service_images')
          .insert({ service_id: serviceId, url: data.publicUrl, orden: index });
      }
    });

    await Promise.all(uploads);
  },
};