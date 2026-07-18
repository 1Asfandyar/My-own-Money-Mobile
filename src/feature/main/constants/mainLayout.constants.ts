export const MAIN_HEADER_HIDDEN_EXACT_PATHS = [
  '/add-personal-record',
  '/add-shared-record',
  '/manage-accounts',
  '/manage-categories',
  '/manage-friends',
  '/record-payment',
] as const;

export const MAIN_HEADER_HIDDEN_PATH_PREFIXES = [
  '/friendship/',
  '/groups/',
  '/transaction/',
] as const;

export const MAIN_HEADER_SCREEN_TITLES: Record<string, string> = {
  '/home': 'Home',
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/groups': 'Groups',
  '/reports': 'Reports',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/information': 'Information',
};

export const MAIN_HEADER_DEFAULT_SCREEN_TITLE = 'Home';
