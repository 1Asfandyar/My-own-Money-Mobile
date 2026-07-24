import 'dotenv/config';

export default {
  expo: {
    name: "My Own Money Manager",
    slug: "myownmoneymanager",
    version: "0.0.1",
    orientation: "portrait",

    icon: "./src/assets/icons/myownmoney_light.png",

    scheme: "myownmoneymanager",
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
      package: "app.myownmoneymanager",
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
      rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      appName: process.env.EXPO_PUBLIC_APP_NAME,
      appShareUrl: process.env.EXPO_PUBLIC_APP_SHARE_URL,
      legalAppStorePolicySnippetsUrl: process.env.EXPO_PUBLIC_LEGAL_APP_STORE_POLICY_SNIPPETS_URL,
      legalCyberLiabilityStatementUrl: process.env.EXPO_PUBLIC_LEGAL_CYBER_LIABILITY_STATEMENT_URL,
      legalDataProcessingAddendumUrl: process.env.EXPO_PUBLIC_LEGAL_DATA_PROCESSING_ADDENDUM_URL,
      legalPrivacyPolicyUrl: process.env.EXPO_PUBLIC_LEGAL_PRIVACY_POLICY_URL,
      legalTermsOfServiceUrl: process.env.EXPO_PUBLIC_LEGAL_TERMS_OF_SERVICE_URL,
      legalAccountDeletionPolicyUrl: process.env.EXPO_PUBLIC_LEGAL_ACCOUNT_DELETION_POLICY_URL,
      legalCookieTrackingNoticeUrl: process.env.EXPO_PUBLIC_LEGAL_COOKIE_TRACKING_NOTICE_URL,
      eas: {
        projectId: "b5e9e61d-84d6-42a8-bdb8-d275463bd12a",
      },
    },

    owner: "abdur1547s-organization",
  },
};