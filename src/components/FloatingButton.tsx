import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';

import { getResponsiveValue } from '../utils/responsive';

type FloatingButtonProps = {
  onPress?: () => void;
  bottomInset?: number;
};

/**
 * Botón flotante principal de Home.
 */
export const FloatingButton = ({ onPress, bottomInset = 0 }: FloatingButtonProps) => {
  const { width } = useWindowDimensions();
  const buttonSize = getResponsiveValue(width, {
    compact: 58,
    regular: 68,
    tablet: 74,
    desktop: 78,
  });
  const iconSize = getResponsiveValue(width, {
    compact: 30,
    regular: 34,
    tablet: 36,
    desktop: 38,
  });
  const radius = buttonSize / 2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: radius,
          marginLeft: -radius,
          bottom: Math.max(bottomInset, 10) + 10,
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons color="#FFFFFF" name="add" size={iconSize} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: '50%',
    marginLeft: -34,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#C9822B',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
