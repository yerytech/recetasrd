import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../hooks/useAuth';
import { AuthStackParamList } from '../navigation/types';
import { getResponsiveFontSize } from '../utils/responsive';

const appLogo = require('../../assets/logo.png');
const googleIcon = require('../../assets/google icon.png');
const appleIcon = require('../../assets/apple icon.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const isConnectivityError = (message: string): boolean => {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('network request failed') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('offline') ||
    normalized.includes('internet') ||
    normalized.includes('conex')
  );
};

export const LoginScreen = ({ navigation }: Props) => {
  const { login, recoverPassword } = useAuth();
  const { width } = useWindowDimensions();
  const isCompactScreen = width <= 360;
  const logoSize = width >= 768 ? 180 : 150;
  const buttonTextSize = width <= 360 ? 12 : width < 768 ? 14 : 16;
  const modalTitleSize = isCompactScreen ? 20 : 22;
  const modalMessageSize = isCompactScreen ? 14 : 15;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('Error de Credenciales');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorHint, setErrorHint] = useState('Por favor revisa tu correo y contraseña.');
  const [errorIcon, setErrorIcon] = useState<'alert-circle' | 'wifi-outline'>('alert-circle');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecoveringAccount, setIsRecoveringAccount] = useState(false);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);

  const handleSocialPress = () => {
    setShowSocialModal(true);
  };

  const handleOpenRecoverModal = () => {
    setRecoveryEmail(email);
    setShowRecoverModal(true);
  };

  const handleRecoverAccount = async () => {
    try {
      setIsRecoveringAccount(true);
      await recoverPassword(recoveryEmail);
      setShowRecoverModal(false);
      Alert.alert('Correo enviado', 'Revisa tu correo para recuperar tu cuenta de Supabase.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo enviar el correo de recuperación.';
      Alert.alert('Error', message);
    } finally {
      setIsRecoveringAccount(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      await login(email, password);
      setFailedLoginAttempts(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';

      setFailedLoginAttempts((previous) => previous + 1);

      if (isConnectivityError(message)) {
        setErrorTitle('Sin conexión a Internet');
        setErrorMessage('Para iniciar sesión necesitas una conexión estable a Internet.');
        setErrorHint('Verifica tu Wi-Fi o datos móviles e inténtalo de nuevo.');
        setErrorIcon('wifi-outline');
      } else {
        setErrorTitle('Error de Credenciales');
        setErrorMessage(message);
        setErrorHint('Por favor revisa tu correo y contraseña.');
        setErrorIcon('alert-circle');
      }

      setShowErrorModal(true);
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formWrapper}>
              {/* LOGO */}
              <Image source={appLogo} style={[styles.logo, { width: logoSize, height: logoSize }]} resizeMode="contain" />

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

              {failedLoginAttempts >= 3 ? (
                <Pressable onPress={handleOpenRecoverModal} style={styles.forgotContainer}>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.forgotText}
                  >
                    ¿Olvidaste tu contraseña?
                  </Text>
                </Pressable>
              ) : null}

              {/* BOTON LOGIN */}
              <Pressable style={styles.button} onPress={handleLogin}>
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  numberOfLines={1}
                  style={[styles.buttonText, { fontSize: buttonTextSize }]}
                >
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
              <Pressable style={styles.socialBtn} onPress={handleSocialPress}>
                <Image resizeMode="contain" source={googleIcon} style={styles.socialIcon} />
              </Pressable>
              <Pressable style={styles.socialBtn} onPress={handleSocialPress}>
                <Image resizeMode="contain" source={appleIcon} style={styles.socialIcon} />
              </Pressable>
              </View>

              {/* REGISTER */}
              <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>
                ¡Nuevo en Recetas RD?{' '}
                <Text style={styles.registerLink}>Regístrate</Text>
              </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal
          animationType="fade"
          transparent
          visible={showSocialModal}
          onRequestClose={() => setShowSocialModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowSocialModal(false)} />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Estamos trabajando</Text>
              <Text style={styles.modalMessage}>
                El inicio de sesión con redes sociales estará disponible pronto. Por favor inicia con correo y contraseña.
              </Text>
              <Pressable style={styles.modalButton} onPress={() => setShowSocialModal(false)}>
                <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.modalButtonText}>
                  Entendido
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent
          visible={showRecoverModal}
          onRequestClose={() => setShowRecoverModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowRecoverModal(false)} />
            <View style={styles.modalCard}>
              <Text style={[styles.modalTitle, { fontSize: modalTitleSize }]}>Recuperar cuenta</Text>
              <Text style={[styles.modalMessage, { fontSize: modalMessageSize }]}> 
                Ingresa el correo de tu cuenta de Supabase y te enviaremos un enlace para recuperar el acceso.
              </Text>
              <View style={styles.modalInputContainer}>
                <Ionicons color="#7A4E1D" name="mail-outline" size={20} style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={setRecoveryEmail}
                  placeholder="Correo Electrónico"
                  placeholderTextColor="#7A4E1D"
                  style={styles.modalInputText}
                  value={recoveryEmail}
                />
              </View>
              <View style={[styles.modalActions, isCompactScreen ? styles.modalActionsStacked : styles.modalActionsRow]}>
                <Pressable style={[styles.modalSecondaryButton, styles.modalActionButton]} onPress={() => setShowRecoverModal(false)}>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    numberOfLines={1}
                    style={[styles.modalSecondaryButtonText, isCompactScreen && styles.modalButtonTextCompact]}
                  >
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.modalActionButton]} onPress={handleRecoverAccount}>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    numberOfLines={1}
                    style={[styles.modalButtonText, isCompactScreen && styles.modalButtonTextCompact]}
                  >
                    {isRecoveringAccount ? 'Enviando...' : 'Enviar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent
          visible={showErrorModal}
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowErrorModal(false)} />
            <View style={styles.errorModalCard}>
              <View style={styles.errorIconContainer}>
                <Ionicons name={errorIcon} size={48} color="#C47F2A" />
              </View>
              <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.errorModalTitle}>
                {errorTitle}
              </Text>
              <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.errorModalMessage}>
                {errorMessage}
              </Text>
              <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.errorModalHint}>
                {errorHint}
              </Text>
              <Pressable style={styles.errorModalButton} onPress={() => setShowErrorModal(false)}>
                <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.errorModalButtonText}>
                  Intentar de Nuevo
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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

  formWrapper: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
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

  forgotContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },

  forgotText: {
    color: '#5A3A14',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    flexShrink: 1,
  },

  button: {
    width: '100%',
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
    textAlign: 'center',
    flexShrink: 1,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 22,
    backgroundColor: '#FFF6EA',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(122, 78, 29, 0.15)',
    elevation: 4,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5A3A14',
    textAlign: 'center',
    marginBottom: 12,
  },

  modalMessage: {
    fontSize: 15,
    color: '#7A4E1D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
    width: '100%',
  },

  modalButton: {
    backgroundColor: '#C47F2A',
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: 'center',
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  modalInputContainer: {
    backgroundColor: '#EAD7B8',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalInputText: {
    color: '#7A4E1D',
    flex: 1,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  modalActionsRow: {
    flexDirection: 'row',
  },

  modalActionsStacked: {
    flexDirection: 'column',
  },

  modalActionButton: {
    flex: 1,
    width: '100%',
  },

  modalSecondaryButton: {
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C47F2A',
    backgroundColor: '#FFF6EA',
  },

  modalSecondaryButtonText: {
    color: '#C47F2A',
    fontWeight: '700',
    fontSize: 15,
  },

  modalButtonTextCompact: {
    fontSize: 14,
  },

  errorModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    backgroundColor: '#FFF6EA',
    padding: 24,
    borderWidth: 2,
    borderColor: '#C47F2A',
    elevation: 4,
    alignItems: 'center',
  },

  errorIconContainer: {
    marginBottom: 16,
  },

  errorModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#C47F2A',
    textAlign: 'center',
    marginBottom: 12,
    width: '100%',
  },

  errorModalMessage: {
    fontSize: 16,
    color: '#5A3A14',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 8,
    width: '100%',
  },

  errorModalHint: {
    fontSize: 14,
    color: '#7A4E1D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    width: '100%',
  },

  errorModalButton: {
    backgroundColor: '#C47F2A',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },

  errorModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
});