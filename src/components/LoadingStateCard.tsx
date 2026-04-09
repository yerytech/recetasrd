import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';

type LoadingStateCardProps = {
  title: string;
  subtitle?: string;
};

export const LoadingStateCard = ({ title, subtitle }: LoadingStateCardProps) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const animatedCardStyle = {
    opacity: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.94, 1],
    }),
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.992, 1],
        }),
      },
    ],
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.card, animatedCardStyle]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'transparent',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    width: '100%',
  },
});
