import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommentItem } from '../components/CommentItem';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { STORAGE_KEYS } from '../constants/storage';
import { RatingStars } from '../components/RatingStars';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useShoppingList } from '../hooks/useShoppingList';
import { LocalRecipeParam, RootStackParamList } from '../navigation/types';
import { addComment, addRating, deleteRecipe, getRecipeById } from '../services/supabase';
import { Recipe } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

const mapLocalRecipeToRecipe = (localRecipe: LocalRecipeParam): Recipe => ({
  id: localRecipe.id,
  title: localRecipe.title,
  category: localRecipe.category,
  imageUrl: localRecipe.imageUrl,
  ingredients: localRecipe.ingredients.map((ingredient, index) => ({
    id: `${localRecipe.id}-ingredient-${index + 1}`,
    name: ingredient,
    quantity: '',
  })),
  preparation: localRecipe.preparation,
  authorId: 'local',
  averageRating: localRecipe.rating,
  ratingsCount: 1,
  comments: [],
  createdAt: new Date().toISOString(),
  location: null,
});

const parseFavoriteRecipeIds = (rawValue: string | null): string[] => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

/**
 * Pantalla de detalle de receta con ingredientes, preparación y comentarios.
 */
export const RecipeDetailScreen = ({ navigation, route }: Props) => {
  const { user } = useAuth();
  const { addIngredients } = useShoppingList();
  const localRecipe = route.params.localRecipe;
  const isLocalRecipe = Boolean(localRecipe);
  const selectedRecipeId = localRecipe?.id ?? route.params.recipeId;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDeletingRecipe, setIsDeletingRecipe] = useState(false);

  const loadRecipe = useCallback(async () => {
    if (localRecipe) {
      setRecipe(mapLocalRecipeToRecipe(localRecipe));
      setSelectedRating(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getRecipeById(selectedRecipeId);
      setRecipe(data);
      setSelectedRating(0);
    } catch {
      setRecipe(null);
    } finally {
      setIsLoading(false);
    }
  }, [localRecipe, selectedRecipeId]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      const rawValue = await AsyncStorage.getItem(STORAGE_KEYS.favoriteRecipes);
      const favoriteIds = parseFavoriteRecipeIds(rawValue);
      setIsFavorite(favoriteIds.includes(selectedRecipeId));
    };

    void loadFavoriteStatus();
  }, [selectedRecipeId]);

  const handleToggleFavorite = async () => {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEYS.favoriteRecipes);
    const favoriteIds = parseFavoriteRecipeIds(rawValue);
    const alreadyFavorite = favoriteIds.includes(selectedRecipeId);

    const nextIds = alreadyFavorite
      ? favoriteIds.filter((favoriteId) => favoriteId !== selectedRecipeId)
      : [...favoriteIds, selectedRecipeId];

    await AsyncStorage.setItem(STORAGE_KEYS.favoriteRecipes, JSON.stringify(nextIds));
    setIsFavorite(!alreadyFavorite);
  };

  const handleAddToShoppingList = async () => {
    if (!recipe) {
      return;
    }

    try {
      setIsAddingToList(true);
      await addIngredients(recipe.ingredients, recipe.id, recipe.title);
      Alert.alert('Éxito', 'Ingredientes agregados a tu lista de compra.');
    } catch {
      Alert.alert('Error', 'No se pudo agregar a la lista.');
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!recipe || !user) {
      Alert.alert('Sesión requerida', 'Inicia sesión para comentar recetas.');
      return;
    }

    try {
      setIsSubmittingComment(true);
      await addComment(recipe.id, user.id, commentText, user.name);
      setCommentText('');
      await loadRecipe();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo publicar el comentario.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!recipe || !user) {
      Alert.alert('Sesión requerida', 'Inicia sesión para calificar recetas.');
      return;
    }

    if (!selectedRating) {
      Alert.alert('Calificación requerida', 'Selecciona una cantidad de estrellas.');
      return;
    }

    try {
      setIsSubmittingRating(true);
      await addRating(recipe.id, user.id, selectedRating);
      await loadRecipe();
      Alert.alert('Gracias', 'Tu calificación fue registrada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar la calificación.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleEditRecipe = () => {
    if (!recipe || !user) {
      return;
    }

    navigation.navigate('App', {
      screen: 'AddTab',
      params: {
        recipeId: recipe.id,
      },
    });
  };

  const handleDeleteRecipe = () => {
    if (!recipe || !user) {
      return;
    }

    Alert.alert(
      'Eliminar receta',
      '¿Estás seguro de que deseas eliminar esta receta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              setIsDeletingRecipe(true);
              await deleteRecipe(recipe.id, user.id);
              Alert.alert('Éxito', 'La receta ha sido eliminada.');
              navigation.goBack();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'No se pudo eliminar la receta.';
              Alert.alert('Error', message);
            } finally {
              setIsDeletingRecipe(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredState}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredState}>
          <Text style={styles.notFoundTitle}>No se encontró la receta</Text>
          <CustomButton onPress={() => navigation.goBack()} title="Volver" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>
          <Image source={{ uri: recipe.imageUrl }} style={styles.coverImage} />

          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons color={COLORS.textPrimary} name="arrow-back" size={22} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{recipe.title}</Text>
            <View style={styles.titleActions}>
              <Pressable hitSlop={10} onPress={handleToggleFavorite} style={styles.favoriteButtonTitle}>
                <Ionicons color={isFavorite ? COLORS.primary : COLORS.textSecondary} name={isFavorite ? 'heart' : 'heart-outline'} size={24} />
              </Pressable>
              {user && recipe.authorId === user.id && (
                <>
                  <Pressable hitSlop={10} onPress={handleEditRecipe} style={styles.editButtonTitle}>
                    <Ionicons color={COLORS.primary} name="create-outline" size={22} />
                  </Pressable>
                  <Pressable
                    hitSlop={10}
                    onPress={handleDeleteRecipe}
                    disabled={isDeletingRecipe}
                    style={styles.deleteButtonTitle}
                  >
                    <Ionicons color={COLORS.danger} name="trash-outline" size={24} />
                  </Pressable>
                </>
              )}
            </View>
          </View>

          <View style={styles.ratingSummary}>
            <RatingStars rating={recipe.averageRating} showValue size={18} />
            <Text style={styles.ratingCount}>({recipe.ratingsCount} calificaciones)</Text>
          </View>

          <CustomButton loading={isAddingToList} onPress={handleAddToShoppingList} title="Agregar a lista" />

          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientRow}>
              <View style={styles.ingredientBullet} />
              <Text style={styles.ingredientText}>
                {ingredient.name} {ingredient.quantity ? `• ${ingredient.quantity}` : ''}
              </Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Preparación</Text>
          <Text style={styles.preparationText}>{recipe.preparation}</Text>

          {!isLocalRecipe ? (
            <>
              <Text style={styles.sectionTitle}>Calificar</Text>
              <View style={styles.rateBlock}>
                <RatingStars onRate={setSelectedRating} rating={selectedRating} size={26} />
                <CustomButton
                  loading={isSubmittingRating}
                  onPress={handleSubmitRating}
                  style={styles.rateButton}
                  title="Enviar calificación"
                  variant="outline"
                />
              </View>

              <Text style={styles.sectionTitle}>Comentarios</Text>

              <CustomInput
                multiline
                onChangeText={setCommentText}
                placeholder="Comparte tu experiencia con esta receta"
                style={styles.commentInput}
                textAlignVertical="top"
                value={commentText}
              />

              <CustomButton
                loading={isSubmittingComment}
                onPress={handleSubmitComment}
                style={styles.commentButton}
                title="Publicar comentario"
                variant="secondary"
              />

              <View style={styles.commentsList}>
                {recipe.comments.length ? (
                  recipe.comments.map((comment) => <CommentItem comment={comment} key={comment.id} />)
                ) : (
                  <Text style={styles.noCommentsText}>Aún no hay comentarios.</Text>
                )}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  coverImage: {
    width: '100%',
    height: 260,
    backgroundColor: COLORS.secondary,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  body: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    flex: 1,
  },
  favoriteButtonTitle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  editButtonTitle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginLeft: SPACING.sm,
  },
  deleteButtonTitle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginLeft: SPACING.sm,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingCount: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  sectionTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ingredientBullet: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  ingredientText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  preparationText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
  rateBlock: {
    marginBottom: SPACING.sm,
  },
  rateButton: {
    marginTop: SPACING.sm,
  },
  commentInput: {
    minHeight: 100,
    paddingTop: SPACING.sm,
  },
  commentButton: {
    marginBottom: SPACING.md,
  },
  commentsList: {
    marginTop: SPACING.xs,
  },
  noCommentsText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  notFoundTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
});
