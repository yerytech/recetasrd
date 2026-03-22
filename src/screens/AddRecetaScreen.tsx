import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryItem } from '../components/CategoryItem';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { RECIPE_CATEGORIES } from '../constants/categories';
import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AppTabsParamList } from '../navigation/types';
import { createRecipe } from '../services/supabase';
import { Ingredient } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = BottomTabScreenProps<AppTabsParamList, 'AddTab'>;

type EditableIngredient = Ingredient;

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
  purchaseLocation: null,
});

export const AddRecetaScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const categories = useMemo(() => RECIPE_CATEGORIES.filter((category) => category !== 'Todas'), []);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Desayuno');
  const [imageUrl, setImageUrl] = useState('');
  const [preparation, setPreparation] = useState('');
  const [ingredients, setIngredients] = useState<EditableIngredient[]>([buildNewIngredient()]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [activeIngredientId, setActiveIngredientId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    setIngredients((previous) =>
      previous.map((ingredient) =>
        ingredient.id === ingredientId
          ? {
              ...ingredient,
              purchaseLocation: {
                address: locationData.address,
                latitude: locationData.coordinates.latitude,
                longitude: locationData.coordinates.longitude,
              },
            }
          : ingredient,
      ),
    );
  };

  const clearIngredientLocation = (ingredientId: string) => {
    setIngredients((previous) =>
      previous.map((ingredient) =>
        ingredient.id === ingredientId
          ? {
              ...ingredient,
              purchaseLocation: null,
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
    setActiveIngredientId(ingredientId);
    setLocationModalVisible(true);
  };

  const handleSelectLocation = (locationData: LocationData) => {
    if (!activeIngredientId) {
      return;
    }

    updateIngredientLocation(activeIngredientId, locationData);
    setActiveIngredientId(null);
    setLocationModalVisible(false);
  };

  const handleCloseLocationModal = () => {
    setLocationModalVisible(false);
    setActiveIngredientId(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para crear recetas.');
      return;
    }

    try {
      setIsSaving(true);

      await createRecipe(
        {
          title,
          category,
          imageUrl,
          ingredients,
          preparation,
        },
        user.id,
      );

      Alert.alert('Listo', 'Tu receta fue guardada correctamente.');

      setTitle('');
      setCategory('Desayuno');
      setImageUrl('');
      setPreparation('');
      setIngredients([buildNewIngredient()]);

      navigation.navigate('HomeTab');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la receta.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Agregar receta</Text>

        <CustomInput label="Nombre" onChangeText={setTitle} placeholder="Ej. Moro de guandules" value={title} />

        <Text style={styles.label}>Categoría</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesWrapper}>
          {categories.map((option) => (
            <CategoryItem active={category === option} key={option} label={option} onPress={() => setCategory(option)} />
          ))}
        </ScrollView>

        <CustomInput
          autoCapitalize="none"
          label="Imagen"
          onChangeText={setImageUrl}
          placeholder="URL de imagen"
          value={imageUrl}
        />

        <View style={styles.ingredientsHeader}>
          <Text style={styles.label}>Ingredientes</Text>
          <Pressable onPress={addIngredientField} style={styles.addIngredientButton}>
            <Ionicons color={COLORS.primary} name="add-circle-outline" size={20} />
            <Text style={styles.addIngredientText}>Agregar</Text>
          </Pressable>
        </View>

        {ingredients.map((ingredient, index) => (
          <View key={ingredient.id} style={styles.ingredientRowContainer}>
            <View style={styles.ingredientRowHeader}>
              <Text style={styles.ingredientTitle}>Ingrediente {index + 1}</Text>
              <Pressable onPress={() => removeIngredientField(ingredient.id)}>
                <Ionicons color={COLORS.danger} name="trash-outline" size={18} />
              </Pressable>
            </View>

            <CustomInput
              onChangeText={(value) => updateIngredient(ingredient.id, 'name', value)}
              placeholder="Nombre del ingrediente"
              value={ingredient.name}
            />
            <CustomInput
              onChangeText={(value) => updateIngredient(ingredient.id, 'quantity', value)}
              placeholder="Cantidad"
              value={ingredient.quantity}
            />

            <View style={styles.ingredientLocationSection}>
              <Text style={styles.ingredientLocationLabel}>Ubicación de compra</Text>
              <Pressable
                onPress={() => openIngredientLocationPicker(ingredient.id)}
                style={[styles.locationButton, ingredient.purchaseLocation && styles.locationButtonActive]}
              >
                <Ionicons
                  name={ingredient.purchaseLocation ? 'location' : 'location-outline'}
                  size={20}
                  color={ingredient.purchaseLocation ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.locationButtonText, ingredient.purchaseLocation && styles.locationButtonTextActive]}>
                  {ingredient.purchaseLocation ? 'Ubicación seleccionada' : 'Seleccionar ubicación'}
                </Text>
              </Pressable>

              {ingredient.purchaseLocation && (
                <View style={styles.locationInfo}>
                  <Text style={styles.locationAddress}>{ingredient.purchaseLocation.address}</Text>
                  <Text style={styles.locationCoordinates}>
                    {ingredient.purchaseLocation.latitude.toFixed(4)}, {ingredient.purchaseLocation.longitude.toFixed(4)}
                  </Text>
                  <Pressable onPress={() => clearIngredientLocation(ingredient.id)} style={styles.removeLocationButton}>
                    <Ionicons name="close-circle" size={18} color={COLORS.danger} />
                    <Text style={styles.removeLocationText}>Quitar ubicación</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        ))}

        <CustomInput
          label="Preparación"
          multiline
          onChangeText={setPreparation}
          placeholder="Describe la preparación paso a paso"
          style={styles.preparationInput}
          textAlignVertical="top"
          value={preparation}
        />

        <CustomButton loading={isSaving} onPress={handleSubmit} title="Guardar receta" />

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
});
