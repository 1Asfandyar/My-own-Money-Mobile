import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    'expo-secure-store',
    '@react-native-firebase/app',
    '@react-native-google-signin/google-signin',
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    appName: process.env.EXPO_PUBLIC_APP_NAME,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
  },
});
