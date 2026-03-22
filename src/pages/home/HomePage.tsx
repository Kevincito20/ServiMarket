import { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServicesStore } from '@features/services/model/servicesStore';
import { useAuthStore } from '@features/auth/model/authStore';
import { ServiceCard } from '@widgets/ServiceCard/ServiceCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParams } from '@app/navigation/types';

type NavProp = NativeStackNavigationProp<AppStackParams>;

export const HomePage = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const {
    services,
    categories,
    loading,
    searchQuery,
    fetchServices,
    fetchCategories,
    setSearchQuery,
  } = useServicesStore();

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    fetchServices({ search: text });
  }, []);

  const handleCategoryPress = (slug: string) => {
    fetchServices({ category_slug: slug });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.profile?.nombre?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>¿Qué servicio necesitas hoy?</Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.search}
          placeholder="Buscar servicios..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Categorías */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        <TouchableOpacity
          style={styles.categoryChip}
          onPress={() => fetchServices()}
        >
          <Text style={styles.categoryChipText}>Todos</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryChip}
            onPress={() => handleCategoryPress(cat.slug)}
          >
            <Text style={styles.categoryChipText}>{cat.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color="#E94560" style={styles.loader} />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay servicios disponibles</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F9FAFB' },
  header:           { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  greeting:         { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  subtitle:         { fontSize: 14, color: '#6B7280', marginTop: 2 },
  searchWrapper:    { paddingHorizontal: 20, marginBottom: 12 },
  search:           { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, height: 46, fontSize: 15, color: '#1A1A2E', borderWidth: 1, borderColor: '#E5E7EB' },
  categoriesRow:    { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  categoryChip:     { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryChipText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  loader:           { marginTop: 60 },
  list:             { paddingHorizontal: 20, paddingBottom: 20 },
  empty:            { textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 15 },
});