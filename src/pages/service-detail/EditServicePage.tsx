import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useServicesStore } from '@features/services/model/servicesStore';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import type { ServicePriceType } from '@entities/service';
import type { AppStackParams } from '@app/navigation/types';

type NavProp = NativeStackNavigationProp<AppStackParams>;
type RouteType = RouteProp<AppStackParams, 'EditService'>;

type EditFields = {
  titulo: string;
  descripcion: string;
  precio: string;
};

const PRICE_TYPES: { label: string; value: ServicePriceType }[] = [
  { label: 'Precio fijo', value: 'fijo' },
  { label: 'Por hora', value: 'por_hora' },
  { label: 'A convenir', value: 'cotizacion' },
];

export const EditServicePage = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { serviceId } = route.params;
  const { selectedService, fetchServiceById, updateService, deleteService, submitting } = useServicesStore();

  const [priceType, setPriceType] = useState<ServicePriceType>('fijo');

  useEffect(() => {
    fetchServiceById(serviceId);
  }, [serviceId]);

  useEffect(() => {
    if (selectedService) {
      setPriceType(selectedService.tipo_precio ?? 'fijo');
    }
  }, [selectedService]);

  const { values, errors, setValue, touch, validate } = useFormValidation<EditFields>(
    {
      titulo: selectedService?.titulo ?? '',
      descripcion: selectedService?.descripcion ?? '',
      precio: String(selectedService?.precio ?? ''),
    },
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

  const handleSave = async () => {
    if (!validate()) return;
    const ok = await updateService(serviceId, {
      titulo: values.titulo,
      descripcion: values.descripcion,
      precio: priceType === 'cotizacion' ? 0 : Number(values.precio),
      tipo_precio: priceType,
    });
    if (ok) navigation.goBack();
  };

  const handleTogglePause = async () => {
    const newStatus = selectedService?.estado === 'activo' ? 'pausado' : 'activo';
    const ok = await updateService(serviceId, { estado: newStatus });
    if (ok) navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar servicio', '¿Estás seguro? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteService(serviceId);
          if (ok) navigation.goBack();
        },
      },
    ]);
  };

  if (!selectedService) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Editar servicio</Text>

        <Input
          label="Título"
          value={values.titulo}
          onChangeText={(v) => setValue('titulo', v)}
          onBlur={() => touch('titulo')}
          error={errors.titulo}
        />

        <Input
          label="Descripción"
          value={values.descripcion}
          onChangeText={(v) => setValue('descripcion', v)}
          onBlur={() => touch('descripcion')}
          error={errors.descripcion}
          multiline
          numberOfLines={5}
          style={styles.multiline}
        />

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
            value={values.precio}
            onChangeText={(v) => setValue('precio', v)}
            onBlur={() => touch('precio')}
            error={errors.precio}
            keyboardType="numeric"
          />
        )}

        <Button label="Guardar cambios" onPress={handleSave} loading={submitting} style={styles.btn} />

        <Button
          label={selectedService.estado === 'activo' ? 'Pausar servicio' : 'Activar servicio'}
          onPress={handleTogglePause}
          variant="outline"
          style={styles.btn}
        />

        <Button label="Eliminar servicio" onPress={handleDelete} variant="secondary" style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#FFFFFF' },
  scroll:              { padding: 24 },
  title:               { fontSize: 24, fontWeight: '800', color: '#1A1A2E', marginBottom: 24 },
  label:               { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 8 },
  multiline:           { height: 120, textAlignVertical: 'top', paddingTop: 10 },
  priceTypeRow:        { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priceTypeBtn:        { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  priceTypeBtnActive:  { backgroundColor: '#0F3460', borderColor: '#0F3460' },
  priceTypeBtnText:    { fontSize: 12, color: '#374151', fontWeight: '600' },
  priceTypeBtnTextActive: { color: '#FFFFFF' },
  btn:                 { marginBottom: 12 },
});