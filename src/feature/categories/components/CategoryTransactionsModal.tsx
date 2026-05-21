import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, Pressable, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import CategoryTransactionRow from '@/feature/categories/components/CategoryTransactionRow';
import { categoryTransactionsModalStyles } from '@/feature/categories/components/CategoryTransactionsModal.styles';
import { CATEGORY_COLOR_FALLBACK } from '@/feature/categories/constants/categoryDashboard.constants';
import type { CategoryTransactionsModalProps } from '@/feature/categories/types/categoryDashboard.types';
import {
  formatCategoryPercentage,
  formatSignedCents,
  getCategorySoftColor,
} from '@/feature/categories/utils/categoryTransactions.utils';
import type { Transaction } from '@/feature/transactions/types/transaction.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const keyExtractor = (transaction: Transaction) => String(transaction.id);

const CategoryTransactionsModal = ({
  categoryBreakdown,
  currencies,
  displayCurrency,
  isVisible,
  onClose,
}: CategoryTransactionsModalProps) => {
  if (!categoryBreakdown) {
    return null;
  }

  const { category, transactions } = categoryBreakdown;
  const isIncome = category.category_type === 'income';
  const color = category.color ?? CATEGORY_COLOR_FALLBACK[category.category_type];
  const categoryAmount =
    category.category_type === 'expense'
      ? -Math.abs(categoryBreakdown.amount_cents)
      : Math.abs(categoryBreakdown.amount_cents);
  const renderTransaction: ListRenderItem<Transaction> = ({ item }) => (
    <CategoryTransactionRow
      categoryName={category.name}
      currencies={currencies}
      displayCurrencyId={displayCurrency.id}
      transaction={item}
    />
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <View style={categoryTransactionsModalStyles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close transactions"
          onPress={onClose}
          style={categoryTransactionsModalStyles.backdrop}
        />

        <View
          className="rounded-t-3xl bg-white px-5 pb-6 pt-4"
          style={categoryTransactionsModalStyles.sheet}
        >
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-gray-200" />

          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <View
                className="mb-3 self-start rounded-full px-3 py-1"
                style={{ backgroundColor: getCategorySoftColor(color) }}
              >
                <ThemedText
                  className="text-xs uppercase"
                  style={{ color }}
                  weight="semiBold"
                >
                  {isIncome ? 'Income' : 'Expense'}
                </ThemedText>
              </View>
              <ThemedText className="text-xl text-gray-900" weight="bold">
                {category.name}
              </ThemedText>
              <ThemedText className="mt-1 text-sm text-gray-500">
                {formatCategoryPercentage(categoryBreakdown.percentage)} of account
                balance
              </ThemedText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close category transactions"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color={themeColors.gray700} />
            </Pressable>
          </View>

          <View
            className="mt-4 rounded-2xl px-4 py-3"
            style={{ backgroundColor: getCategorySoftColor(color) }}
          >
            <ThemedText className="text-sm text-gray-500">
              Category total
            </ThemedText>
            <ThemedText
              className="mt-1 text-2xl"
              style={{ color }}
              weight="bold"
            >
              {formatSignedCents(categoryAmount, displayCurrency.id, currencies)}
            </ThemedText>
          </View>

          <ThemedText className="mt-5 text-base text-gray-900" weight="semiBold">
            Transactions
          </ThemedText>

          <FlatList
            data={transactions}
            initialNumToRender={8}
            keyExtractor={keyExtractor}
            ListEmptyComponent={
              <View className="mt-4 items-center rounded-2xl border border-dashed border-gray-200 px-4 py-7">
                <Ionicons
                  name="receipt-outline"
                  size={28}
                  color={themeColors.gray400}
                />
                <ThemedText className="mt-3 text-center text-sm leading-5 text-gray-500">
                  No transactions were returned for this category.
                </ThemedText>
              </View>
            }
            maxToRenderPerBatch={8}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={transactions.length > 5}
            contentContainerStyle={categoryTransactionsModalStyles.transactionList}
            style={categoryTransactionsModalStyles.transactionListContainer}
            windowSize={5}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CategoryTransactionsModal;
