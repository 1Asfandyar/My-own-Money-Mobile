import { useEffect, useMemo } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { themeColors } from '@/theme/utilities';

type AppSplashScreenProps = {
  isAppReady: boolean;
  onAnimationFinish?: () => void;
};

const AppSplashScreen = ({
  isAppReady,
  onAnimationFinish,
}: AppSplashScreenProps) => {
  const { height, width } = useWindowDimensions();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const revealProgress = useSharedValue(0);
  const splashOpacity = useSharedValue(1);

  const revealSize = useMemo(() => {
    return Math.ceil(Math.hypot(width, height) * 2);
  }, [height, width]);

  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withSequence(
      withTiming(1.06, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(1, {
        duration: 360,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
  }, [logoOpacity, logoScale]);

  useEffect(() => {
    if (!isAppReady) {
      return;
    }

    logoOpacity.value = withDelay(
      260,
      withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      }),
    );
    logoScale.value = withTiming(0.94, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
    revealProgress.value = withDelay(
      360,
      withTiming(1, {
        duration: 760,
        easing: Easing.out(Easing.cubic),
      }),
    );
    splashOpacity.value = withDelay(
      1160,
      withTiming(
        0,
        {
          duration: 140,
          easing: Easing.out(Easing.quad),
        },
        (finished) => {
          if (finished && onAnimationFinish) {
            runOnJS(onAnimationFinish)();
          }
        },
      ),
    );
  }, [
    isAppReady,
    logoOpacity,
    logoScale,
    onAnimationFinish,
    revealProgress,
    splashOpacity,
  ]);

  const splashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const revealAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: revealProgress.value }],
  }));

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        StyleSheet.absoluteFillObject,
        styles.container,
        splashAnimatedStyle,
      ]}
    >
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image
          source={require('../../../assets/logo/myownmoney_logo.png')}
          contentFit="contain"
          style={styles.logo}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.revealCircle,
          {
            borderRadius: revealSize / 2,
            height: revealSize,
            left: (width - revealSize) / 2,
            top: (height - revealSize) / 2,
            width: revealSize,
          },
          revealAnimatedStyle,
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: themeColors.secondary,
    elevation: 20,
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 20,
  },
  logo: {
    height: 150,
    width: 224,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealCircle: {
    backgroundColor: themeColors.white,
    position: 'absolute',
  },
});

export default AppSplashScreen;
