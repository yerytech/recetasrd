import { ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';

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
  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputContainer, inputContainerStyle]}>
        {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}

        <TextInput
          placeholderTextColor={COLORS.textSecondary}
          style={[styles.input, leftIcon ? styles.inputWithIcon : null, style]}
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