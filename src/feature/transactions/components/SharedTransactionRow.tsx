import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { SHARED_EXPENSE_DASHBOARD_EXPENSE_COLOR } from '@/feature/transactions/constants/sharedExpenseDashboard.constants';
import type { SharedTransactionRowProps } from '@/feature/transactions/types/sharedExpenseDashboard.types';
import ThemedText from '@/theme/components/ThemedText';

const SharedTransactionRow = ({ transaction }: SharedTransactionRowProps) => (
  <View className="mt-3 flex-row items-center">
    <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
      <Ionicons
        name="receipt-outline"
        size={17}
        color={SHARED_EXPENSE_DASHBOARD_EXPENSE_COLOR}
      />
    </View>

    <View className="ml-3 min-w-0 flex-1">
      <ThemedText
        className="text-sm text-gray-900"
        numberOfLines={1}
        weight="semiBold"
      >
        {transaction.title}
      </ThemedText>
      <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
        {transaction.note
          ? `${transaction.dateLabel} - ${transaction.note}`
          : transaction.dateLabel}
      </ThemedText>
    </View>

    <ThemedText
      adjustsFontSizeToFit
      className="ml-3 text-sm"
      numberOfLines={1}
      style={{
        color: SHARED_EXPENSE_DASHBOARD_EXPENSE_COLOR,
        maxWidth: 92,
      }}
      weight="bold"
    >
      {transaction.amountLabel}
    </ThemedText>
  </View>
);

export default SharedTransactionRow;
