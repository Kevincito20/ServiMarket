import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@app/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}