import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { View } from 'react-native';

import type { CategoryTransactionRowProps } from '@/feature/categories/types/categoryDashboard.types';
import {
  formatCategoryTransactionDate,
  formatSignedCents,
  getCategorySoftColor,
  getCategoryTypeColor,
  getSignedTransactionAmount,
} from '@/feature/categories/utils/categoryTransactions.utils';
import ThemedText from '@/theme/components/ThemedText';

const CategoryTransactionRow = ({
  categoryName,
  currencies,
  displayCurrencyId,
  transaction,
}: CategoryTransactionRowProps) => {
  const signedAmount = getSignedTransactionAmount(transaction);
  const transactionColor = getCategoryTypeColor(transaction.transaction_type);

  return (
    <View className="mt-3 flex-row items-center rounded-2xl border border-gray-100 px-4 py-3">
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: getCategorySoftColor(transactionColor) }}
      >
        <Ionicons
          name={
            transaction.transaction_type === 'income'
              ? 'arrow-up-outline'
              : 'arrow-down-outline'
          }
          size={18}
          color={transactionColor}
        />
      </View>

      <View className="ml-3 flex-1">
        <ThemedText
          className="text-sm text-gray-900"
          numberOfLines={1}
          weight="semiBold"
        >
          {transaction.title || categoryName}
        </ThemedText>
        <ThemedText className="mt-1 text-xs text-gray-500">
          {formatCategoryTransactionDate(transaction.transaction_date)}
        </ThemedText>
        {transaction.note ? (
          <ThemedText className="mt-1 text-xs text-gray-400" numberOfLines={1}>
            {transaction.note}
          </ThemedText>
        ) : null}
      </View>

      <ThemedText
        adjustsFontSizeToFit
        className="ml-3 text-sm"
        numberOfLines={1}
        style={{ color: transactionColor, maxWidth: 96 }}
        weight="bold"
      >
        {formatSignedCents(
          signedAmount,
          transaction.currency_id ?? displayCurrencyId,
          currencies,
        )}
      </ThemedText>
    </View>
  );
};

export default memo(CategoryTransactionRow);
