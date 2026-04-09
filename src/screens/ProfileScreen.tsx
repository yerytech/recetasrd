import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
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

interface GalleryAssetItem {
  id: string;
  uri: string;
}

/**
 * Pantalla de perfil de usuario.
 */
export const ProfileScreen = ({}: Props) => {
  const { user, logout, updatePassword, updateProfile } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingGalleryAssets, setIsLoadingGalleryAssets] = useState(false);
  const [galleryAssets, setGalleryAssets] = useState<GalleryAssetItem[]>([]);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
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

    const permissionResult = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();

    if (!permissionResult?.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la camara para continuar.');
      return;
    }

    setIsAvatarModalVisible(true);
    void loadRecentGalleryAssets();
  }, [cameraPermission, requestCameraPermission, user]);

  const loadRecentGalleryAssets = useCallback(async () => {
    try {
      setIsLoadingGalleryAssets(true);

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Permiso de galeria',
          'Para mostrar fotos recientes del telefono, permite el acceso a la galeria.',
          [
            {
              text: 'Abrir ajustes',
              onPress: () => {
                void Linking.openSettings();
              },
            },
            { text: 'Cancelar', style: 'cancel' },
          ],
        );
        setGalleryAssets([]);
        return;
      }

      const assets = await MediaLibrary.getAssetsAsync({
        first: 80,
        mediaType: 'photo',
        sortBy: ['creationTime'],
      });

      setGalleryAssets(
        assets.assets.map((asset) => ({
          id: asset.id,
          uri: asset.uri,
        })),
      );
    } catch {
      setGalleryAssets([]);
    } finally {
      setIsLoadingGalleryAssets(false);
    }
  }, []);

  const uploadSelectedAvatar = useCallback(
    async (avatarUri: string) => {
      if (!user) {
        return;
      }

      try {
        setIsUploadingAvatar(true);
        const uploadedUrl = await uploadProfileAvatar(avatarUri, user.id);
        await updateProfile(displayName.trim() || user.name, uploadedUrl);
        Alert.alert('Foto actualizada', 'Tu foto de perfil se subio correctamente.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo subir la foto de perfil.';
        Alert.alert('Error', message);
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [displayName, updateProfile, user],
  );

  const handlePickFromGallery = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
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

      setIsAvatarModalVisible(false);
      await uploadSelectedAvatar(result.assets[0].uri);
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  }, [uploadSelectedAvatar]);

  const handleCapturePhotoFromModal = useCallback(async () => {
    try {
      if (!cameraPermission?.granted) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la camara para tomar una foto.');
        return;
      }

      if (!cameraRef.current) {
        Alert.alert('Camara no lista', 'La camara aun no esta lista. Intenta de nuevo.');
        return;
      }

      setIsCapturingPhoto(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo?.uri) {
        Alert.alert('Sin imagen', 'No se pudo capturar la foto. Intenta de nuevo.');
        return;
      }

      setIsAvatarModalVisible(false);
      await uploadSelectedAvatar(photo.uri);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la camara.');
    } finally {
      setIsCapturingPhoto(false);
    }
  }, [cameraPermission, uploadSelectedAvatar]);

  const handleSelectGalleryAsset = useCallback(
    (assetUri: string) => {
      setIsAvatarModalVisible(false);
      void uploadSelectedAvatar(assetUri);
    },
    [uploadSelectedAvatar],
  );

  const handleCloseAvatarModal = useCallback(() => {
    setIsAvatarModalVisible(false);
  }, []);

  const toggleCameraFacing = useCallback(() => {
    setCameraFacing((previous) => (previous === 'back' ? 'front' : 'back'));
  }, []);

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

      <Modal animationType="slide" transparent visible={isAvatarModalVisible} onRequestClose={handleCloseAvatarModal}>
        <View style={styles.cameraModalBackdrop}>
          <View style={styles.cameraModalSheet}>
            <View style={styles.cameraPreviewContainer}>
              <CameraView ref={cameraRef} facing={cameraFacing} style={styles.cameraPreview} />

              <View style={styles.cameraTopActions}>
                <Pressable onPress={handleCloseAvatarModal} style={styles.cameraIconButton}>
                  <Ionicons color="#FFFFFF" name="close" size={22} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    void handlePickFromGallery();
                  }}
                  style={styles.cameraIconButton}
                >
                  <Ionicons color="#FFFFFF" name="images" size={26} />
                </Pressable>
              </View>

              <View style={styles.cameraBottomActions}>
                <Pressable onPress={toggleCameraFacing} style={styles.cameraIconButton}>
                  <Ionicons color="#FFFFFF" name="camera-reverse" size={20} />
                </Pressable>

                <Pressable
                  disabled={isCapturingPhoto}
                  onPress={() => {
                    void handleCapturePhotoFromModal();
                  }}
                  style={[styles.captureButtonOuter, isCapturingPhoto && styles.captureButtonOuterDisabled]}
                >
                  <View style={styles.captureButtonInner} />
                </Pressable>

                <View style={styles.cameraBottomSpacer} />
              </View>
            </View>

            <View style={styles.modalCarouselSection}>
              {isLoadingGalleryAssets ? (
                <View style={styles.galleryCarouselLoadingState}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : (
                <FlatList
                  horizontal
                  data={galleryAssets}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => handleSelectGalleryAsset(item.uri)} style={styles.galleryCarouselItem}>
                      <Image source={{ uri: item.uri }} style={styles.galleryCarouselImage} />
                    </Pressable>
                  )}
                  ListEmptyComponent={null}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryCarouselList}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  cameraModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  cameraModalSheet: {
    backgroundColor: COLORS.background,
    width: '94%',
    height: '82%',
    padding: 0,
    borderWidth: 8,
    borderColor: COLORS.primary,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cameraPreviewContainer: {
    flex: 1,
    overflow: 'visible',
    backgroundColor: '#000000',
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraTopActions: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.xl,
    right: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cameraBottomActions: {
    position: 'absolute',
    left: SPACING.xl,
    right: SPACING.xl,
    bottom: SPACING.xl + SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraBottomSpacer: {
    width: 44,
    height: 44,
  },
  cameraIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  captureButtonOuterDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  modalCarouselSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    maxHeight: 170,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  galleryCarouselList: {
    gap: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  galleryCarouselLoadingState: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCarouselItem: {
    width: 104,
    height: 104,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.inputBackground,
    marginRight: SPACING.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  galleryCarouselImage: {
    width: '100%',
    height: '100%',
  },
});
