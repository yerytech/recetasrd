import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';

type CustomInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

/**
 * Campo de texto reutilizable para formularios.
 */
export const CustomInput = ({ label, error, style, ...inputProps }: CustomInputProps) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        placeholderTextColor={COLORS.textSecondary}
        style={[styles.input, style]}
        autoCapitalize="none"
        {...inputProps}
      />

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
  input: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  error: {
    marginTop: 6,
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
  },
});