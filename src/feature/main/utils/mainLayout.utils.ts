import {
    MAIN_HEADER_DEFAULT_SCREEN_TITLE,
    MAIN_HEADER_HIDDEN_EXACT_PATHS,
    MAIN_HEADER_HIDDEN_PATH_PREFIXES,
    MAIN_HEADER_SCREEN_TITLES,
} from '@/feature/main/constants/mainLayout.constants';

export const shouldHideMainHeader = (pathname: string) =>
  MAIN_HEADER_HIDDEN_EXACT_PATHS.some((path) => pathname.endsWith(path)) ||
  MAIN_HEADER_HIDDEN_PATH_PREFIXES.some((prefix) => pathname.includes(prefix));

// A persistent screen title keeps users oriented after they scroll past
// the in-content "Welcome" greeting, satisfying "visibility of system status".
export const getMainHeaderScreenTitle = (pathname: string) => {
  const matchingPath = Object.keys(MAIN_HEADER_SCREEN_TITLES).find((path) =>
    pathname.endsWith(path),
  );

  return matchingPath
    ? MAIN_HEADER_SCREEN_TITLES[matchingPath]
    : MAIN_HEADER_DEFAULT_SCREEN_TITLE;
};
