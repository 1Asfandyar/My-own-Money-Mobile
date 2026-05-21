import { StyleSheet } from 'react-native';

import { themeColors } from '@/theme/utilities';

export const transactionListStyles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 144,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  row: {
    shadowColor: themeColors.black,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
});
