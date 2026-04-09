import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle, useWindowDimensions } from 'react-native';

import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';
import { getResponsiveControlHeight, getResponsiveFontSize, getResponsiveValue } from '../utils/responsive';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Botón reutilizable con variantes visuales.
 */
export const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: CustomButtonProps) => {
  const { width } = useWindowDimensions();
  const isDisabled = disabled || loading;
  const controlHeight = getResponsiveControlHeight(width);
  const horizontalPadding = getResponsiveValue(width, {
    compact: SPACING.md,
    regular: SPACING.lg,
    tablet: SPACING.xl,
    desktop: SPACING.xl + 4,
  });
  const textSize = getResponsiveFontSize(width, FONT_SIZE.md);

  const containerStyles = [
    styles.base,
    { minHeight: controlHeight, paddingHorizontal: horizontalPadding },
    styles[variant],
    isDisabled && styles.disabled,
    style,
  ];
  const textStyles = [styles.text, { fontSize: textSize }, variant === 'outline' && styles.outlineText];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [containerStyles, pressed && !isDisabled && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          numberOfLines={1}
          style={textStyles}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});