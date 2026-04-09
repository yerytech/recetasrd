import { ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';
import { getResponsiveControlHeight, getResponsiveFontSize } from '../utils/responsive';

type CustomInputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  wrapperStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Campo de texto reutilizable para formularios.
 */
export const CustomInput = ({
  label,
  error,
  leftIcon,
  wrapperStyle,
  inputContainerStyle,
  style,
  ...inputProps
}: CustomInputProps) => {
  const { width } = useWindowDimensions();
  const controlHeight = getResponsiveControlHeight(width);
  const labelSize = getResponsiveFontSize(width, FONT_SIZE.sm);
  const inputSize = getResponsiveFontSize(width, FONT_SIZE.md);

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      {label ? (
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={1}
          style={[styles.label, { fontSize: labelSize }]}
        >
          {label}
        </Text>
      ) : null}

      <View style={[styles.inputContainer, { minHeight: controlHeight }, inputContainerStyle]}>
        {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}

        <TextInput
          placeholderTextColor={COLORS.textSecondary}
          style={[
            styles.input,
            { minHeight: controlHeight, fontSize: inputSize },
            leftIcon ? styles.inputWithIcon : null,
            style,
          ]}
          autoCapitalize="none"
          {...inputProps}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  inputContainer: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  inputWithIcon: {
    marginLeft: SPACING.xs,
  },
  error: {
    marginTop: 6,
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
  },
});