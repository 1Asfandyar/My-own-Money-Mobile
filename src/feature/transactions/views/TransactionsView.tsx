import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import AccountPickerModal from '@/feature/accounts/components/AccountPickerModal';
import SearchTransaction from '@/feature/transactions/components/SearchTransaction';
import TransactionList from '@/feature/transactions/components/TransactionList';
import TransactionsAccountCard from '@/feature/transactions/components/TransactionsAccountCard';
import TransactionsStatus from '@/feature/transactions/components/TransactionsStatus';
import TransactionsSummary from '@/feature/transactions/components/TransactionsSummary';
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
            All income and expenses for the current account.
          </ThemedText>
        </View>
      </View>

      <TransactionsAccountCard
        accountBalanceLabel={transactions.accountBalanceLabel}
        accountCurrencyCode={transactions.accountCurrencyCode}
        selectedAccount={transactions.selectedAccount}
        onChangeAccountPress={transactions.onChangeAccountPress}
      />

      <TransactionsStatus
        error={transactions.error}
        hasAccount={transactions.hasAccount}
        isLoading={transactions.isLoading}
        onRetry={transactions.onRefresh}
      />

      {shouldShowActivity ? (
        <>
          <TransactionsSummary metrics={transactions.summaryMetrics} />

          <View className="mt-5">
            <ThemedText className="text-base text-gray-900" weight="semiBold">
              Recent activity
            </ThemedText>

            <SearchTransaction
              dateFilters={transactions.dateFilters}
              hasActiveDateFilter={transactions.hasActiveDateFilter}
              onApplyDateFilters={transactions.onApplyDateFilters}
              onClearDateFilters={transactions.onClearDateFilters}
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
          : 'No transactions found for this account yet.'}
      </ThemedText>
    </View>
  ) : null;

  return (
    <>
      <TransactionList
        isRefreshing={transactions.isLoading}
        ListEmptyComponent={emptyState}
        ListHeaderComponent={listHeader}
        onRefresh={transactions.onRefresh}
        transactions={shouldShowActivity ? transactions.transactions : []}
      />

      <AccountPickerModal
        accounts={transactions.activeAccounts}
        currencies={transactions.currencies}
        isVisible={transactions.isAccountPickerVisible}
        selectedAccount={transactions.selectedAccount}
        onClose={transactions.onCloseAccountPicker}
        onSelectAccount={transactions.onSelectAccount}
      />
    </>
  );
};

export default TransactionsView;
