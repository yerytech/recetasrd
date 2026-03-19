import { Image, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

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
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, style, pressed && styles.pressed]}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text numberOfLines={1} style={styles.title}>
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
