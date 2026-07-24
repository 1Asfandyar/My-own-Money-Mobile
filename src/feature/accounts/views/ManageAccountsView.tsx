import { useCallback, useMemo } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AccountFormModal from '@/feature/accounts/components/AccountFormModal';
import AccountManagementCard from '@/feature/accounts/components/AccountManagementCard';
import type { ManageAccountsViewProps } from '@/feature/accounts/types/manageAccounts.types';
import ManagementListState from '@/feature/main/components/ManagementListState';
import ManagementScreenHeader from '@/feature/main/components/ManagementScreenHeader';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import type { Account } from '@/types/account.types';

const keyExtractor = (account: Account) => String(account.id);

const ManageAccountsView = ({ manager }: ManageAccountsViewProps) => {
  const renderAccount = useCallback<ListRenderItem<Account>>(
    ({ item }) => (
      <AccountManagementCard
        account={item}
        currencies={manager.currencies}
        isDeleting={manager.removingAccountId === item.id}
        onDelete={manager.onDeleteAccount}
      />
    ),
    [
      manager.currencies,
      manager.onDeleteAccount,
      manager.removingAccountId,
    ],
  );
  const header = useMemo(
    () => (
      <View className="mb-5">
        <ManagementScreenHeader
          addLabel="Add account"
          onAdd={manager.onOpenAddModal}
          onBack={manager.onBack}
          subtitle="Review balances, status, and account history."
          title="Manage accounts"
        />
        {manager.error && manager.accounts.length > 0 ? (
          <View className="mt-4 rounded-xl bg-red-50 px-4 py-3">
            <ThemedText className="text-sm text-red-600">
              {manager.error}
            </ThemedText>
          </View>
        ) : null}
      </View>
    ),
    [
      manager.accounts.length,
      manager.error,
      manager.onBack,
      manager.onOpenAddModal,
    ],
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <FlatList
        data={manager.isLoading ? [] : manager.accounts}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ManagementListState
            emptyMessage="Add an account to track a wallet, bank balance, or cash."
            emptyTitle="No accounts yet"
            error={manager.error}
            icon="wallet-outline"
            isLoading={manager.isLoading}
            loadingLabel="Loading accounts"
            onAdd={manager.onOpenAddModal}
            onRetry={manager.onRefresh}
          />
        }
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={manager.onRefresh}
            tintColor={themeColors.primary}
          />
        }
        renderItem={renderAccount}
        showsVerticalScrollIndicator={false}
      />

      <AccountFormModal
        accountName={manager.accountName}
        balance={manager.balance}
        currencyCode={manager.selectedCurrencyCode}
        error={manager.formError}
        isSaving={manager.isSaving}
        isVisible={manager.isAddModalVisible}
        onChangeAccountName={manager.onChangeAccountName}
        onChangeBalance={manager.onChangeBalance}
        onClose={manager.onCloseAddModal}
        onSave={manager.onSaveAccount}
      />
    </SafeAreaView>
  );
};

export default ManageAccountsView;
