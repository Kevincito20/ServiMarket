import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm } from '@features/auth/ui/LoginForm';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParams } from '@app/navigation/types';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export const LoginPage = ({ navigation }: Props) => (
  <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
    <LoginForm
      onSuccess={() => {}}
      onGoToRegister={() => navigation.navigate('Register')}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
});