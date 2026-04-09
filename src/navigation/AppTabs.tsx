import { BottomTabBarProps as NavigationBottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar, HomeTabKey } from '../components/BottomTabBar';
import { FloatingButton } from '../components/FloatingButton';

import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { AppTabsParamList } from './types';
import { AddRecetaScreen } from '../screens/AddRecetaScreen';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const ROUTE_BY_TAB: Record<HomeTabKey, keyof AppTabsParamList> = {
  home: 'HomeTab',
  search: 'SearchTab',
  favorites: 'ShoppingListTab',
  profile: 'ProfileTab',
};

const TAB_BY_ROUTE: Partial<Record<keyof AppTabsParamList, HomeTabKey>> = {
  HomeTab: 'home',
  SearchTab: 'search',
  ShoppingListTab: 'favorites',
  ProfileTab: 'profile',
};

const AppCustomTabBar = ({ state, navigation }: NavigationBottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const currentRoute = state.routes[state.index]?.name as keyof AppTabsParamList;
  const activeTab = TAB_BY_ROUTE[currentRoute];

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleTabPress = (tab: HomeTabKey) => {
    navigation.navigate(ROUTE_BY_TAB[tab]);
  };

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View style={styles.tabBarWrapper}>
      <BottomTabBar activeTab={activeTab} bottomInset={insets.bottom} onTabPress={handleTabPress} />
      <FloatingButton
        bottomInset={insets.bottom}
        onPress={() => navigation.navigate('AddTab')}
      />
    </View>
  );
};

/**
 * Navegador principal con pestañas de la aplicación.
 */
export const AppTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <AppCustomTabBar {...props} />}
    >
      <Tab.Screen component={HomeScreen} name="HomeTab" options={{ title: 'Home' }} />
      <Tab.Screen component={SearchScreen} name="SearchTab" options={{ title: 'Buscar' }} />
      <Tab.Screen
        component={AddRecetaScreen}
        name="AddTab"
        options={{
          title: 'Agregar',
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen component={ShoppingListScreen} name="ShoppingListTab" options={{ title: 'Lista' }} />
      <Tab.Screen component={ProfileScreen} name="ProfileTab" options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'relative',
  },
});
