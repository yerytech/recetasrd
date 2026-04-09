import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryItem } from '../components/CategoryItem';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { RECIPE_CATEGORIES } from '../constants/categories';
import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AppTabsParamList, RootStackParamList } from '../navigation/types';
import { createRecipe, getRecipeById, updateRecipe, uploadRecipeImage } from '../services/supabase';
import { Ingredient, LocationPoint } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = BottomTabScreenProps<AppTabsParamList, 'AddTab'>;

type EditableIngredient = Ingredient;
type LocationTarget = 'ingredient' | null;

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
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [activeLocationTarget, setActiveLocationTarget] = useState<LocationTarget>(null);
  const [activeIngredientId, setActiveIngredientId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

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

  const openIngredientLocationPicker = (ingredientId: string) => {
    setActiveLocationTarget('ingredient');
    setActiveIngredientId(ingredientId);
    setLocationModalVisible(true);
  };

  const handleSelectLocation = (locationData: LocationData) => {
    if (activeLocationTarget === 'ingredient' && activeIngredientId) {
      updateIngredientLocation(activeIngredientId, locationData);
    }

    setActiveIngredientId(null);
    setActiveLocationTarget(null);
    setLocationModalVisible(false);
  };

  const handleCloseLocationModal = () => {
    setLocationModalVisible(false);
    setActiveIngredientId(null);
    setActiveLocationTarget(null);
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

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageUrl('');
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
        <View style={styles.loadingState}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingStateText}>Cargando receta para editar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <Pressable onPress={handleRemoveImage} style={styles.removeImageButton}>
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
                {isUploadingImage ? 'Subiendo imagen...' : 'Selecciona una imagen'}
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
            <Text style={styles.addIngredientText}>Agregar</Text>
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
                onPress={() => openIngredientLocationPicker(ingredient.id)}
                style={[styles.locationButton, (ingredient.purchaseLocations?.length ?? 0) > 0 && styles.locationButtonActive]}
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
                  {(ingredient.purchaseLocations?.length ?? 0) > 0
                    ? `Agregar otra ubicación (${ingredient.purchaseLocations?.length ?? 0})`
                    : 'Seleccionar ubicación'}
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

        <LocationPickerModal
          onClose={handleCloseLocationModal}
          onSelectLocation={handleSelectLocation}
          visible={locationModalVisible}
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  loadingStateText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
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
  },
  addIngredientText: {
    marginLeft: 4,
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '700',
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
});
