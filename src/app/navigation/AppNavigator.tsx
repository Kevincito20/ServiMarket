import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfilePage } from '@pages/profile/PageProfile'; 
import { HomePage } from '@pages/home/HomePage';
import { CreateServicePage } from '@pages/service-detail/CreateServicePage';
import type { AppStackParams } from './types';
import { ServiceDetailPage } from '@pages/service-detail/ServiceDatailPage';
import { MyServicesPage } from '@pages/profile/MyServicePage';
import { EditServicePage } from '@pages/service-detail/EditServicePage';
import { OrdersPage } from '@pages/order-detail/OrdersPage';
import { OrderDetailPage } from '@pages/order-detail/OrderDetailPage';
import { CreateOrderPage } from '@pages/order-detail/CreateOrderPage';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AppStackParams>();

const Placeholder = (label: string) => () => {
  const { View, Text } = require('react-native');
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#6B7280' }}>{label} — próximamente</Text>
    </View>
  );
};

const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#E94560',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    }}
  >
    <Tab.Screen name="Home" component={HomePage} options={{ tabBarLabel: 'Inicio' }} />
    <Tab.Screen name="Orders" component={OrdersPage} options={{ tabBarLabel: 'Órdenes' }} />
    <Tab.Screen name="Profile" component={ProfilePage} options={{ tabBarLabel: 'Perfil' }} />

    
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeTabs} />
    <Stack.Screen name="ServiceDetail" component={ServiceDetailPage} />
    <Stack.Screen name="CreateService" component={CreateServicePage} />
    <Stack.Screen name="MyServices" component={MyServicesPage} />
    <Stack.Screen name="EditService" component={EditServicePage} />
    <Stack.Screen name="OrderDetail" component={OrderDetailPage} />
    <Stack.Screen name="CreateOrder" component={CreateOrderPage} />
    <Stack.Screen name="Chat" component={Placeholder('Chat')} />
    <Stack.Screen name="CreateReview" component={Placeholder('Crear Reseña')} />
  </Stack.Navigator>
);