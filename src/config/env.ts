import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const appName = Constants.expoConfig?.extra?.appName;
const googleClientId = Constants.expoConfig?.extra?.googleClientId;

if (typeof apiUrl !== 'string' || !apiUrl) {
  throw new Error('Missing EXPO_PUBLIC_API_URL.');
}

if (typeof appName !== 'string' || !appName) {
  throw new Error('Missing EXPO_PUBLIC_APP_NAME.');
}

if (typeof googleClientId !== 'string' || !googleClientId) {
  throw new Error('Missing GOOGLE_CLIENT_ID.');
}

export const ENV = {
  API_URL: apiUrl,
  APP_NAME: appName,
  GOOGLE_CLIENT_ID: googleClientId,
} as const;

export const validateEnv = (): boolean => {
  const required = ['API_URL', 'APP_NAME', 'GOOGLE_CLIENT_ID'];
  const missing = required.filter(key => !ENV[key as keyof typeof ENV]);
  if (missing.length > 0) {
    console.warn(`Missing env vars: ${missing.join(', ')}`);
    return false;
  }
  return true;
};
