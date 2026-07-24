import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { SelectedAccountBalanceCardProps } from '@/feature/accounts/types/accountsOverview.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatAmount, formatCents } from '@/utils/currency';

type OverviewTab = 'summary' | 'accounts';

const SelectedAccountBalanceCard = ({
  accounts,
  currencies,
  dashboardSummary,
  displayCurrency,
  onSelectAccount,
  selectedAccount,
}: SelectedAccountBalanceCardProps) => {
  const [activeTab, setActiveTab] = useState<OverviewTab>('summary');

  const summaryItems = useMemo(
    () => [
      {
        key: 'income',
        label: 'Total Income',
        valueCents: dashboardSummary.total_income,
        icon: 'arrow-up-circle-outline' as const,
        color: '#16A34A',
      },
      {
        key: 'expense',
        label: 'Total Expense',
        valueCents: dashboardSummary.total_expense,
        icon: 'arrow-down-circle-outline' as const,
        color: '#DC2626',
      },
      {
        key: 'owed-to-you',
        label: 'Owed To You',
        valueCents: dashboardSummary.total_owed_to_you_cents,
        icon: 'trending-up-outline' as const,
        color: '#0EA5E9',
      },
      {
        key: 'you-owe',
        label: 'You Owe',
        valueCents: dashboardSummary.total_you_owe_cents,
        icon: 'trending-down-outline' as const,
        color: '#F97316',
      },
    ],
    [dashboardSummary],
  );

  const totalAccountsBalanceCents = useMemo(
    () =>
      accounts.reduce(
        (total, account) => total + account.current_balance_cents,
        0,
      ),
    [accounts],
  );

  return (
    <View className="mt-4 rounded-3xl bg-secondary px-5 py-6">
      <View className="mb-4 flex-row rounded-2xl bg-white/10 p-1">
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Show account summary"
          onPress={() => setActiveTab('summary')}
          className={`flex-1 rounded-xl px-3 py-2 ${
            activeTab === 'summary' ? 'bg-white' : 'bg-transparent'
          }`}
        >
          <ThemedText
            className={`text-center text-sm ${
              activeTab === 'summary' ? 'text-secondary' : 'text-white/75'
            }`}
            weight="semiBold"
          >
            Summary
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Show account balances"
          onPress={() => setActiveTab('accounts')}
          className={`flex-1 rounded-xl px-3 py-2 ${
            activeTab === 'accounts' ? 'bg-white' : 'bg-transparent'
          }`}
        >
          <ThemedText
            className={`text-center text-sm ${
              activeTab === 'accounts' ? 'text-secondary' : 'text-white/75'
            }`}
            weight="semiBold"
          >
            Accounts
          </ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === 'summary' ? (
        <View className="flex-row flex-wrap justify-between">
          {summaryItems.map((item) => (
            <View
              key={item.key}
              className="mb-3 w-[48.5%] rounded-2xl bg-white px-3 py-3"
            >
              <View className="mb-2 flex-row items-center">
                <View
                  className="mr-2 h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${item.color}1A` }}
                >
                  <Ionicons name={item.icon} size={16} color={item.color} />
                </View>
                <ThemedText className="flex-1 text-xs text-gray-500" numberOfLines={2}>
                  {item.label}
                </ThemedText>
              </View>

              <ThemedText className="text-base text-gray-900" weight="bold" numberOfLines={1}>
                {formatAmount(item.valueCents, displayCurrency.symbol, {
                  useAbsoluteValue: true,
                })}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {activeTab === 'accounts' ? (
        <View className="overflow-hidden rounded-2xl bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <ThemedText className="flex-1 pr-3 text-xs uppercase tracking-wide text-gray-500" weight="semiBold">
              Account Name
            </ThemedText>
            <ThemedText className="text-xs uppercase tracking-wide text-gray-500" weight="semiBold">
              Balance
            </ThemedText>
          </View>

          {accounts.map((account, index) => {
            const isSelected = account.id === selectedAccount?.id;

            return (
              <TouchableOpacity
                key={account.id}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Select ${account.name} account`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectAccount(account.id)}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  index === accounts.length - 1 ? '' : 'border-b border-gray-100'
                }`}
                style={{ backgroundColor: isSelected ? `${themeColors.primary}12` : 'transparent' }}
              >
                <ThemedText className="flex-1 pr-3 text-sm text-gray-700" numberOfLines={1}>
                  {account.name}
                </ThemedText>
                <ThemedText className="text-base text-gray-900" weight="bold" numberOfLines={1}>
                  {formatCents(
                    account.current_balance_cents,
                    displayCurrency.id,
                    currencies,
                  )}
                </ThemedText>
              </TouchableOpacity>
            );
          })}

          {accounts.length > 1 ? (
            <View
              className="flex-row items-center justify-between border-t border-gray-100 px-4 py-3"
              style={{ backgroundColor: `${themeColors.primary}0D` }}
            >
              <ThemedText className="flex-1 pr-3 text-sm text-gray-600" weight="semiBold">
                Total Balance
              </ThemedText>
              <ThemedText className="text-base text-gray-900" weight="bold">
                {formatCents(totalAccountsBalanceCents, displayCurrency.id, currencies)}
              </ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default SelectedAccountBalanceCard;
