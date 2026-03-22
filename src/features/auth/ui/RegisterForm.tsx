import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import { useAuthStore } from '../model/authStore';

type Props = {
  onSuccess: () => void;
  onGoToLogin: () => void;
};

type RegisterFields = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const RegisterForm = ({ onSuccess, onGoToLogin }: Props) => {
  const { register, error, clearError, status } = useAuthStore();
  const loading = status === 'loading';

  const { values, errors, setValue, touch, validate } = useFormValidation<RegisterFields>(
    { nombre: '', email: '', password: '', confirmPassword: '' },
    {
      nombre: (v) => {
        if (!v) return 'El nombre es requerido';
        if (v.length < 3) return 'Mínimo 3 caracteres';
      },
      email: (v) => {
        if (!v) return 'El email es requerido';
        //if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email inválido';
      },
      password: (v) => {
        if (!v) return 'La contraseña es requerida';
        if (v.length < 6) return 'Mínimo 6 caracteres';
      },
      confirmPassword: (v) => {
        if (!v) return 'Confirma tu contraseña';
        if (v !== values.password) return 'Las contraseñas no coinciden';
      },
    }
  );

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    const ok = await register(values.email, values.password, values.nombre);
    if (ok) onSuccess();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Únete a ServiMarket</Text>

      {error ? <Text style={styles.globalError}>{error}</Text> : null}

      <Input
        label="Nombre completo"
        placeholder="Juan Pérez"
        value={values.nombre}
        onChangeText={(v) => setValue('nombre', v)}
        onBlur={() => touch('nombre')}
        error={errors.nombre}
      />

      <Input
        label="Email"
        placeholder="tucorreo@email.com"
        value={values.email}
        onChangeText={(v) => setValue('email', v)}
        onBlur={() => touch('email')}
        error={errors.email}
        keyboardType="email-address"
      />

      <Input
        label="Contraseña"
        placeholder="••••••••"
        value={values.password}
        onChangeText={(v) => setValue('password', v)}
        onBlur={() => touch('password')}
        error={errors.password}
        isPassword
      />

      <Input
        label="Confirmar contraseña"
        placeholder="••••••••"
        value={values.confirmPassword}
        onChangeText={(v) => setValue('confirmPassword', v)}
        onBlur={() => touch('confirmPassword')}
        error={errors.confirmPassword}
        isPassword
      />

      <Button
        label="Crear cuentaeeeeeeee"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
      />

      <Text style={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Text style={styles.link} onPress={onGoToLogin}>
          Inicia sesión
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 24, justifyContent: 'center' },
  title:       { fontSize: 28, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  subtitle:    { fontSize: 15, color: '#6B7280', marginBottom: 32 },
  globalError: { backgroundColor: '#FEE2E2', color: '#E94560', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  button:      { marginBottom: 12, backgroundColor: '#000000ff' },
  footer:      { textAlign: 'center', color: '#6B7280', marginTop: 8 },
  link:        { color: '#E94560', fontWeight: '700' },
});