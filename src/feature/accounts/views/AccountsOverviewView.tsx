import { ScrollView, View } from 'react-native';

import AccountsOverviewHeader from '@/feature/accounts/components/AccountsOverviewHeader';
import AccountsOverviewStatus from '@/feature/accounts/components/AccountsOverviewStatus';
import SelectedAccountBalanceCard from '@/feature/accounts/components/SelectedAccountBalanceCard';
import type { AccountsOverviewViewProps } from '@/feature/accounts/types/accountsOverview.types';
import CategoryTransactionsModal from '@/feature/categories/components/CategoryTransactionsModal';
import PersonalCategoryDashboard from '@/feature/categories/components/PersonalCategoryDashboard';
import SharedFriendshipDashboard from '@/feature/friendships/components/SharedFriendshipDashboard';
import AddTransactionFab from '@/feature/transactions/components/AddTransactionFab';
import ExpenseOverviewTabs from '@/feature/transactions/components/ExpenseOverviewTabs';

const AccountsOverviewView = ({ dashboard }: AccountsOverviewViewProps) => {
  const hasAccounts = dashboard.activeAccounts.length > 0;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          // Extra bottom padding keeps the last list item clear of the
          // floating add-transaction button so content is never occluded.
          paddingBottom: 220,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AccountsOverviewHeader
          firstName={dashboard.userFirstName}
          onRefresh={dashboard.refreshOverview}
        />

        <SelectedAccountBalanceCard
          accounts={dashboard.activeAccounts}
          currencies={dashboard.currencies}
          displayCurrency={dashboard.displayCurrency}
          selectedAccount={dashboard.selectedAccount}
          onSelectAccount={dashboard.selectAccount}
        />

        <AccountsOverviewStatus
          error={dashboard.error}
          hasAccounts={hasAccounts}
          isLoading={dashboard.isLoading}
          onRetry={dashboard.refreshAccounts}
        />

        {hasAccounts && !dashboard.isLoading && !dashboard.error ? (
          <ExpenseOverviewTabs
            selectedTab={dashboard.selectedExpenseTab}
            onSelectTab={dashboard.setSelectedExpenseTab}
          >
            {dashboard.selectedExpenseTab === 'personal' ? (
              <PersonalCategoryDashboard
                categories={dashboard.categoryBreakdowns}
                currencies={dashboard.currencies}
                displayCurrency={dashboard.displayCurrency}
                error={dashboard.categoryDashboardError}
                isLoading={dashboard.isCategoryDashboardLoading}
                onRetry={dashboard.refreshCategoryDashboard}
                onSelectCategory={dashboard.selectDashboardCategory}
                selectedAccount={dashboard.selectedAccount}
                totalExpenseCents={dashboard.categoryTotals.totalExpenseCents}
                totalIncomeCents={dashboard.categoryTotals.totalIncomeCents}
              />
            ) : (
              <SharedFriendshipDashboard
                currencies={dashboard.currencies}
                displayCurrency={dashboard.displayCurrency}
                error={dashboard.friendshipDashboardError}
                isLoading={dashboard.isFriendshipDashboardLoading}
                ledgers={dashboard.friendshipLedgers}
                onSelectFriendship={dashboard.selectFriendship}
                onRetry={dashboard.refreshFriendshipDashboard}
              />
            )}
          </ExpenseOverviewTabs>
        ) : null}
      </ScrollView>

      <AddTransactionFab selectedAccountId={dashboard.selectedAccount?.id} />

      <CategoryTransactionsModal
        categoryBreakdown={dashboard.selectedCategoryBreakdown}
        currencies={dashboard.currencies}
        displayCurrency={dashboard.displayCurrency}
        isVisible={Boolean(dashboard.selectedCategoryBreakdown)}
        onAddRecord={dashboard.addDashboardCategoryRecord}
        onClose={dashboard.closeDashboardCategory}
        onSelectTransaction={dashboard.selectDashboardCategoryTransaction}
      />
    </View>
  );
};

export default AccountsOverviewView;
