import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

type SearchInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Input de búsqueda para Home.
 */
export const SearchInput = ({ containerStyle, style, ...props }: SearchInputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons color="#777777" name="search" size={20} style={styles.icon} />

      <TextInput
        placeholder="Buscar recetas..."
        placeholderTextColor="#777777"
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E5E5',
    borderRadius: 18,
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 0,
  },
});
