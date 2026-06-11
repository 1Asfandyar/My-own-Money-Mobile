import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { transactionListStyles } from '@/feature/transactions/components/TransactionList.styles';
import type { TransactionRowProps } from '@/feature/transactions/types/transaction.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const TransactionRow = ({ onPress, transaction }: TransactionRowProps) => (
  <TouchableOpacity
    activeOpacity={0.78}
    accessibilityRole="button"
    accessibilityLabel={`View ${transaction.title}`}
    className="mt-3 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-3"
    onPress={() => onPress?.(transaction.sourceTransaction)}
    style={transactionListStyles.row}
  >
    <View
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor: transaction.softColor }}
    >
      <Ionicons
        name={transaction.iconName}
        size={20}
        color={transaction.color}
      />
    </View>

    <View className="ml-3 flex-1">
      <View className="flex-row items-start justify-between">
        <ThemedText
          className="flex-1 pr-2 text-sm text-gray-900"
          numberOfLines={1}
          weight="semiBold"
        >
          {transaction.title}
        </ThemedText>
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: transaction.softColor }}
        >
          <ThemedText
            className="text-[10px] uppercase"
            style={{ color: transaction.color }}
            weight="semiBold"
          >
            {transaction.summaryLabel}
          </ThemedText>
        </View>
      </View>

      <View className="mt-1 flex-row items-center justify-between">
        <ThemedText className="flex-1 pr-2 text-xs text-gray-500" numberOfLines={1}>
          {transaction.secondaryLine}
        </ThemedText>
        <ThemedText
          adjustsFontSizeToFit
          className="text-sm"
          numberOfLines={1}
          style={{ color: transaction.color, maxWidth: 100 }}
          weight="bold"
        >
          {transaction.summaryAmountLabel}
        </ThemedText>
      </View>

      {transaction.note ? (
        <ThemedText className="mt-1 text-xs text-gray-400" numberOfLines={1}>
          {transaction.note}
        </ThemedText>
      ) : null}
    </View>

    <Ionicons
      name="chevron-forward"
      size={18}
      color={themeColors.gray400}
      style={{ marginLeft: 6 }}
    />
  </TouchableOpacity>
);

export default memo(TransactionRow);
