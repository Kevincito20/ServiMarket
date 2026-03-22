import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegisterForm } from '@features/auth/ui/RegisterForm';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParams } from '@app/navigation/types';

type Props = NativeStackScreenProps<AuthStackParams, 'Register'>;

export const RegisterPage = ({ navigation }: Props) => (
  <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
    <RegisterForm
      onSuccess={() => {}}
      onGoToLogin={() => navigation.navigate('Login')}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
});