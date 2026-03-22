import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrdersStore } from '@features/orders/model/ordersStore';
import { useServicesStore } from '@features/services/model/servicesStore';
import { useAuthStore } from '@features/auth/model/authStore';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { ServicePriceLabel } from '@shared/ui/ServicePriceLabel';
import type { AppStackParams } from '@app/navigation/types';

type NavProp = NativeStackNavigationProp<AppStackParams>;
type RouteType = RouteProp<AppStackParams, 'CreateOrder'>;

export const CreateOrderPage = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { serviceId } = route.params;

  const { user } = useAuthStore();
  const { selectedService, fetchServiceById } = useServicesStore();
  const { createOrder, submitting } = useOrdersStore();
  const [notas, setNotas] = useState('');
  const [precio, setPrecio] = useState('');

  useEffect(() => {
    fetchServiceById(serviceId);
  }, [serviceId]);

  const handleConfirm = async () => {
    if (!user?.id || !selectedService) return;

    const precioFinal =
      selectedService.tipo_precio === 'cotizacion'
        ? Number(precio)
        : selectedService.precio ?? 0;

    if (selectedService.tipo_precio === 'cotizacion' && (!precio || isNaN(precioFinal) || precioFinal <= 0)) {
      Alert.alert('Error', 'Ingresa un precio válido para la cotización');
      return;
    }

    const orderId = await createOrder(user.id, {
      service_id: serviceId,
      proveedor_id: selectedService.user_id,
      precio_final: precioFinal,
      notas_cliente: notas,
    });

    if (orderId) {
      Alert.alert('¡Orden creada!', 'Tu solicitud fue enviada al proveedor.', [
        { text: 'Ver orden', onPress: () => navigation.navigate('OrderDetail', { orderId }) },
      ]);
    }
  };

  if (!selectedService) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Confirmar contratación</Text>

        {/* Resumen del servicio */}
        <View style={styles.serviceCard}>
          <Text style={styles.serviceLabel}>Servicio</Text>
          <Text style={styles.serviceTitulo}>{selectedService.titulo}</Text>
          <Text style={styles.serviceProvider}>Por {selectedService.profiles?.nombre}</Text>
          <ServicePriceLabel
            price={selectedService.precio ?? 0}
            type={selectedService.tipo_precio ?? 'fijo'}
            style={styles.servicePrice}
          />
        </View>

        {/* Precio si es cotización */}
        {selectedService.tipo_precio === 'cotizacion' && (
          <Input
            label="Precio acordado (COP)"
            placeholder="Ingresa el monto acordado con el proveedor"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
          />
        )}

        {/* Notas */}
        <Input
          label="Notas para el proveedor (opcional)"
          placeholder="Describe detalles adicionales, horarios, requerimientos especiales..."
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />

        {/* Resumen de pago */}
        <View style={styles.paymentSummary}>
          <Text style={styles.paymentTitle}>Resumen de pago</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Servicio</Text>
            <ServicePriceLabel
              price={selectedService.tipo_precio === 'cotizacion' ? Number(precio) || 0 : selectedService.precio ?? 0}
              type={selectedService.tipo_precio === 'cotizacion' ? 'fijo' : selectedService.tipo_precio ?? 'fijo'}
            />
          </View>
          <View style={styles.paymentDivider} />
          <Text style={styles.paymentNote}>
            El pago se retiene de forma segura hasta que confirmes la entrega del servicio.
          </Text>
        </View>

        <Button
          label="Confirmar y enviar solicitud"
          onPress={handleConfirm}
          loading={submitting}
          style={styles.btn}
        />
        <Button
          label="Cancelar"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FFFFFF' },
  scroll:         { padding: 24 },
  title:          { fontSize: 24, fontWeight: '800', color: '#1A1A2E', marginBottom: 24 },
  serviceCard:    { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 20 },
  serviceLabel:   { fontSize: 12, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  serviceTitulo:  { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  serviceProvider:{ fontSize: 13, color: '#6B7280', marginBottom: 8 },
  servicePrice:   { fontSize: 16 },
  multiline:      { height: 100, textAlignVertical: 'top', paddingTop: 10 },
  paymentSummary: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 24 },
  paymentTitle:   { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  paymentRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentLabel:   { fontSize: 14, color: '#374151' },
  paymentDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  paymentNote:    { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  btn:            { marginBottom: 12 },
});