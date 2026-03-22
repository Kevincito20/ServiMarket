import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@features/auth/model/authStore';
import { useProfileStore } from '@features/auth/model/profileStore';
import { EditProfileForm } from '@features/auth/ui/EditProfileForm';
import { Button } from '@shared/ui/Button';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParams } from '@app/navigation/types';

type NavProp = NativeStackNavigationProp<AppStackParams>;

export const ProfilePage = () => {
  const navigation = useNavigation<NavProp>();
  const { user, logout } = useAuthStore();
  // resto igual...
  const { uploadAvatar, updating } = useProfileStore();
  const [editing, setEditing] = useState(false);

  const profile = user?.profile;

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  if (!profile) return null;

  if (editing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <EditProfileForm
          profile={profile}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={updating}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {profile.nombre?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>Editar</Text>
          </View>
        </TouchableOpacity>

        {/* Info */}
        <Text style={styles.nombre}>{profile.nombre}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {profile.ciudad ? (
          <Text style={styles.ciudad}>📍 {profile.ciudad}</Text>
        ) : null}

        {profile.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : null}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.rating_promedio ?? '0.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.total_servicios ?? 0}</Text>
            <Text style={styles.statLabel}>Servicios</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.total_reviews ?? 0}</Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </View>
        </View>

        {/* Acciones */}
        <Button
          label="Editar perfil"
          onPress={() => setEditing(true)}
          style={styles.btn}
        />
        <Button
          label="Mis servicios"
          onPress={() => navigation.navigate('MyServices')}
          variant="secondary"
          style={styles.btn}
        />

        <Button
          label="Cerrar sesión"
          onPress={handleLogout}
          variant="outline"
          style={styles.btn}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#FFFFFF' },
  scroll:             { alignItems: 'center', padding: 24 },
  avatarContainer:    { position: 'relative', marginBottom: 16 },
  avatar:             { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder:  { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E94560', alignItems: 'center', justifyContent: 'center' },
  avatarInitial:      { fontSize: 40, fontWeight: '800', color: '#FFFFFF' },
  avatarBadge:        { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0F3460', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  avatarBadgeText:    { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  nombre:             { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  email:              { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  ciudad:             { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  bio:                { fontSize: 15, color: '#374151', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  statsRow:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 32, width: '100%' },
  stat:               { flex: 1, alignItems: 'center' },
  statValue:          { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  statLabel:          { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statDivider:        { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  btn:                { width: '100%', marginBottom: 12 },
});