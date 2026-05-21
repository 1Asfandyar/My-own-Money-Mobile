import { View } from 'react-native';

import SharedTransactionRow from '@/feature/transactions/components/SharedTransactionRow';
import { SHARED_EXPENSE_DASHBOARD_EXPENSE_COLOR } from '@/feature/transactions/constants/sharedExpenseDashboard.constants';
import type { SharedExpenseFriendCardProps } from '@/feature/transactions/types/sharedExpenseDashboard.types';
import ThemedText from '@/theme/components/ThemedText';

const SharedExpenseFriendCard = ({ item }: SharedExpenseFriendCardProps) => (
  <View className="mt-2 rounded-2xl border border-gray-100 bg-white p-4">
    <View className="flex-row items-center">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-lightBlue">
        <ThemedText className="text-base text-primary" weight="bold">
          {item.initial}
        </ThemedText>
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <ThemedText
          className="text-base text-gray-900"
          numberOfLines={1}
          weight="semiBold"
        >
          {item.name}
        </ThemedText>
        <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {item.email ?? item.transactionCountLabel}
        </ThemedText>
      </View>

      <View className="ml-3 items-end">
        <ThemedText
          adjustsFontSizeToFit
          className="text-base"
          numberOfLines={1}
          style={{
            color: SHARED_EXPENSE_DASHBOARD_EXPENSE_COLOR,
            maxWidth: 104,
          }}
          weight="bold"
        >
          {item.amountLabel}
        </ThemedText>
        <ThemedText className="mt-0.5 text-xs text-gray-500">
          {item.transactionCountLabel}
        </ThemedText>
      </View>
    </View>

    <View className="mt-3 border-t border-gray-100 pt-1">
      {item.transactions.map((transaction) => (
        <SharedTransactionRow
          key={`${item.id}-${transaction.id}`}
          transaction={transaction}
        />
      ))}
    </View>

    {item.hiddenTransactionCount > 0 ? (
      <View className="mt-3 self-start rounded-full bg-gray-100 px-3 py-1">
        <ThemedText className="text-xs text-gray-500" weight="semiBold">
          + {item.hiddenTransactionCount} more
        </ThemedText>
      </View>
    ) : null}
  </View>
);

export default SharedExpenseFriendCard;
