import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';
import { AddRecipeScreen } from '../screens/AddRecipeScreen';

import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { AppTabsParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';

const Tab = createBottomTabNavigator<AppTabsParamList>();

/**
 * Navegador principal con pestañas de la aplicación.
 */
export const AppTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          height: 64,
          paddingTop: SPACING.xs,
          paddingBottom: SPACING.xs,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.white,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const iconByRoute: Record<keyof AppTabsParamList, keyof typeof Ionicons.glyphMap> = {
            HomeTab: 'home-outline',
            SearchTab: 'search-outline',
            AddTab: 'add-circle-outline',
            ShoppingListTab: 'checkbox-outline',
            ProfileTab: 'person-outline',
          };

          return <Ionicons color={color} name={iconByRoute[route.name]} size={size} />;
        },
      })}
    >
      <Tab.Screen
        component={HomeScreen}
        name="HomeTab"
        options={{
          title: 'Home',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen component={SearchScreen} name="SearchTab" options={{ title: 'Buscar' }} />
      <Tab.Screen component={AddRecipeScreen} name="AddTab" options={{ title: 'Agregar' }} />
      <Tab.Screen component={ShoppingListScreen} name="ShoppingListTab" options={{ title: 'Lista' }} />
      <Tab.Screen component={ProfileScreen} name="ProfileTab" options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};
