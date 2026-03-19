import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CommentItem } from '../components/CommentItem';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { RatingStars } from '../components/RatingStars';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useShoppingList } from '../hooks/useShoppingList';
import { RootStackParamList } from '../navigation/types';
import { addComment, addRating, getRecipeById } from '../services/supabase';
import { Recipe } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

/**
 * Pantalla de detalle de receta con ingredientes, preparación y comentarios.
 */
export const RecipeDetailScreen = ({ navigation, route }: Props) => {
  const { user } = useAuth();
  const { addIngredients } = useShoppingList();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);

  const loadRecipe = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getRecipeById(route.params.recipeId);
      setRecipe(data);
      setSelectedRating(0);
    } catch {
      setRecipe(null);
    } finally {
      setIsLoading(false);
    }
  }, [route.params.recipeId]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>
          <Image source={{ uri: recipe.imageUrl }} style={styles.coverImage} />

          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons color={COLORS.textPrimary} name="arrow-back" size={22} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{recipe.title}</Text>

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
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
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
