import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';

type Props = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export const Input = ({ label, error, isPassword = false, ...props }: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : styles.inputNormal]}>
        <TextInput
          style={styles.input}
          secureTextEntry={isPassword && !visible}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setVisible((v) => !v)}>
            <Text style={styles.toggle}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { marginBottom: 16 },
  label:        { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 50 },
  inputNormal:  { borderColor: '#D1D5DB' },
  inputError:   { borderColor: '#E94560' },
  input:        { flex: 1, fontSize: 15, color: '#1A1A2E' },
  toggle:       { fontSize: 13, color: '#0F3460', fontWeight: '600' },
  errorText:    { fontSize: 12, color: '#E94560', marginTop: 4 },
});