export const ROUTES = {
  AUTH_LOGIN: '/(auth)/login',
  AUTH_REGISTER: '/(auth)/register',
  ADD_PERSONAL_RECORD: '/(main)/add-personal-record',
  ADD_SHARED_RECORD: '/(main)/add-shared-record',
  RECORD_PAYMENT: '/(main)/record-payment',
  FRIENDSHIP_DETAIL: '/(main)/friendship/[friendshipId]',
  SHARED_TRANSACTION_DETAIL: '/(main)/shared-transaction/[transactionId]',
  GROUP_DETAIL: '/(main)/groups/[groupId]',
  ONBOARDING: '/(onboarding)/welcome',
  MAIN_HOME: '/(main)/(tabs)/home',
} as const;
