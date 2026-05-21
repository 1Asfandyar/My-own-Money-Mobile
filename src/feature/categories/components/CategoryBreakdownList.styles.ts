import { StyleSheet } from 'react-native';

import {
  CATEGORY_DASHBOARD_ROW_HEIGHT,
  CATEGORY_DASHBOARD_VISIBLE_ITEM_COUNT,
} from '@/feature/categories/constants/categoryDashboard.constants';
import { themeColors } from '@/theme/utilities';

export const categoryBreakdownListStyles = StyleSheet.create({
  categoryCard: {
    shadowColor: themeColors.black,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
  categoryChevron: {
    marginTop: 18,
  },
  scrollContainer: {
    maxHeight:
      CATEGORY_DASHBOARD_VISIBLE_ITEM_COUNT * CATEGORY_DASHBOARD_ROW_HEIGHT,
  },
});
