import { DefaultTheme, NavigationContainer, LinkingOptions } from '@react-navigation/native';
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

// Esta configuración permite que cuando alguien comparta una receta mediante un link,
// la app abra directamente esa pantalla. Ejemplo: si compartes recetasrd://recipe/123,
// la app abrirá el detalle de esa receta automáticamente
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['recetasrd://', 'https://recetasrd.app'],
  config: {
    screens: {
      RecipeDetail: 'recipe/:recipeId',
      App: '',
      Desayuno: 'desayuno',
      Almuerzo: 'almuerzo',
      Cena: 'cena',
      Postres: 'postres',
      Auth: 'auth',
    },
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
    // deep linking permite que cuando compartan un link de receta, se abra automaticamente en la app
    <NavigationContainer theme={navTheme} linking={linking} fallback={<SplashScreen />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
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
