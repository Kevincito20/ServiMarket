import type { Database } from './database.types';

export type Service = Database['public']['Tables']['services']['Row'];
export type ServiceImage = Database['public']['Tables']['service_images']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

export type ServicePriceType = Database['public']['Enums']['service_price_type'];
export type ServiceStatus = Database['public']['Enums']['service_status'];

export type ServiceWithDetails = Service & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'nombre' | 'avatar_url' | 'rating_promedio' | 'total_reviews'>;
  categories: Pick<Category, 'id' | 'nombre' | 'slug'>;
  service_images: ServiceImage[];
};

export type CreateServiceParams = {
  category_id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  tipo_precio: ServicePriceType;
  imageUris: string[];
};

export type UpdateServiceParams = Partial<Omit<CreateServiceParams, 'imageUris'>> & {
  estado?: ServiceStatus;
};