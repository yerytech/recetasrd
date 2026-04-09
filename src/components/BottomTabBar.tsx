import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { getResponsiveValue } from '../utils/responsive';

export type HomeTabKey = 'home' | 'search' | 'favorites' | 'profile';

type BottomTabBarProps = {
  activeTab?: HomeTabKey;
  onTabPress: (tab: HomeTabKey) => void;
  bottomInset?: number;
};

type TabConfig = {
  key: HomeTabKey;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { key: 'home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'search', icon: 'search-outline', activeIcon: 'search' },
  { key: 'favorites', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'profile', icon: 'person-outline', activeIcon: 'person' },
];

/**
 * Barra inferior personalizada para Home.
 */
export const BottomTabBar = ({ activeTab, onTabPress, bottomInset = 0 }: BottomTabBarProps) => {
  const { width } = useWindowDimensions();
  const iconSize = getResponsiveValue(width, {
    compact: 22,
    regular: 25,
    tablet: 27,
    desktop: 28,
  });
  const tabButtonWidth = getResponsiveValue(width, {
    compact: 52,
    regular: 64,
    tablet: 74,
    desktop: 80,
  });
  const centerSpace = getResponsiveValue(width, {
    compact: 54,
    regular: 72,
    tablet: 84,
    desktop: 96,
  });

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottomInset, 10) }]}>
      <View style={styles.content}>
        {TABS.slice(0, 2).map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              style={({ pressed }) => [styles.tabButton, { width: tabButtonWidth }, pressed && styles.pressed]}
            >
              <Ionicons
                color="#FFFFFF"
                name={isActive ? tab.activeIcon : tab.icon}
                size={iconSize}
                style={!isActive && styles.inactiveIcon}
              />
            </Pressable>
          );
        })}

        <View style={[styles.centerSpace, { width: centerSpace }]} />

        {TABS.slice(2).map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              style={({ pressed }) => [styles.tabButton, { width: tabButtonWidth }, pressed && styles.pressed]}
            >
              <Ionicons
                color="#FFFFFF"
                name={isActive ? tab.activeIcon : tab.icon}
                size={iconSize}
                style={!isActive && styles.inactiveIcon}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#C9822B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    width: 64,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
  inactiveIcon: {
    opacity: 0.82,
  },
  centerSpace: {
    width: 72,
  },
});
