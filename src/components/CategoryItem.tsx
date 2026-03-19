import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';

type CategoryItemProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

/**
 * Chip reutilizable para selección de categorías.
 */
export const CategoryItem = ({ label, active = false, onPress }: CategoryItemProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.container, active && styles.activeContainer]}>
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  activeContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeText: {
    color: COLORS.white,
  },
});