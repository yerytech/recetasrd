import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';

interface FoodCardProps {
  title: string;
  rating: number;
  imageUrl: string;
  onPress?: () => void;
  onFavoritePress?: (isFavorite: boolean) => void;
}

export const FoodCard = ({
  title,
  rating,
  imageUrl,
  onPress,
  onFavoritePress,
}: FoodCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoritePress = () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    onFavoritePress?.(newFavorite);
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && onPress ? styles.pressed : null]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <Pressable
          onPress={handleFavoritePress}
          style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF0000' : '#FFFFFF'}
          />
        </Pressable>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.primary} />
          <Text style={styles.rating}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.92,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
