import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../hooks/useAuth';
import { AuthStackParamList } from '../navigation/types';

const appLogo = require('../../assets/logo.png');
const googleIcon = require('../../assets/google icon.png');
const appleIcon = require('../../assets/apple icon.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

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
    <LinearGradient
      colors={['#F2C078', '#C47F2A', '#A9651F']} // 🎨 degradado PRO
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            {/* LOGO */}
            <Image source={appLogo} style={styles.logo} resizeMode="contain" />

            {/* TITULOS */}
            <Text style={styles.title}>¡BIENVENIDO!</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

            {/* INPUT EMAIL */}
            <View style={styles.input}>
              <Ionicons color="#7A4E1D" name="mail-outline" size={20} style={styles.inputIcon} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Correo Electrónico"
                placeholderTextColor="#7A4E1D"
                style={styles.inputText}
                value={email}
              />
            </View>

            {/* INPUT PASSWORD */}
            <View style={styles.input}>
              <Ionicons color="#7A4E1D" name="lock-closed-outline" size={20} style={styles.inputIcon} />
              <TextInput
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor="#7A4E1D"
                secureTextEntry
                style={styles.inputText}
                value={password}
              />
            </View>

            {/* BOTON LOGIN */}
            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Cargando...' : 'ENTRA A LA COCINA'}
              </Text>
            </Pressable>

            {/* DIVIDER */}
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>O inicia con</Text>
              <View style={styles.line} />
            </View>

            {/* SOCIAL */}
            <View style={styles.socialContainer}>
              <View style={styles.socialBtn}>
                <Image resizeMode="contain" source={googleIcon} style={styles.socialIcon} />
              </View>
              <View style={styles.socialBtn}>
                <Image resizeMode="contain" source={appleIcon} style={styles.socialIcon} />
              </View>
            </View>

            {/* REGISTER */}
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>
                ¡Nuevo en Recetas RD?{' '}
                <Text style={styles.registerLink}>Regístrate</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },

  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#5A3A14',
  },

  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#5A3A14',
  },

  input: {
    backgroundColor: '#EAD7B8',
    padding: 18,
    borderRadius: 30,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputText: {
    color: '#7A4E1D',
    flex: 1,
  },

  inputIcon: {
    marginRight: 10,
  },

  button: {
    backgroundColor: '#C47F2A',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#FFFFFF',
  },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 25,
  },

  socialBtn: {
    width: 55,
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  socialIcon: {
    width: 50,
    height: 50,
  },

  registerText: {
    textAlign: 'center',
    color: '#5A3A14',
  },

  registerLink: {
    fontWeight: 'bold',
    color: '#e9e9e9',
  },
});