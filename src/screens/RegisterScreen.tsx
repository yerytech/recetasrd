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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

/**
 * Pantalla de registro de usuario.
 */
export const RegisterScreen = ({ navigation }: Props) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    try {
      setIsSubmitting(true);
      await register(name, email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear la cuenta.';
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

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete para guardar y compartir recetas.</Text>

          <View style={styles.form}>
            <CustomInput
              autoCapitalize="words"
              label="Nombre"
              onChangeText={setName}
              placeholder="Tu nombre"
              value={name}
            />

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
              placeholder="Crea una contraseña"
              secureTextEntry
              value={password}
            />

            <CustomButton loading={isSubmitting} onPress={handleRegister} title="Crear cuenta" />
          </View>

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? <Text style={styles.linkAction}>Iniciar sesión</Text>
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
