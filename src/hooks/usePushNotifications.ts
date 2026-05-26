import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { setupTokenRefreshListener } from '@/services/notifications';
import { useAuthStore } from '@/store/auth.store';

const navigateFromMessage = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  router: ReturnType<typeof useRouter>,
) => {
  const transactionId = remoteMessage.data?.transaction_id;
  if (transactionId) {
    router.push('/(main)/(tabs)/transactions');
  }
};

export const usePushNotifications = () => {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const initialNotificationHandled = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      // Foreground message received — the OS does not show a notification banner.
      // Show an in-app alert or badge here if needed.
      void remoteMessage;
    });

    const unsubscribeRefresh = setupTokenRefreshListener(token);

    return () => {
      unsubscribeForeground();
      unsubscribeRefresh();
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // App brought to foreground by tapping a notification
    const unsubscribeOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      navigateFromMessage(remoteMessage, router);
    });

    // App launched from a killed state by tapping a notification (consumed once)
    if (!initialNotificationHandled.current) {
      initialNotificationHandled.current = true;
      void messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) navigateFromMessage(remoteMessage, router);
        });
    }

    return () => {
      unsubscribeOpened();
    };
  }, [isAuthenticated, router]);
};
