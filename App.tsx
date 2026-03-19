import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { ShoppingListProvider } from './src/context/ShoppingListContext';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * Componente raíz de la aplicación.
 * Configura proveedores de estado global y navegación.
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ShoppingListProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </ShoppingListProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
