import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AuthStackParamList } from '../navigation/types';

const appLogo = require('../../assets/logo.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/**
 * Pantalla de inicio de sesión.
 */
export const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      await login(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image resizeMode="contain" source={appLogo} style={styles.logo} />

          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Descubre recetas dominicanas en segundos.</Text>

          <View style={styles.form}>
            <CustomInput
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              value={email}
            />

            <CustomInput
              autoComplete="password"
              label="Contraseña"
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              secureTextEntry
              value={password}
            />

            <CustomButton loading={isSubmitting} onPress={handleLogin} title="Iniciar sesión" />
          </View>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
            <Text style={styles.linkText}>
              ¿No tienes cuenta? <Text style={styles.linkAction}>Registrarse</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: 6,
    marginBottom: SPACING.xl,
  },
  form: {
    width: '100%',
  },
  linkContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  linkAction: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
