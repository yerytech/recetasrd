import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryItem } from '../components/CategoryItem';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { LoadingStateCard } from '../components/LoadingStateCard';
import { RECIPE_CATEGORIES } from '../constants/categories';
import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useGetLocation } from '../hooks/useGetLocation';
import { AppTabsParamList, RootStackParamList } from '../navigation/types';
import { createRecipe, deleteRecipeImageByUrl, getRecipeById, updateRecipe, uploadRecipeImage } from '../services/supabase';
import { Ingredient, LocationPoint } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = BottomTabScreenProps<AppTabsParamList, 'AddTab'>;

type EditableIngredient = Ingredient;

interface GalleryAssetItem {
  id: string;
  uri: string;
}

interface LocationData {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const buildNewIngredient = (): EditableIngredient => ({
  id: `ingredient-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: '',
  quantity: '',
  purchaseLocations: [],
});

const mapLocationData = (locationData: LocationData): LocationPoint => ({
  address: locationData.address,
  latitude: locationData.coordinates.latitude,
  longitude: locationData.coordinates.longitude,
});

const isSameLocation = (first: LocationPoint, second: LocationPoint): boolean =>
  first.address === second.address && first.latitude === second.latitude && first.longitude === second.longitude;

const sanitizeIngredientLocations = (ingredients: EditableIngredient[]): EditableIngredient[] =>
  ingredients.map((ingredient) => ({
    ...ingredient,
    purchaseLocations: (ingredient.purchaseLocations ?? [])
      .map((location) => ({
        address: (location.address ?? '').trim() || 'Ubicación seleccionada',
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      }))
      .filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude)),
  }));

export const AddRecetaScreen = ({ navigation, route }: Props) => {
  const { user } = useAuth();
  const { getLocation, isLoading: isLocationLoading } = useGetLocation();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const categories = useMemo(() => RECIPE_CATEGORIES.filter((category) => category !== 'Todas'), []);
  const recipeIdToEdit = route.params?.recipeId;
  const isEditMode = Boolean(recipeIdToEdit);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Desayuno');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preparation, setPreparation] = useState('');
  const [ingredients, setIngredients] = useState<EditableIngredient[]>([buildNewIngredient()]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [isLoadingGalleryAssets, setIsLoadingGalleryAssets] = useState(false);
  const [galleryAssets, setGalleryAssets] = useState<GalleryAssetItem[]>([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setCategory('Desayuno');
    setImageUri(null);
    setImageUrl('');
    setPreparation('');
    setIngredients([buildNewIngredient()]);
  }, []);

  const updateIngredient = (ingredientId: string, field: 'name' | 'quantity', value: string) => {
    setIngredients((previous) =>
      previous.map((ingredient) =>
        ingredient.id === ingredientId
          ? {
              ...ingredient,
              [field]: value,
            }
          : ingredient,
      ),
    );
  };

  const updateIngredientLocation = (ingredientId: string, locationData: LocationData) => {
    const nextLocation = mapLocationData(locationData);

    setIngredients((previous) =>
      previous.map((ingredient) =>
        ingredient.id === ingredientId
          ? {
              ...ingredient,
              purchaseLocations: ingredient.purchaseLocations?.some((location) => isSameLocation(location, nextLocation))
                ? ingredient.purchaseLocations
                : [...(ingredient.purchaseLocations ?? []), nextLocation],
            }
          : ingredient,
      ),
    );
  };

  const removeIngredientLocation = (ingredientId: string, locationToRemove: LocationPoint) => {
    setIngredients((previous) =>
      previous.map((ingredient) =>
        ingredient.id === ingredientId
          ? {
              ...ingredient,
              purchaseLocations: (ingredient.purchaseLocations ?? []).filter(
                (location) => !isSameLocation(location, locationToRemove),
              ),
            }
          : ingredient,
      ),
    );
  };

  const addIngredientField = () => {
    setIngredients((previous) => [...previous, buildNewIngredient()]);
  };

  const removeIngredientField = (ingredientId: string) => {
    setIngredients((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter((ingredient) => ingredient.id !== ingredientId);
    });
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!geocode.length) {
        return `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
      }

      const { name, street, city, region } = geocode[0];
      const fullAddress = `${street || name || ''}, ${city || ''}, ${region || ''}`.replace(/^, |, $/g, '');
      return fullAddress || `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
    } catch {
      return `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
    }
  };

  const handleGetCurrentIngredientLocation = async (ingredientId: string) => {
    const locationResult = await getLocation();

    if (!locationResult.coords) {
      const message = locationResult.errorMessage || 'No se pudo obtener la ubicación actual.';
      Alert.alert('Ubicación', message);
      return;
    }

    const { latitude, longitude } = locationResult.coords;
    const address = await getAddressFromCoordinates(latitude, longitude);

    updateIngredientLocation(ingredientId, {
      address,
      coordinates: {
        latitude,
        longitude,
      },
    });
  };

  const loadRecipeToEdit = useCallback(async () => {
    if (!recipeIdToEdit) {
      return;
    }

    try {
      setIsLoadingRecipe(true);
      const recipe = await getRecipeById(recipeIdToEdit);

      if (!recipe) {
        Alert.alert('No encontrada', 'La receta que intentas editar no existe.');
        navigation.navigate('HomeTab');
        return;
      }

      if (user && recipe.authorId !== user.id) {
        Alert.alert('Sin permisos', 'Solo el autor puede editar esta receta.');
        navigation.navigate('HomeTab');
        return;
      }

      setTitle(recipe.title);
      setCategory(recipe.category);
      setImageUri(null);
      setImageUrl(recipe.imageUrl);
      setPreparation(recipe.preparation);
      setIngredients(
        recipe.ingredients.length
          ? recipe.ingredients.map((ingredient, index) => ({
              id: ingredient.id || `${recipe.id}-ingredient-${index + 1}`,
              name: ingredient.name,
              quantity: ingredient.quantity,
              purchaseLocations: ingredient.purchaseLocations ?? [],
            }))
          : [buildNewIngredient()],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar la receta para edición.';
      Alert.alert('Error', message);
      navigation.navigate('HomeTab');
    } finally {
      setIsLoadingRecipe(false);
    }
  }, [navigation, recipeIdToEdit, user]);

  useEffect(() => {
    if (isEditMode) {
      void loadRecipeToEdit();
      return;
    }

    resetForm();
  }, [isEditMode, loadRecipeToEdit, resetForm]);

  useEffect(() => {
    void loadRecentGalleryAssets();
  }, []);

  const applyPickedImage = (
    result: ImagePicker.ImagePickerResult,
    source: 'camara' | 'galeria',
  ): boolean => {
    if (result.canceled || !result.assets[0]) {
      Alert.alert(
        'Sin imagen',
        source === 'camara'
          ? 'No se tomó ninguna foto. Puedes intentarlo de nuevo o elegir una del carrusel.'
          : 'No se seleccionó ninguna imagen.',
      );
      return false;
    }

    setImageUri(result.assets[0].uri);
    setIsImageModalVisible(false);
    return true;
  };

  const loadRecentGalleryAssets = async () => {
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
  };

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      applyPickedImage(result, 'galeria');
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const handleCapturePhotoFromModal = async () => {
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

      setImageUri(photo.uri);
      setIsImageModalVisible(false);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la camara.');
    } finally {
      setIsCapturingPhoto(false);
    }
  };

  const handleSelectGalleryAsset = (assetUri: string) => {
    setImageUri(assetUri);
    setIsImageModalVisible(false);
  };

  const handleSelectImage = async () => {
    const permissionResult = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();

    if (!permissionResult?.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la camara para continuar.');
      return;
    }

    setIsImageModalVisible(true);
    void loadRecentGalleryAssets();
  };

  const handleCloseImageModal = () => {
    setIsImageModalVisible(false);
  };

  const toggleCameraFacing = () => {
    setCameraFacing((previous) => (previous === 'back' ? 'front' : 'back'));
  };

  const handleRemoveImage = async () => {
    const previousImageUrl = imageUrl.trim();

    setImageUri(null);
    setImageUrl('');

    if (!previousImageUrl) {
      return;
    }

    try {
      setIsUploadingImage(true);
      await deleteRecipeImageByUrl(previousImageUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar la imagen en Supabase.';
      Alert.alert('Aviso', `${message} La imagen se quitó de la receta localmente.`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para guardar recetas.');
      return;
    }

    try {
      setIsSaving(true);
      const normalizedIngredients = sanitizeIngredientLocations(ingredients);

      let finalImageUrl = imageUrl.trim();
      if (imageUri) {
        try {
          setIsUploadingImage(true);
          const targetRecipeId = recipeIdToEdit || `recipe-${Date.now()}`;
          finalImageUrl = await uploadRecipeImage(imageUri, targetRecipeId);
        } finally {
          setIsUploadingImage(false);
        }
      }

      if (isEditMode && recipeIdToEdit) {
        await updateRecipe(
          recipeIdToEdit,
          {
            title,
            category,
            imageUrl: finalImageUrl,
            ingredients: normalizedIngredients,
            preparation,
          },
          user.id,
        );

        Alert.alert('Actualizada', 'La receta se actualizó correctamente.');
        navigation.setParams({ recipeId: undefined });
        rootNavigation.navigate('RecipeDetail', { recipeId: recipeIdToEdit });
        return;
      }

      await createRecipe(
        {
          title,
          category,
          imageUrl: finalImageUrl,
          ingredients: normalizedIngredients,
          preparation,
        },
        user.id,
      );

      Alert.alert('Listo', 'Tu receta fue guardada correctamente.');
      resetForm();
      navigation.navigate('HomeTab');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la receta.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingRecipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingStateCard
          title="Preparando editor"
          subtitle="Estamos cargando la receta para editarla."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{isEditMode ? 'Editar receta' : 'Agregar receta'}</Text>

        <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.label}>
          Nombre de la receta
        </Text>
        <CustomInput
          onChangeText={setTitle}
          placeholder="Ej. Moro de guandules"
          value={title}
          wrapperStyle={styles.fullWidthField}
        />

        <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.label}>Categoría</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesWrapper}>
          {categories.map((option) => (
            <CategoryItem active={category === option} key={option} label={option} onPress={() => setCategory(option)} />
          ))}
        </ScrollView>

        <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.label}>Imagen</Text>
        <View style={styles.imageSelector}>
          {imageUri || imageUrl ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri || imageUrl }} style={styles.imagePreview} />
              <Pressable
                onPress={() => {
                  void handleRemoveImage();
                }}
                style={styles.removeImageButton}
              >
                <Ionicons color="#FFFFFF" name="close-circle" size={24} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleSelectImage}
              disabled={isUploadingImage}
              style={[styles.selectImageButton, isUploadingImage && styles.selectImageButtonDisabled]}
            >
              <Ionicons color={COLORS.primary} name="image-outline" size={32} />
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.selectImageButtonText}>
                {isUploadingImage ? 'Subiendo imagen...' : 'Agregar imagen'}
              </Text>
            </Pressable>
          )}

        </View>

        <CustomInput
          autoCapitalize="none"
          label="O pega una URL de imagen"
          onChangeText={setImageUrl}
          placeholder="Opcional: https://..."
          value={imageUrl}
          wrapperStyle={styles.fullWidthField}
        />

        <View style={styles.ingredientsHeader}>
          <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.label}>
            Ingredientes
          </Text>
          <Pressable onPress={addIngredientField} style={styles.addIngredientButton}>
            <Ionicons color={COLORS.primary} name="add-circle-outline" size={20} />
            <Text adjustsFontSizeToFit minimumFontScale={0.9} numberOfLines={1} style={styles.addIngredientText}>
              Agregar
            </Text>
          </Pressable>
        </View>

        {ingredients.map((ingredient, index) => (
          <View key={ingredient.id} style={styles.ingredientRowContainer}>
            <View style={styles.ingredientRowHeader}>
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.ingredientTitle}>
                Ingrediente {index + 1}
              </Text>
              <Pressable onPress={() => removeIngredientField(ingredient.id)}>
                <Ionicons color={COLORS.danger} name="trash-outline" size={18} />
              </Pressable>
            </View>

            <CustomInput
              onChangeText={(value) => updateIngredient(ingredient.id, 'name', value)}
              placeholder="Nombre del ingrediente"
              value={ingredient.name}
              wrapperStyle={styles.fullWidthField}
            />
            <CustomInput
              onChangeText={(value) => updateIngredient(ingredient.id, 'quantity', value)}
              placeholder="Cantidad"
              value={ingredient.quantity}
              wrapperStyle={styles.fullWidthField}
            />

            <View style={styles.ingredientLocationSection}>
              <Text style={styles.ingredientLocationLabel}>Ubicación de compra</Text>
              <Pressable
                disabled={isLocationLoading}
                onPress={() => {
                  void handleGetCurrentIngredientLocation(ingredient.id);
                }}
                style={[
                  styles.locationButton,
                  (ingredient.purchaseLocations?.length ?? 0) > 0 && styles.locationButtonActive,
                  isLocationLoading && styles.locationButtonDisabled,
                ]}
              >
                <Ionicons
                  name={(ingredient.purchaseLocations?.length ?? 0) > 0 ? 'location' : 'location-outline'}
                  size={20}
                  color={(ingredient.purchaseLocations?.length ?? 0) > 0 ? COLORS.primary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.locationButtonText,
                    (ingredient.purchaseLocations?.length ?? 0) > 0 && styles.locationButtonTextActive,
                  ]}
                >
                  {isLocationLoading
                    ? 'Cargando...'
                    : (ingredient.purchaseLocations?.length ?? 0) > 0
                    ? `Agregar otra ubicación (${ingredient.purchaseLocations?.length ?? 0})`
                    : 'Seleccionar ubicación actual'}
                </Text>
              </Pressable>

              {(ingredient.purchaseLocations ?? []).map((location, locationIndex) => (
                <View key={`${ingredient.id}-${locationIndex}`} style={styles.locationInfo}>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                  <Text style={styles.locationCoordinates}>
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </Text>
                  <Pressable
                    onPress={() => removeIngredientLocation(ingredient.id, location)}
                    style={styles.removeLocationButton}
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.danger} />
                    <Text style={styles.removeLocationText}>Quitar ubicación</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.label}>
          Descripción y preparación
        </Text>
        <CustomInput
          multiline
          onChangeText={setPreparation}
          placeholder="Describe la preparación paso a paso"
          style={styles.preparationInput}
          textAlignVertical="top"
          value={preparation}
          wrapperStyle={styles.fullWidthField}
        />

          <CustomButton
            loading={isSaving}
            onPress={handleSubmit}
            title={isEditMode ? 'Guardar cambios' : 'Guardar receta'}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal animationType="slide" transparent visible={isImageModalVisible} onRequestClose={handleCloseImageModal}>
        <View style={styles.cameraModalBackdrop}>
          <View style={styles.cameraModalSheet}>
            <View style={styles.cameraPreviewContainer}>
              <CameraView ref={cameraRef} facing={cameraFacing} style={styles.cameraPreview} />

              <View style={styles.cameraTopActions}>
                <Pressable onPress={handleCloseImageModal} style={styles.cameraIconButton}>
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
                    <Pressable
                      onPress={() => handleSelectGalleryAsset(item.uri)}
                      style={[
                        styles.galleryCarouselItem,
                        imageUri === item.uri && styles.galleryCarouselItemSelected,
                      ]}
                    >
                      <Image source={{ uri: item.uri }} style={styles.galleryCarouselImage} />
                      {imageUri === item.uri ? (
                        <View style={styles.galleryCarouselSelectedBadge}>
                          <Ionicons color="#FFFFFF" name="checkmark" size={12} />
                        </View>
                      ) : null}
                    </Pressable>
                  )}
                  ListEmptyComponent={
                    null
                  }
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
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    paddingHorizontal: LAYOUT.contentHorizontalPadding,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  fullWidthField: {
    width: '100%',
    alignSelf: 'stretch',
  },
  categoriesWrapper: {
    marginBottom: SPACING.md,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    minWidth: 82,
  },
  addIngredientText: {
    marginLeft: 4,
    fontSize: FONT_SIZE.sm,
    lineHeight: FONT_SIZE.sm + 4,
    color: COLORS.primary,
    fontWeight: '700',
    flexShrink: 0,
  },
  ingredientRowContainer: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  ingredientRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ingredientTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    flexShrink: 1,
    marginRight: SPACING.sm,
  },
  ingredientLocationSection: {
    marginTop: SPACING.xs,
  },
  ingredientLocationLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  preparationInput: {
    minHeight: 130,
    paddingTop: SPACING.sm,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  locationButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.softPrimary,
  },
  locationButtonDisabled: {
    opacity: 0.65,
  },
  locationButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  locationButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  locationInfo: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.softPrimary,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  locationAddress: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  locationCoordinates: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  removeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  removeLocationText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    fontWeight: '500',
  },
  imageSelector: {
    marginBottom: SPACING.md,
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
  galleryCarouselSection: {
    marginTop: SPACING.sm,
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
  galleryCarouselItemSelected: {
    borderColor: COLORS.primary,
  },
  galleryCarouselImage: {
    width: '100%',
    height: '100%',
  },
  galleryCarouselSelectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.inputBackground,
  },
  removeImageButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  selectImageButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.softPrimary,
  },
  selectImageButtonDisabled: {
    opacity: 0.6,
  },
  selectImageButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  galleryEmptyText: {
    textAlign: 'left',
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    paddingVertical: SPACING.sm,
  },
});
