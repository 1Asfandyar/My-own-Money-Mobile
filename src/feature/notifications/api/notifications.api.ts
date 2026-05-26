import { apiRequest } from '@/services/api';

type DeviceToken = {
  id: number;
  token: string;
  platform: string;
  user_id: number;
};

type RegisterTokenResponse = {
  success: true;
  device_token: DeviceToken;
};

export const registerDeviceToken = async (
  fcmToken: string,
  platform: 'android' | 'ios',
  jwtToken: string,
): Promise<DeviceToken> => {
  const { data } = await apiRequest<RegisterTokenResponse>('/api/v0/device_tokens', {
    method: 'POST',
    body: { token: fcmToken, platform },
    token: jwtToken,
  });

  return data.device_token;
};

export const unregisterDeviceToken = async (
  deviceTokenId: number,
  jwtToken: string,
): Promise<void> => {
  await apiRequest(`/api/v0/device_tokens/${deviceTokenId}`, {
    method: 'DELETE',
    token: jwtToken,
  });
};
