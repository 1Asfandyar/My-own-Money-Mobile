import { StyleSheet } from 'react-native';

import {
  SHARED_EXPENSE_DASHBOARD_CARD_HEIGHT,
  SHARED_EXPENSE_DASHBOARD_VISIBLE_ITEM_COUNT,
} from '@/feature/transactions/constants/sharedExpenseDashboard.constants';

export const sharedExpenseDashboardStyles = StyleSheet.create({
  friendsList: {
    maxHeight:
      SHARED_EXPENSE_DASHBOARD_VISIBLE_ITEM_COUNT *
      SHARED_EXPENSE_DASHBOARD_CARD_HEIGHT,
  },
});
