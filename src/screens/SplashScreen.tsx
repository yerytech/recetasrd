import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const appLogo = require('../../assets/logo.png');

export const SplashScreen = () => {
  const { width } = useWindowDimensions();
  const logoSize = Math.max(150, Math.min(width * 0.45, 240));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Image 
          source={appLogo}
          resizeMode="contain"
          style={[styles.logo, { width: logoSize, height: logoSize }]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#C47F2A', 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 240,
  },
});