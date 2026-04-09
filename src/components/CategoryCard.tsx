import { Image, Pressable, StyleProp, StyleSheet, Text, useWindowDimensions, ViewStyle } from 'react-native';

import { getResponsiveFontSize, getResponsiveValue } from '../utils/responsive';

type CategoryCardProps = {
  title: string;
  imageUrl: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Tarjeta de categoría para el carrusel horizontal en Home.
 */
export const CategoryCard = ({ title, imageUrl, onPress, style }: CategoryCardProps) => {
  const { width } = useWindowDimensions();
  const cardWidth = getResponsiveValue(width, {
    compact: 96,
    regular: 116,
    tablet: 132,
    desktop: 144,
  });
  const cardHeight = getResponsiveValue(width, {
    compact: 136,
    regular: 150,
    tablet: 166,
    desktop: 176,
  });
  const imageWidth = Math.round(cardWidth * 0.74);
  const imageHeight = Math.round(cardHeight * 0.66);
  const titleSize = getResponsiveFontSize(width, 14);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, { width: cardWidth, height: cardHeight }, style, pressed && styles.pressed]}
    >
      <Image source={{ uri: imageUrl }} style={[styles.image, { width: imageWidth, height: imageHeight }]} />
      <Text numberOfLines={1} style={[styles.title, { fontSize: titleSize }]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 116,
    height: 150,
    backgroundColor: '#C9822B',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  pressed: {
    opacity: 0.9,
  },
  image: {
    width: 86,
    height: 100,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
