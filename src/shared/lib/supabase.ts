import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug: log env var resolution
console.log('[Supabase] URL defined:', !!supabaseUrl, '| Key defined:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables!\n' +
    `  EXPO_PUBLIC_SUPABASE_URL: ${supabaseUrl === undefined ? 'undefined' : supabaseUrl === '' ? '(empty string)' : 'set'}\n` +
    `  EXPO_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey === undefined ? 'undefined' : supabaseAnonKey === '' ? '(empty string)' : 'set'}\n` +
    '  Make sure .env file is in the project root and you restart the dev server with cache cleared:\n' +
    '  npx expo start --clear'
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);