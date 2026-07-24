import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const appName = Constants.expoConfig?.extra?.appName;
const appShareUrl = Constants.expoConfig?.extra?.appShareUrl;

const parseOptionalUrl = (value: unknown): string | null =>
  typeof value === 'string' && value ? value : null;

if (typeof apiUrl !== 'string' || !apiUrl) {
  throw new Error('Missing EXPO_PUBLIC_API_URL.');
}

if (typeof appName !== 'string' || !appName) {
  throw new Error('Missing EXPO_PUBLIC_APP_NAME.');
}

export const ENV = {
  API_URL: apiUrl,
  APP_NAME: appName,
  APP_SHARE_URL: parseOptionalUrl(appShareUrl),
  LEGAL_APP_STORE_POLICY_SNIPPETS_URL: parseOptionalUrl(
    Constants.expoConfig?.extra?.legalAppStorePolicySnippetsUrl,
  ),
  LEGAL_CYBER_LIABILITY_STATEMENT_URL: parseOptionalUrl(
    Constants.expoConfig?.extra?.legalCyberLiabilityStatementUrl,
  ),
  LEGAL_DATA_PROCESSING_ADDENDUM_URL: parseOptionalUrl(
    Constants.expoConfig?.extra?.legalDataProcessingAddendumUrl,
  ),
  LEGAL_PRIVACY_POLICY_URL: parseOptionalUrl(
    Constants.expoConfig?.extra?.legalPrivacyPolicyUrl,
  ),
  LEGAL_TERMS_OF_SERVICE_URL: parseOptionalUrl(
    Constants.expoConfig?.extra?.legalTermsOfServiceUrl,
  ),
  LEGAL_ACCOUNT_DELETION_POLICY_URL: parseOptionalUrl(
    Constants.expoConfig?.extra?.legalAccountDeletionPolicyUrl,
  ),
  LEGAL_COOKIE_TRACKING_NOTICE_URL: parseOptionalUrl(
    Constants.expoConfig?.extra?.legalCookieTrackingNoticeUrl,
  ),
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
