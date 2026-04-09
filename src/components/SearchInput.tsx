import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, TextInput, TextInputProps, useWindowDimensions, View, ViewStyle } from 'react-native';

import { getResponsiveControlHeight, getResponsiveFontSize, getResponsiveValue } from '../utils/responsive';

type SearchInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Input de búsqueda para Home.
 */
export const SearchInput = ({ containerStyle, style, ...props }: SearchInputProps) => {
  const { width } = useWindowDimensions();
  const controlHeight = getResponsiveControlHeight(width) + 2;
  const textSize = getResponsiveFontSize(width, 16);
  const iconSize = getResponsiveValue(width, {
    compact: 18,
    regular: 20,
    tablet: 22,
    desktop: 24,
  });

  return (
    <View style={[styles.container, { minHeight: controlHeight }, containerStyle]}>
      <Ionicons color="#777777" name="search" size={iconSize} style={styles.icon} />

      <TextInput
        placeholder="Buscar recetas..."
        placeholderTextColor="#777777"
        style={[styles.input, { fontSize: textSize }, style]}
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
