import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    'expo-secure-store',
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    appName: process.env.EXPO_PUBLIC_APP_NAME,
  },
});
