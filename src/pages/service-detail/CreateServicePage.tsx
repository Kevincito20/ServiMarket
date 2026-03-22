import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useServicesStore } from '@features/services/model/servicesStore';
import { useAuthStore } from '@features/auth/model/authStore';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import type { ServicePriceType } from '@entities/service';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParams } from '@app/navigation/types';

type Props = NativeStackScreenProps<AppStackParams, 'CreateService'>;

type CreateFields = {
  titulo: string;
  descripcion: string;
  precio: string;
};

const PRICE_TYPES: { label: string; value: ServicePriceType }[] = [
  { label: 'Precio fijo', value: 'fijo' },
  { label: 'Por hora', value: 'por_hora' },
  { label: 'A convenir', value: 'cotizacion' },
];

export const CreateServicePage = ({ navigation }: Props) => {
  const { user } = useAuthStore();
  const { categories, createService, submitting } = useServicesStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceType, setPriceType] = useState<ServicePriceType>('fijo');
  const [images, setImages] = useState<string[]>([]);

  const { values, errors, setValue, touch, validate } = useFormValidation<CreateFields>(
    { titulo: '', descripcion: '', precio: '' },
    {
      titulo: (v) => {
        if (!v) return 'El título es requerido';
        if (v.length < 10) return 'Mínimo 10 caracteres';
      },
      descripcion: (v) => {
        if (!v) return 'La descripción es requerida';
        if (v.length < 30) return 'Mínimo 30 caracteres';
      },
      precio: (v) => {
        if (priceType === 'cotizacion') return undefined;
        if (!v) return 'El precio es requerido';
        if (isNaN(Number(v)) || Number(v) <= 0) return 'Precio inválido';
      },
    }
  );

  const handlePickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Máximo 4 imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }
    if (!validate()) return;
    if (!user?.id) return;

    const ok = await createService(user.id, {
      category_id: selectedCategory,
      titulo: values.titulo,
      descripcion: values.descripcion,
      precio: priceType === 'cotizacion' ? 0 : Number(values.precio),
      tipo_precio: priceType,
      imageUris: images,
    });

    if (ok) {
      Alert.alert('¡Listo!', 'Servicio enviado para revisión', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Publicar servicio</Text>

        {/* Categoría */}
        <Text style={styles.label}>Categoría</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Input
          label="Título"
          placeholder="Ej: Desarrollo de aplicaciones móviles con React Native"
          value={values.titulo}
          onChangeText={(v) => setValue('titulo', v)}
          onBlur={() => touch('titulo')}
          error={errors.titulo}
        />

        <Input
          label="Descripción"
          placeholder="Describe detalladamente qué incluye tu servicio, experiencia, entregables..."
          value={values.descripcion}
          onChangeText={(v) => setValue('descripcion', v)}
          onBlur={() => touch('descripcion')}
          error={errors.descripcion}
          multiline
          numberOfLines={5}
          style={styles.multiline}
        />

        {/* Tipo de precio */}
        <Text style={styles.label}>Tipo de precio</Text>
        <View style={styles.priceTypeRow}>
          {PRICE_TYPES.map((pt) => (
            <TouchableOpacity
              key={pt.value}
              style={[styles.priceTypeBtn, priceType === pt.value && styles.priceTypeBtnActive]}
              onPress={() => setPriceType(pt.value)}
            >
              <Text style={[styles.priceTypeBtnText, priceType === pt.value && styles.priceTypeBtnTextActive]}>
                {pt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {priceType !== 'cotizacion' && (
          <Input
            label="Precio (COP)"
            placeholder="Ej: 150000"
            value={values.precio}
            onChangeText={(v) => setValue('precio', v)}
            onBlur={() => touch('precio')}
            error={errors.precio}
            keyboardType="numeric"
          />
        )}

        {/* Imágenes */}
        <Text style={styles.label}>Imágenes (máx. 4)</Text>
        <View style={styles.imagesRow}>
          {images.map((uri, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
            >
              <Image source={{ uri }} style={styles.thumb} />
              <View style={styles.removeThumb}>
                <Text style={styles.removeThumbText}>✕</Text>
              </View>
            </TouchableOpacity>
          ))}
          {images.length < 4 && (
            <TouchableOpacity style={styles.addImage} onPress={handlePickImage}>
              <Text style={styles.addImageText}>+ Foto</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          label="Publicar servicio"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#FFFFFF' },
  scroll:              { padding: 24 },
  title:               { fontSize: 24, fontWeight: '800', color: '#1A1A2E', marginBottom: 24 },
  label:               { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 8 },
  chipsRow:            { marginBottom: 16 },
  chip:                { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  chipActive:          { backgroundColor: '#E94560', borderColor: '#E94560' },
  chipText:            { fontSize: 13, color: '#374151', fontWeight: '600' },
  chipTextActive:      { color: '#FFFFFF' },
  multiline:           { height: 120, textAlignVertical: 'top', paddingTop: 10 },
  priceTypeRow:        { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priceTypeBtn:        { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  priceTypeBtnActive:  { backgroundColor: '#0F3460', borderColor: '#0F3460' },
  priceTypeBtnText:    { fontSize: 12, color: '#374151', fontWeight: '600' },
  priceTypeBtnTextActive: { color: '#FFFFFF' },
  imagesRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  thumb:               { width: 80, height: 80, borderRadius: 10 },
  removeThumb:         { position: 'absolute', top: -6, right: -6, backgroundColor: '#E94560', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  removeThumbText:     { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  addImage:            { width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  addImageText:        { color: '#9CA3AF', fontWeight: '600' },
  btn:                 { marginTop: 8 },
});