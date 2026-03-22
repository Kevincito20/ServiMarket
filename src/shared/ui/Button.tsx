import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline';

type Props = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
  variant?: Variant;
  style?: ViewStyle;
};

export const Button = ({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}: Props) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#0F3460' : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary' && styles.primaryLabel,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'outline' && styles.outlineLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base:           { height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  primary:        { backgroundColor: '#E94560' },
  secondary:      { backgroundColor: '#0F3460' },
  outline:        { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#0F3460' },
  disabled:       { opacity: 0.5 },
  label:          { fontSize: 15, fontWeight: '700' },
  primaryLabel:   { color: '#FFFFFF' },
  secondaryLabel: { color: '#FFFFFF' },
  outlineLabel:   { color: '#0F3460' },
});