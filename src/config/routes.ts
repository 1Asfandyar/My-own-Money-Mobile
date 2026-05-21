export const ROUTES = {
  AUTH_LOGIN: '/(auth)/login',
  AUTH_REGISTER: '/(auth)/register',
  ADD_PERSONAL_RECORD: '/(main)/add-personal-record',
  ADD_SHARED_RECORD: '/(main)/add-shared-record',
  GROUP_DETAIL: '/(main)/groups/[groupId]',
  ONBOARDING: '/(onboarding)/welcome',
  MAIN_HOME: '/(main)/(tabs)/home',
} as const;
