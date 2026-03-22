import { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useServicesStore } from '@features/services/model/servicesStore';
import { useAuthStore } from '@features/auth/model/authStore';
import { ServicePriceLabel } from '@shared/ui/ServicePriceLabel';
import { Button } from '@shared/ui/Button';
import type { AppStackParams } from '@app/navigation/types';
import type { ServiceWithDetails } from '@entities/service';

type NavProp = NativeStackNavigationProp<AppStackParams>;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  activo:              { label: 'Activo',            color: '#10B981' },
  pausado:             { label: 'Pausado',            color: '#F59E0B' },
  pendiente_revision:  { label: 'En revisión',        color: '#6366F1' },
  rechazado:           { label: 'Rechazado',          color: '#EF4444' },
};

const MyServiceItem = ({ item, onPress }: { item: ServiceWithDetails; onPress: () => void }) => {
  const status = STATUS_LABELS[item.estado ?? 'activo'];

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitulo} numberOfLines={2}>{item.titulo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.itemCategory}>{item.categories?.nombre}</Text>
      <ServicePriceLabel
        price={item.precio ?? 0}
        type={item.tipo_precio ?? 'fijo'}
        style={styles.itemPrice}
      />
    </TouchableOpacity>
  );
};

export const MyServicesPage = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { myServices, loading, fetchMyServices } = useServicesStore();

  useEffect(() => {
    if (user?.id) fetchMyServices(user.id);
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis servicios</Text>
        <Button
          label="+ Publicar"
          onPress={() => navigation.navigate('CreateService')}
          style={styles.createBtn}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E94560" style={styles.loader} />
      ) : (
        <FlatList
          data={myServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MyServiceItem
              item={item}
              onPress={() => navigation.navigate('EditService', { serviceId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No tienes servicios publicados</Text>
              <Text style={styles.emptySubtext}>Publica tu primer servicio y empieza a recibir clientes</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F9FAFB' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  title:        { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  createBtn:    { height: 38, paddingHorizontal: 16 },
  loader:       { marginTop: 60 },
  list:         { padding: 20, gap: 12 },
  item:         { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  itemHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  itemTitulo:   { fontSize: 15, fontWeight: '700', color: '#1A1A2E', flex: 1, marginRight: 8 },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:   { fontSize: 12, fontWeight: '700' },
  itemCategory: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  itemPrice:    { fontSize: 14 },
  empty:        { alignItems: 'center', marginTop: 80 },
  emptyText:    { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});