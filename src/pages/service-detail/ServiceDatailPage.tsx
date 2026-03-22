import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServicesStore } from '@features/services/model/servicesStore';
import { useAuthStore } from '@features/auth/model/authStore';
import { ServicePriceLabel } from '@shared/ui/ServicePriceLabel';
import { Button } from '@shared/ui/Button';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParams } from '@app/navigation/types';

type Props = NativeStackScreenProps<AppStackParams, 'ServiceDetail'>;

export const ServiceDetailPage = ({ route, navigation }: Props) => {
  const { serviceId } = route.params;
  const { selectedService, loadingDetail, fetchServiceById, clearSelected } = useServicesStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchServiceById(serviceId);
    return () => clearSelected();
  }, [serviceId]);

  if (loadingDetail || !selectedService) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E94560" />
      </View>
    );
  }

  const isOwner = user?.id === selectedService.user_id;
  const images = selectedService.service_images ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* Imagen principal */}
        {images[0] ? (
          <Image source={{ uri: images[0].url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
          </View>
        )}

        <View style={styles.body}>
          {/* Categoría y título */}
          <Text style={styles.category}>{selectedService.categories?.nombre}</Text>
          <Text style={styles.titulo}>{selectedService.titulo}</Text>

          {/* Precio */}
          <ServicePriceLabel
            price={selectedService.precio ?? 0}
            type={selectedService.tipo_precio ?? 'fijo'}
            style={styles.precio}
          />

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descripcion}>{selectedService.descripcion}</Text>

          {/* Proveedor */}
          <Text style={styles.sectionTitle}>Proveedor</Text>
          <View style={styles.providerCard}>
            {selectedService.profiles?.avatar_url ? (
              <Image
                source={{ uri: selectedService.profiles.avatar_url }}
                style={styles.providerAvatar}
              />
            ) : (
              <View style={styles.providerAvatarPlaceholder}>
                <Text style={styles.providerAvatarInitial}>
                  {selectedService.profiles?.nombre?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{selectedService.profiles?.nombre}</Text>
              {(selectedService.profiles?.rating_promedio ?? 0) > 0 && (
                <Text style={styles.providerRating}>
                  ⭐ {Number(selectedService.profiles?.rating_promedio).toFixed(1)}
                  {'  '}({selectedService.profiles?.total_reviews} reseñas)
                </Text>
              )}
            </View>
          </View>

          {/* Acciones */}
          {isOwner ? (
            <Button
              label="Editar servicio"
              onPress={() => navigation.navigate('EditService', { serviceId })}
              variant="outline"
              style={styles.btn}
            />
          ) : (
            <Button
              label="Contratar servicio"
              onPress={() => navigation.navigate('CreateOrder', { serviceId })}
              style={styles.btn}
            />
          )}
        </View>
      </ScrollView>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:                { flex: 1, backgroundColor: '#FFFFFF' },
  centered:                 { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image:                    { width: '100%', height: 240 },
  imagePlaceholder:         { width: '100%', height: 240, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText:     { color: '#9CA3AF' },
  body:                     { padding: 20 },
  category:                 { fontSize: 12, color: '#0F3460', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  titulo:                   { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  precio:                   { fontSize: 20, marginBottom: 20 },
  sectionTitle:             { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 8, marginTop: 16 },
  descripcion:              { fontSize: 15, color: '#374151', lineHeight: 24 },
  providerCard:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14 },
  providerAvatar:           { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  providerAvatarPlaceholder:{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E94560', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  providerAvatarInitial:    { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  providerInfo:             { flex: 1 },
  providerName:             { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  providerRating:           { fontSize: 13, color: '#6B7280', marginTop: 2 },
  btn:                      { marginTop: 24 },
  backBtn:                  { position: 'absolute', top: 52, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  backBtnText:              { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});