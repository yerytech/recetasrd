import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AppTabsParamList } from '../navigation/types';
import { deleteProfileAvatarByUrl, uploadProfileAvatar } from '../services/supabase';
import { getInitials } from '../utils/initials';

type Props = BottomTabScreenProps<AppTabsParamList, 'ProfileTab'>;

/**
 * Pantalla de perfil de usuario.
 */
export const ProfileScreen = ({}: Props) => {
  const { user, logout, updatePassword, updateProfile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNameEditorVisible, setIsNameEditorVisible] = useState(false);
  const [isPasswordEditorVisible, setIsPasswordEditorVisible] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  useEffect(() => {
    setDisplayName(user?.name ?? '');
  }, [user?.name]);

  const toggleNameEditor = useCallback(() => {
    setIsNameEditorVisible((previous) => {
      const next = !previous;
      if (next) {
        setIsPasswordEditorVisible(false);
      }
      return next;
    });
  }, []);

  const togglePasswordEditor = useCallback(() => {
    setIsPasswordEditorVisible((previous) => {
      const next = !previous;
      if (next) {
        setIsNameEditorVisible(false);
      } else {
        setNewPassword('');
        setConfirmPassword('');
      }
      return next;
    });
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!user) {
      return;
    }

    const cleanName = displayName.trim();
    if (!cleanName) {
      Alert.alert('Nombre requerido', 'Ingresa un nombre para tu perfil.');
      return;
    }

    if (cleanName.length < 2) {
      Alert.alert('Nombre invalido', 'El nombre debe tener al menos 2 caracteres.');
      return;
    }

    if (cleanName.length > 80) {
      Alert.alert('Nombre invalido', 'El nombre no puede superar 80 caracteres.');
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateProfile(cleanName);
      Alert.alert('Perfil actualizado', 'Tu nombre se actualizo correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el perfil.';
      Alert.alert('Error', message);
    } finally {
      setIsSavingProfile(false);
    }
  }, [displayName, updateProfile, user]);

  const handleChangePassword = useCallback(async () => {
    const cleanPassword = newPassword.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!cleanPassword || !cleanConfirmPassword) {
      Alert.alert('Campos requeridos', 'Completa ambos campos de contraseña.');
      return;
    }

    if (cleanPassword.length < 8) {
      Alert.alert('Contraseña invalida', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      Alert.alert('Contraseñas distintas', 'La confirmacion no coincide con la nueva contraseña.');
      return;
    }

    try {
      setIsSavingPassword(true);
      await updatePassword(cleanPassword);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Listo', 'Tu contraseña se actualizo correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.';
      Alert.alert('Error', message);
    } finally {
      setIsSavingPassword(false);
    }
  }, [confirmPassword, newPassword, updatePassword]);

  const handlePickAvatar = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galeria para elegir la foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      setIsUploadingAvatar(true);
      const uploadedUrl = await uploadProfileAvatar(result.assets[0].uri, user.id);
      await updateProfile(displayName.trim() || user.name, uploadedUrl);
      Alert.alert('Foto actualizada', 'Tu foto de perfil se subio correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo subir la foto de perfil.';
      Alert.alert('Error', message);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [displayName, updateProfile, user]);

  const handleRemoveAvatar = useCallback(async () => {
    if (!user?.avatarUrl) {
      return;
    }

    try {
      setIsUploadingAvatar(true);
      await deleteProfileAvatarByUrl(user.avatarUrl);
      await updateProfile(displayName.trim() || user.name, null);
      Alert.alert('Foto eliminada', 'La foto de perfil fue eliminada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar la foto de perfil.';
      Alert.alert('Error', message);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [displayName, updateProfile, user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>No hay sesión activa.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
              </View>
            )}
          </View>

          <View style={styles.avatarActionsRow}>
            <Pressable
              disabled={isUploadingAvatar}
              onPress={() => {
                void handlePickAvatar();
              }}
              style={styles.avatarActionButton}
            >
              <Ionicons color={COLORS.primary} name="camera-outline" size={18} />
              <Text style={styles.avatarActionText}>{isUploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}</Text>
            </Pressable>

            {user.avatarUrl ? (
              <Pressable
                disabled={isUploadingAvatar}
                onPress={() => {
                  void handleRemoveAvatar();
                }}
                style={styles.avatarActionButton}
              >
                <Ionicons color={COLORS.danger} name="trash-outline" size={18} />
                <Text style={styles.avatarRemoveText}>Quitar foto</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons color={COLORS.textSecondary} name="person-outline" size={18} />
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue} numberOfLines={0}>{user.name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons color={COLORS.textSecondary} name="mail-outline" size={18} />
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Seguridad y perfil</Text>

          <CustomButton
            onPress={toggleNameEditor}
            style={styles.actionToggleButton}
            title={isNameEditorVisible ? 'Ocultar cambio de nombre' : 'Cambiar nombre'}
          />

          {isNameEditorVisible ? (
            <View style={styles.formSection}>
              <CustomInput
                label="Actualizar nombre"
                maxLength={80}
                onChangeText={setDisplayName}
                placeholder="Tu nombre completo"
                value={displayName}
                wrapperStyle={styles.profileInput}
              />

              <CustomButton
                loading={isSavingProfile}
                onPress={() => {
                  void handleSaveProfile();
                }}
                title="Guardar nombre"
                variant="secondary"
              />
            </View>
          ) : null}

          <CustomButton
            onPress={togglePasswordEditor}
            style={styles.actionToggleButton}
            title={isPasswordEditorVisible ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
          />

          {isPasswordEditorVisible ? (
            <View style={styles.formSection}>
              <Text style={styles.infoHint}>Usa minimo 8 caracteres para mayor seguridad.</Text>

              <CustomInput
                label="Nueva contraseña"
                onChangeText={setNewPassword}
                placeholder="********"
                secureTextEntry
                value={newPassword}
                wrapperStyle={styles.profileInput}
              />

              <CustomInput
                label="Confirmar contraseña"
                onChangeText={setConfirmPassword}
                placeholder="********"
                secureTextEntry
                value={confirmPassword}
                wrapperStyle={styles.profileInput}
              />

              <CustomButton
                loading={isSavingPassword}
                onPress={() => {
                  void handleChangePassword();
                }}
                title="Actualizar contraseña"
                variant="secondary"
              />
            </View>
          ) : null}
        </View>

        <CustomButton
          loading={isLoggingOut}
          onPress={handleLogout}
          style={styles.logoutButton}
          title="Cerrar sesión"
          variant="outline"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: LAYOUT.contentHorizontalPadding,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  avatarActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarActionText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  avatarRemoveText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  avatarInitials: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    fontWeight: '700',
  },
  name: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  email: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTexts: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  infoValue: {
    marginTop: 4,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  infoHint: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
  actionToggleButton: {
    marginTop: SPACING.sm,
  },
  formSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  profileInput: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  logoutButton: {
    marginTop: SPACING.lg,
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.md,
  },
});
