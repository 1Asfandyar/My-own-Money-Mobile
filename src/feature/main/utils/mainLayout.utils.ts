import {
    MAIN_HEADER_HIDDEN_EXACT_PATHS,
    MAIN_HEADER_HIDDEN_PATH_PREFIXES,
} from '@/feature/main/constants/mainLayout.constants';

export const shouldHideMainHeader = (pathname: string) =>
  MAIN_HEADER_HIDDEN_EXACT_PATHS.some((path) => pathname.endsWith(path)) ||
  MAIN_HEADER_HIDDEN_PATH_PREFIXES.some((prefix) => pathname.includes(prefix));
