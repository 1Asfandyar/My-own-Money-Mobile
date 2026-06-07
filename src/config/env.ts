import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const appName = Constants.expoConfig?.extra?.appName;

if (typeof apiUrl !== 'string' || !apiUrl) {
  throw new Error('Missing EXPO_PUBLIC_API_URL.');
}

if (typeof appName !== 'string' || !appName) {
  throw new Error('Missing EXPO_PUBLIC_APP_NAME.');
}

export const ENV = {
  API_URL: apiUrl,
  APP_NAME: appName,
} as const;

export const validateEnv = (): boolean => {
  const required = ['API_URL', 'APP_NAME'];
  const missing = required.filter(key => !ENV[key as keyof typeof ENV]);
  if (missing.length > 0) {
    console.warn(`Missing env vars: ${missing.join(', ')}`);
    return false;
  }
  return true;
};
