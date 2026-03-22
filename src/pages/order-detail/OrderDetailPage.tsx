import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrdersStore } from '@features/orders/model/ordersStore';
import { useAuthStore } from '@features/auth/model/authStore';
import { Button } from '@shared/ui/Button';
import type { AppStackParams } from '@app/navigation/types';
import type { OrderStatus } from '@entities/orders';

type NavProp = NativeStackNavigationProp<AppStackParams>;
type RouteType = RouteProp<AppStackParams, 'OrderDetail'>;

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pendiente:    { label: 'Pendiente',     color: '#F59E0B', bg: '#FEF3C7' },
  aceptada:     { label: 'Aceptada',      color: '#6366F1', bg: '#EEF2FF' },
  en_progreso:  { label: 'En progreso',   color: '#3B82F6', bg: '#EFF6FF' },
  completada:   { label: 'Completada',    color: '#10B981', bg: '#D1FAE5' },
  cancelada:    { label: 'Cancelada',     color: '#EF4444', bg: '#FEE2E2' },
  en_disputa:   { label: 'En disputa',    color: '#E94560', bg: '#FEE2E2' },
};

export const OrderDetailPage = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { orderId } = route.params;

  const { user } = useAuthStore();
  const { selectedOrder, loadingDetail, submitting, fetchOrderById, updateStatus, clearSelected } = useOrdersStore();

  useEffect(() => {
    fetchOrderById(orderId);
    return () => clearSelected();
  }, [orderId]);

  const handleAction = (status: OrderStatus, message: string) => {
    Alert.alert('Confirmar', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => updateStatus(orderId, status) },
    ]);
  };

  if (loadingDetail || !selectedOrder) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E94560" />
      </View>
    );
  }

  const isCliente = user?.id === selectedOrder.cliente_id;
  const isProveedor = user?.id === selectedOrder.proveedor_id;
  const status = STATUS_CONFIG[selectedOrder.estado ?? 'pendiente'];
  const otherUser = isCliente ? selectedOrder.proveedor : selectedOrder.cliente;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Estado */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>

        {/* Servicio */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Servicio</Text>
          <Text style={styles.cardValue}>{selectedOrder.services?.titulo}</Text>
        </View>

        {/* Contraparte */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{isCliente ? 'Proveedor' : 'Cliente'}</Text>
          <View style={styles.userRow}>
            {otherUser?.avatar_url ? (
              <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {otherUser?.nombre?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.userName}>{otherUser?.nombre}</Text>
          </View>
        </View>

        {/* Monto */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Precio final</Text>
          <Text style={styles.precio}>${selectedOrder.precio_final?.toLocaleString('es-CO')}</Text>
          {isProveedor && (
            <Text style={styles.montoProveedor}>
              Recibes: ${Number(selectedOrder.monto_proveedor)?.toLocaleString('es-CO')} (después de comisión 10%)
            </Text>
          )}
        </View>

        {/* Notas */}
        {selectedOrder.notas_cliente ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Notas del cliente</Text>
            <Text style={styles.cardValue}>{selectedOrder.notas_cliente}</Text>
          </View>
        ) : null}

        {/* Acciones según rol y estado */}
        {isProveedor && selectedOrder.estado === 'pendiente' && (
          <>
            <Button label="Aceptar orden" onPress={() => handleAction('aceptada', '¿Aceptar esta orden?')} loading={submitting} style={styles.btn} />
            <Button label="Rechazar" onPress={() => handleAction('cancelada', '¿Rechazar esta orden?')} variant="outline" style={styles.btn} />
          </>
        )}

        {isProveedor && selectedOrder.estado === 'aceptada' && (
          <Button label="Marcar en progreso" onPress={() => handleAction('en_progreso', '¿Iniciar el servicio?')} loading={submitting} style={styles.btn} />
        )}

        {isProveedor && selectedOrder.estado === 'en_progreso' && (
          <Button label="Marcar como completado" onPress={() => handleAction('completada', '¿Marcar este servicio como completado?')} loading={submitting} style={styles.btn} />
        )}

        {isCliente && selectedOrder.estado === 'completada' && (
          <Button
            label="Dejar reseña"
            onPress={() => navigation.navigate('CreateReview', { orderId })}
            style={styles.btn}
          />
        )}

        {(selectedOrder.estado === 'pendiente' || selectedOrder.estado === 'aceptada') && (
          <Button label="Cancelar orden" onPress={() => handleAction('cancelada', '¿Cancelar esta orden?')} variant="outline" style={styles.btn} />
        )}

        <Button
          label="Ver chat"
          onPress={() => navigation.navigate('Chat', { orderId })}
          variant="secondary"
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#FFFFFF' },
  centered:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:            { padding: 24 },
  statusBanner:      { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 20 },
  statusText:        { fontSize: 16, fontWeight: '800' },
  card:              { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardLabel:         { fontSize: 12, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
  cardValue:         { fontSize: 15, color: '#1A1A2E', fontWeight: '600' },
  userRow:           { flexDirection: 'row', alignItems: 'center' },
  avatar:            { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E94560', marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:     { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  userName:          { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  precio:            { fontSize: 22, fontWeight: '800', color: '#E94560' },
  montoProveedor:    { fontSize: 12, color: '#6B7280', marginTop: 4 },
  btn:               { marginBottom: 12 },
});