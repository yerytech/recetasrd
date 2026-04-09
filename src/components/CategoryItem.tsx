import { Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';

import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';
import { getResponsiveFontSize } from '../utils/responsive';

type CategoryItemProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

/**
 * Chip reutilizable para selección de categorías.
 */
export const CategoryItem = ({ label, active = false, onPress }: CategoryItemProps) => {
  const { width } = useWindowDimensions();
  const fontSize = getResponsiveFontSize(width, FONT_SIZE.sm);

  return (
    <Pressable onPress={onPress} style={[styles.container, active && styles.activeContainer]}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        numberOfLines={1}
        style={[styles.text, { fontSize }, active && styles.activeText]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: COLORS.softPrimary,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activeContainer: {
    backgroundColor: COLORS.primary,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeText: {
    color: COLORS.white,
  },
});