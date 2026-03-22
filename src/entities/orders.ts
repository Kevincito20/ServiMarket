import type { Database } from './database.types';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderStatus = Database['public']['Enums']['order_status'];

export type OrderWithDetails = Order & {
  services: {
    id: string;
    titulo: string;
    tipo_precio: string;
  };
  cliente: {
    id: string;
    nombre: string;
    avatar_url: string | null;
  };
  proveedor: {
    id: string;
    nombre: string;
    avatar_url: string | null;
  };
};

export type CreateOrderParams = {
  service_id: string;
  proveedor_id: string;
  precio_final: number;
  notas_cliente?: string;
};