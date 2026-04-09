import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';

type RatingStarsProps = {
  rating: number;
  size?: number;
  onRate?: (value: number) => void;
  showValue?: boolean;
};

/**
 * Componente de estrellas para visualización y selección de rating.
 */
export const RatingStars = ({ rating, size = 16, onRate, showValue = false }: RatingStarsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const iconName = rating >= starValue ? 'star' : 'star-outline';

          return (
            <Pressable
              disabled={!onRate}
              key={starValue}
              onPress={() => onRate?.(starValue)}
              hitSlop={8}
              style={styles.starPressable}
            >
              <Ionicons color={COLORS.primary} name={iconName} size={size} />
            </Pressable>
          );
        })}
      </View>

      {showValue ? (
        <Text numberOfLines={1} style={styles.value}>
          {Number.isFinite(rating) ? rating.toFixed(1) : '0.0'}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starPressable: {
    marginRight: 2,
  },
  value: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    minWidth: 28,
  },
});