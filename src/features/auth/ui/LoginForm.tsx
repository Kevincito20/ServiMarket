import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import { useAuthStore } from '../model/authStore';

type Props = {
  onSuccess: () => void;
  onGoToRegister: () => void;
};

type LoginFields = {
  email: string;
  password: string;
};

export const LoginForm = ({ onSuccess, onGoToRegister }: Props) => {
  const { login, loginWithGoogle, error, clearError, status } = useAuthStore();
  const loading = status === 'loading';

  const { values, errors, setValue, touch, validate } = useFormValidation<LoginFields>(
    { email: '', password: '' },
    {
      email: (v) => {
        if (!v) return 'El email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email inválido';
      },
      password: (v) => {
        if (!v) return 'La contraseña es requerida';
        if (v.length < 6) return 'Mínimo 6 caracteres';
      },
    }
  );

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;
    const ok = await login(values.email, values.password);
    if (ok) onSuccess();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

      {error ? <Text style={styles.globalError}>{error}</Text> : null}

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

      <Button
        label="Iniciar sesión"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      />

      <Button
        label="Continuar con Google"
        onPress={loginWithGoogle}
        variant="outline"
        style={styles.button}
      />

      <Text style={styles.footer}>
        ¿No tienes cuenta?{' '}
        <Text style={styles.link} onPress={onGoToRegister}>
          Regístrate
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
  button:      { marginBottom: 12 },
  footer:      { textAlign: 'center', color: '#6B7280', marginTop: 8 },
  link:        { color: '#E94560', fontWeight: '700' },
});