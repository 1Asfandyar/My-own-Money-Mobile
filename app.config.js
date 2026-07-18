import 'dotenv/config';

export default {
  expo: {
    name: "My Own Money",
    slug: "mom-money-manager",
    version: "1.0.0",
    orientation: "portrait",

    icon: "./src/assets/icons/myownmoney_light.png",

    scheme: "MyOwnMoney",
    userInterfaceStyle: "light",

    newArchEnabled: true,

    experiments: {
      typedRoutes: true,
    },

    splash: {
      image: "./src/assets/icons/myownmoney_light.png",
      resizeMode: "contain",
      backgroundColor: "#1E5A52",
    },

    ios: {
      supportsTablet: true,
    },

    android: {
      package: "com.myownmoney.app",
      adaptiveIcon: {
        foregroundImage: "./src/assets/icons/myownmoney_light.png",
        backgroundColor: "#1E5A52",
      },
      edgeToEdgeEnabled: true,
    },

    web: {
      favicon: "./src/assets/icons/myownmoney_light.png",
    },

    plugins: [
      "expo-router",
      "expo-font",
      "expo-secure-store",
    ],

    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      appName: process.env.EXPO_PUBLIC_APP_NAME,
      eas: {
        projectId: "b5e9e61d-84d6-42a8-bdb8-d275463bd12a",
      },
    },

    owner: "abdur1547s-organization",
  },
};