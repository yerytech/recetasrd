import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CustomButton } from '../components/CustomButton';
import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AppTabsParamList } from '../navigation/types';
import { getInitials } from '../utils/initials';

type Props = BottomTabScreenProps<AppTabsParamList, 'ProfileTab'>;

/**
 * Pantalla de perfil de usuario.
 */
export const ProfileScreen = ({}: Props) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>No hay sesión activa.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons color={COLORS.textSecondary} name="person-outline" size={18} />
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons color={COLORS.textSecondary} name="mail-outline" size={18} />
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        </View>

        <CustomButton
          loading={isLoggingOut}
          onPress={handleLogout}
          style={styles.logoutButton}
          title="Cerrar sesión"
          variant="outline"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: LAYOUT.contentHorizontalPadding,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarInitials: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    fontWeight: '700',
  },
  name: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  email: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  infoCard: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTexts: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  infoValue: {
    marginTop: 4,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },
  logoutButton: {
    marginTop: SPACING.lg,
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.md,
  },
});
