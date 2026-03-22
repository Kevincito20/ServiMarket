import { supabase } from '@shared/lib/supabase';
import type { OrderWithDetails, CreateOrderParams, OrderStatus } from '@entities/orders';

type OrderResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const ORDER_SELECT = `
  *,
  services ( id, titulo, tipo_precio ),
  cliente:profiles!orders_cliente_id_fkey ( id, nombre, avatar_url ),
  proveedor:profiles!orders_proveedor_id_fkey ( id, nombre, avatar_url )
`;

export const ordersApi = {
  async getMyOrders(userId: string): Promise<OrderResult<OrderWithDetails[]>> {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .or(`cliente_id.eq.${userId},proveedor_id.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as OrderWithDetails[], error: null };
  },

  async getById(orderId: string): Promise<OrderResult<OrderWithDetails>> {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderId)
      .single();

    if (error || !data) return { data: null, error: 'Orden no encontrada' };
    return { data: data as OrderWithDetails, error: null };
  },

  async create(userId: string, params: CreateOrderParams): Promise<OrderResult<OrderWithDetails>> {
    const { data, error } = await supabase
      .from('orders')
      .insert({ ...params, cliente_id: userId })
      .select()
      .single();

    if (error || !data) return { data: null, error: 'Error al crear la orden' };
    return ordersApi.getById(data.id);
  },

  async updateStatus(orderId: string, estado: OrderStatus): Promise<OrderResult<OrderWithDetails>> {
    const extra: Record<string, string> = {};
    if (estado === 'completada') extra.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update({ estado, ...extra })
      .eq('id', orderId);

    if (error) return { data: null, error: error.message };
    return ordersApi.getById(orderId);
  },
};