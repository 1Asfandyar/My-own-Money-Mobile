import messaging from '@react-native-firebase/messaging';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '@/feature/notifications/api/notifications.api';
import { logger } from '@/services/logger';

const DEVICE_TOKEN_ID_KEY = 'device_token_id';

export const saveDeviceTokenId = (id: number) =>
  SecureStore.setItemAsync(DEVICE_TOKEN_ID_KEY, String(id));

export const getStoredDeviceTokenId = async (): Promise<number | null> => {
  const raw = await SecureStore.getItemAsync(DEVICE_TOKEN_ID_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
};

export const removeDeviceTokenId = () =>
  SecureStore.deleteItemAsync(DEVICE_TOKEN_ID_KEY);

const requestPermission = async (): Promise<boolean> => {
  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
};

export const registerFCMToken = async (jwtToken: string): Promise<void> => {
  try {
    const granted = await requestPermission();
    if (!granted) return;

    const fcmToken = await messaging().getToken();
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    const deviceToken = await registerDeviceToken(fcmToken, platform, jwtToken);
    await saveDeviceTokenId(deviceToken.id);
  } catch (error) {
    logger.warn('Failed to register FCM token.', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const unregisterFCMToken = async (jwtToken: string): Promise<void> => {
  try {
    const deviceTokenId = await getStoredDeviceTokenId();
    if (!deviceTokenId) return;

    await unregisterDeviceToken(deviceTokenId, jwtToken);
    await removeDeviceTokenId();
  } catch (error) {
    logger.warn('Failed to unregister FCM token.', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const setupTokenRefreshListener = (jwtToken: string): (() => void) => {
  return messaging().onTokenRefresh(async (newToken) => {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const deviceToken = await registerDeviceToken(newToken, platform, jwtToken);
      await saveDeviceTokenId(deviceToken.id);
    } catch (error) {
      logger.warn('Failed to update refreshed FCM token.', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
};
