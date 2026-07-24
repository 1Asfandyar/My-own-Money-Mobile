import * as SecureStore from 'expo-secure-store';

const BALANCE_VISIBILITY_KEY = 'balance_visibility';

/**
 * Persists the user's last balance show/hide choice so the privacy
 * preference carries over between app sessions. New users default to
 * hidden (see getStoredBalanceVisibility) to avoid exposing financial
 * data by default in public/social settings.
 */
export const getStoredBalanceVisibility = async (): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(BALANCE_VISIBILITY_KEY);

  if (value === null) return false;

  return value === 'true';
};

export const saveBalanceVisibility = (isVisible: boolean) =>
  SecureStore.setItemAsync(BALANCE_VISIBILITY_KEY, isVisible ? 'true' : 'false');
