import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ServicePriceLabel } from '@shared/ui/ServicePriceLabel';
import type { ServiceWithDetails } from '@entities/service';

type Props = {
  service: ServiceWithDetails;
  onPress: () => void;
};

export const ServiceCard = ({ service, onPress }: Props) => {
  const firstImage = service.service_images?.[0]?.url;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {firstImage ? (
        <Image source={{ uri: firstImage }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.category}>{service.categories?.nombre}</Text>
        <Text style={styles.titulo} numberOfLines={2}>{service.titulo}</Text>

        <View style={styles.footer}>
          <View style={styles.providerRow}>
            {service.profiles?.avatar_url ? (
              <Image source={{ uri: service.profiles.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {service.profiles?.nombre?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.providerName} numberOfLines={1}>
              {service.profiles?.nombre}
            </Text>
          </View>

          <ServicePriceLabel
            price={service.precio ?? 0}
            type={service.tipo_precio ?? 'fijo'}
            style={styles.price}
          />
        </View>

        {(service.profiles?.rating_promedio ?? 0) > 0 && (
          <Text style={styles.rating}>
            ⭐ {Number(service.profiles?.rating_promedio).toFixed(1)}
            {'  '}
            <Text style={styles.ratingCount}>
              ({service.profiles?.total_reviews} reseñas)
            </Text>
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card:                 { backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  image:                { width: '100%', height: 160, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  imagePlaceholder:     { width: '100%', height: 160, backgroundColor: '#F3F4F6', borderTopLeftRadius: 14, borderTopRightRadius: 14, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { color: '#9CA3AF', fontSize: 13 },
  body:                 { padding: 14 },
  category:             { fontSize: 12, color: '#0F3460', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  titulo:               { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 10, lineHeight: 22 },
  footer:               { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerRow:          { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar:               { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
  avatarPlaceholder:    { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E94560', marginRight: 6, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:        { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  providerName:         { fontSize: 13, color: '#6B7280', flex: 1 },
  price:                { fontSize: 14 },
  rating:               { fontSize: 12, color: '#6B7280', marginTop: 8 },
  ratingCount:          { fontSize: 11, color: '#9CA3AF' },
});