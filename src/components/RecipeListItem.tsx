import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type RecipeListItemProps = {
  title: string;
  rating: number;
  imageUrl: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
};

/**
 * Item horizontal para recetas populares.
 */
export const RecipeListItem = ({
  title,
  rating,
  imageUrl,
  isFavorite = false,
  onPress,
  onFavoritePress,
}: RecipeListItemProps) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.infoContainer}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons color="#F2C94C" name="star" size={14} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>

      <Pressable hitSlop={8} onPress={onFavoritePress} style={styles.favoriteButton}>
        <Ionicons color={isFavorite ? '#C9822B' : '#777777'} name={isFavorite ? 'heart' : 'heart-outline'} size={20} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.93,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F2F2F2',
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#777777',
    fontWeight: '600',
  },
  favoriteButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
