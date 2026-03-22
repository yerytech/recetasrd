import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { DesayunoScreen } from '../screens/DesayunoScreen';
import { AlmuerzoScreen } from '../screens/AlmuerzoScreen';
import { CenaScreen } from '../screens/CenaScreen';
import { PostresScreen } from '../screens/PostresScreen';
import { AppTabs } from './AppTabs';
import { AuthNavigator } from './AuthNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.white,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.primary,
  },
};

/**
 * Navegador raíz que separa autenticación del flujo principal.
 */
export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen component={AppTabs} name="App" />
            <Stack.Screen component={RecipeDetailScreen} name="RecipeDetail" />
            <Stack.Screen component={DesayunoScreen} name="Desayuno" />
            <Stack.Screen component={AlmuerzoScreen} name="Almuerzo" />
            <Stack.Screen component={CenaScreen} name="Cena" />
            <Stack.Screen component={PostresScreen} name="Postres" />
          </>
        ) : (
          <Stack.Screen component={AuthNavigator} name="Auth" />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
