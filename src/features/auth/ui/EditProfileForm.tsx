import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import { useProfileStore } from '../model/profileStore';
import type { Profile } from '@entities/user';

type Props = {
  profile: Profile;
  onSuccess: () => void;
  onCancel: () => void;
};

type EditFields = {
  nombre: string;
  bio: string;
  ciudad: string;
};

export const EditProfileForm = ({ profile, onSuccess, onCancel }: Props) => {
  const { updateProfile, updating, error } = useProfileStore();

  const { values, errors, setValue, touch, validate } = useFormValidation<EditFields>(
    {
      nombre: profile.nombre ?? '',
      bio: profile.bio ?? '',
      ciudad: profile.ciudad ?? '',
    },
    {
      nombre: (v) => {
        if (!v) return 'El nombre es requerido';
        if (v.length < 3) return 'Mínimo 3 caracteres';
      },
    }
  );

  const handleSave = async () => {
    if (!validate()) return;
    const ok = await updateProfile(values);
    if (ok) onSuccess();
    else Alert.alert('Error', error ?? 'No se pudo actualizar el perfil');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar perfil</Text>

      <Input
        label="Nombre completo"
        value={values.nombre}
        onChangeText={(v) => setValue('nombre', v)}
        onBlur={() => touch('nombre')}
        error={errors.nombre}
      />

      <Input
        label="Bio"
        value={values.bio}
        onChangeText={(v) => setValue('bio', v)}
        placeholder="Cuéntanos sobre ti..."
        multiline
        numberOfLines={3}
        style={styles.multiline}
      />

      <Input
        label="Ciudad"
        value={values.ciudad}
        onChangeText={(v) => setValue('ciudad', v)}
        placeholder="Ej: Bogotá, Colombia"
      />

      <Button label="Guardar cambios" onPress={handleSave} loading={updating} style={styles.btn} />
      <Button label="Cancelar" onPress={onCancel} variant="outline" style={styles.btn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24 },
  title:     { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 24 },
  multiline: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  btn:       { marginBottom: 12 },
});