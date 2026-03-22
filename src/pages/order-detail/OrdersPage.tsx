import { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrdersStore } from '@features/orders/model/ordersStore';
import { useAuthStore } from '@features/auth/model/authStore';
import type { AppStackParams } from '@app/navigation/types';
import type { OrderWithDetails, OrderStatus } from '@entities/orders';

type NavProp = NativeStackNavigationProp<AppStackParams>;

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pendiente:   { label: 'Pendiente',   color: '#F59E0B' },
  aceptada:    { label: 'Aceptada',    color: '#6366F1' },
  en_progreso: { label: 'En progreso', color: '#3B82F6' },
  completada:  { label: 'Completada',  color: '#10B981' },
  cancelada:   { label: 'Cancelada',   color: '#EF4444' },
  en_disputa:  { label: 'En disputa',  color: '#E94560' },
};

const OrderItem = ({
  item,
  userId,
  onPress,
}: {
  item: OrderWithDetails;
  userId: string;
  onPress: () => void;
}) => {
  const isCliente = item.cliente_id === userId;
  const otherUser = isCliente ? item.proveedor : item.cliente;
  const status = STATUS_CONFIG[item.estado ?? 'pendiente'];

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.itemHeader}>
        {otherUser?.avatar_url ? (
          <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{otherUser?.nombre?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitulo} numberOfLines={1}>{item.services?.titulo}</Text>
          <Text style={styles.itemUser}>{isCliente ? 'Proveedor' : 'Cliente'}: {otherUser?.nombre}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
      </View>
      <View style={styles.itemFooter}>
        <Text style={[styles.itemStatus, { color: status.color }]}>{status.label}</Text>
        <Text style={styles.itemPrecio}>${item.precio_final?.toLocaleString('es-CO')}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const OrdersPage = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { orders, loading, fetchMyOrders } = useOrdersStore();

  useEffect(() => {
    if (user?.id) fetchMyOrders(user.id);
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Mis órdenes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#E94560" style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderItem
              item={item}
              userId={user?.id ?? ''}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No tienes órdenes aún</Text>
              <Text style={styles.emptySubtext}>Cuando contrates o recibas servicios, aparecerán aquí</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F9FAFB' },
  title:             { fontSize: 22, fontWeight: '800', color: '#1A1A2E', paddingHorizontal: 20, paddingVertical: 16 },
  loader:            { marginTop: 60 },
  list:              { padding: 20, gap: 12 },
  item:              { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  itemHeader:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar:            { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E94560', marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:     { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  itemInfo:          { flex: 1 },
  itemTitulo:        { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  itemUser:          { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusDot:         { width: 10, height: 10, borderRadius: 5 },
  itemFooter:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemStatus:        { fontSize: 13, fontWeight: '600' },
  itemPrecio:        { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  empty:             { alignItems: 'center', marginTop: 80 },
  emptyText:         { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  emptySubtext:      { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});