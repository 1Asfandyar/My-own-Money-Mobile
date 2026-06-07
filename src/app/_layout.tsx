import AppSplashScreen from '@/feature/splash/components/AppSplashScreen';
import { useAuthStore } from '@/store/auth.store';
import { appFonts } from '@/theme/fonts';
import { themeColors } from '@/theme/utilities';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import '../../global.css';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useFonts(appFonts);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isRestoring = useAuthStore((state) => state.isRestoring);
  const isAppReady = fontsLoaded && !isRestoring;

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Expo can report that the native splash was already dismissed.
      }
    };
    void hideNativeSplash();
  }, []);

  const handleSplashAnimationFinish = useCallback(() => {
    setIsSplashVisible(false);
  }, []);

  return (
    <View style={styles.root}>
      {isAppReady ? <Stack screenOptions={{ headerShown: false }} /> : null}
      {isSplashVisible ? (
        <AppSplashScreen
          isAppReady={isAppReady}
          onAnimationFinish={handleSplashAnimationFinish}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: themeColors.white,
    flex: 1,
  },
});