import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';

const appLogo = require('../../assets/icon.png');

/**
 * Pantalla de carga inicial.
 */
export const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image resizeMode="contain" source={appLogo} style={styles.logo} />
        <Text style={styles.title}>Recetas RD</Text>
        <ActivityIndicator color={COLORS.primary} size="large" style={styles.loader} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  loader: {
    marginTop: SPACING.lg,
  },
});
