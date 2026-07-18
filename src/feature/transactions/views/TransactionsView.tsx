import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import SearchTransaction from '@/feature/transactions/components/SearchTransaction';
import TransactionList from '@/feature/transactions/components/TransactionList';
import TransactionsStatus from '@/feature/transactions/components/TransactionsStatus';
import type { TransactionsViewProps } from '@/feature/transactions/types/transaction.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const TransactionsView = ({ transactions }: TransactionsViewProps) => {
  const shouldShowActivity =
    transactions.hasAccount &&
    !transactions.error &&
    (!transactions.isLoading || transactions.hasLoadedTransactions);

  const listHeader = (
    <>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <ThemedText className="text-2xl text-gray-900" weight="bold">
            Transactions
          </ThemedText>
          <ThemedText className="mt-1 text-sm leading-5 text-gray-500">
            All income and expenses across your accounts.
          </ThemedText>
        </View>
      </View>

      <TransactionsStatus
        error={transactions.error}
        hasAccount={transactions.hasAccount}
        isLoading={transactions.isLoading}
        onRetry={transactions.onRefresh}
      />

      {shouldShowActivity ? (
        <>
          <View className="mt-5">
            <SearchTransaction
              accounts={transactions.activeAccounts}
              categories={transactions.categories}
              filters={transactions.filters}
              hasActiveDateFilter={transactions.hasActiveDateFilter}
              onApplyFilters={transactions.onApplyFilters}
              onClearFilters={transactions.onClearFilters}
              onClearSearch={transactions.onClearSearch}
              onSearchQueryChange={transactions.onSearchQueryChange}
              searchQuery={transactions.searchQuery}
            />
          </View>
        </>
      ) : null}
    </>
  );

  const emptyState = shouldShowActivity ? (
    <View className="mt-3 items-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-7">
      <Ionicons
        name={transactions.hasActiveFilters ? 'search-outline' : 'receipt-outline'}
        size={28}
        color={themeColors.gray400}
      />
      <ThemedText className="mt-3 text-center text-sm leading-5 text-gray-500">
        {transactions.hasActiveFilters
          ? 'No transactions matched your filters.'
          : 'No transactions found yet.'}
      </ThemedText>
    </View>
  ) : null;

  return (
    <TransactionList
      isRefreshing={transactions.isLoading}
      ListEmptyComponent={emptyState}
      ListHeaderComponent={listHeader}
      onRefresh={transactions.onRefresh}
      onSelectTransaction={transactions.onSelectTransaction}
      transactions={shouldShowActivity ? transactions.transactions : []}
    />
  );
};

export default TransactionsView;
