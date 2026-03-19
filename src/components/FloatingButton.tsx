import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

type FloatingButtonProps = {
  onPress?: () => void;
  bottomInset?: number;
};

/**
 * Botón flotante principal de Home.
 */
export const FloatingButton = ({ onPress, bottomInset = 0 }: FloatingButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { bottom: Math.max(bottomInset, 10) + 10 }, pressed && styles.pressed]}
    >
      <Ionicons color="#FFFFFF" name="add" size={34} />
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
