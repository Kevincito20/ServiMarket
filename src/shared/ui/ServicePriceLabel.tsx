import { Text, type TextStyle } from 'react-native';
import type { ServicePriceType } from '@entities/service';

type Props = {
  price: number;
  type: ServicePriceType;
  style?: TextStyle;
};

const PRICE_LABELS: Record<ServicePriceType, string> = {
  fijo:       '',
  por_hora:   '/ hora',
  cotizacion: 'Cotización',
};

export const ServicePriceLabel = ({ price, type, style }: Props) => {
  if (type === 'cotizacion') {
    return <Text style={[{ color: '#0F3460', fontWeight: '700' }, style]}>A convenir</Text>;
  }

  return (
    <Text style={[{ color: '#E94560', fontWeight: '700' }, style]}>
      ${price.toLocaleString('es-CO')} {PRICE_LABELS[type]}
    </Text>
  );
};