import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { Recipe } from '../types';
import { RatingStars } from './RatingStars';

type RecipeCardProps = {
  recipe: Recipe;
  onPress: () => void;
};

/**
 * Card de receta para listados de Home y búsqueda.
 */
export const RecipeCard = ({ recipe, onPress }: RecipeCardProps) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: recipe.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {recipe.title}
        </Text>

        <Text style={styles.category}>{recipe.category}</Text>

        <View style={styles.ratingRow}>
          <RatingStars rating={recipe.averageRating} showValue size={14} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.secondary,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  category: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});