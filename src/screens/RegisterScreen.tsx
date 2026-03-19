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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

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
    <LinearGradient colors={['#F2C078', '#C47F2A', '#A9651F']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Image source={appLogo} style={styles.logo} resizeMode="contain" />

            <Text style={styles.title}>¡ÚNETE A NOSOTROS!</Text>
            <Text style={styles.subtitle}>Crea una cuenta</Text>

            <View style={styles.input}>
              <Ionicons color="#7A4E1D" name="person-outline" size={20} style={styles.inputIcon} />
              <TextInput
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Nombre"
                placeholderTextColor="#7A4E1D"
                style={styles.inputText}
                value={name}
              />
            </View>

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

            <View style={styles.input}>
              <Ionicons color="#7A4E1D" name="lock-closed-outline" size={20} style={styles.inputIcon} />
              <TextInput
                onChangeText={setConfirmPassword}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#7A4E1D"
                secureTextEntry
                style={styles.inputText}
                value={confirmPassword}
              />
            </View>

            <Pressable style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Cargando...' : 'EMPEZAR A COCINAR'}
              </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.registerText}>
                ¿Ya tienes una cuenta?{' '}
                <Text style={styles.registerLink}>Iniciar sesión</Text>
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

  registerText: {
    textAlign: 'center',
    color: '#5A3A14',
  },

  registerLink: {
    fontWeight: 'bold',
    color: '#e9e9e9',
  },
});
