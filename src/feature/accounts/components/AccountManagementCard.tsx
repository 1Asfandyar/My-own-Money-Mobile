import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import type { AccountManagementCardProps } from '@/feature/accounts/types/manageAccounts.types';
import { formatAccountDate } from '@/feature/accounts/utils/accountDisplay.utils';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatCents, formatCentsBySymbol, getCurrencyById } from '@/utils/currency';

const InformationRow = ({ label, value }: { label: string; value: string }) => (
  <View className="mt-3 flex-row items-start justify-between">
    <ThemedText className="text-sm text-gray-500">{label}</ThemedText>
    <ThemedText
      className="ml-4 flex-1 text-right text-sm text-gray-800"
      selectable
      weight="semiBold"
    >
      {value}
    </ThemedText>
  </View>
);

const AccountManagementCard = ({
  account,
  currencies,
  isDeleting,
  onDelete,
}: AccountManagementCardProps) => {
  const fallbackCurrency = getCurrencyById(account.currency_id, currencies);
  const currencySymbol = account.currency_symbol ?? fallbackCurrency.symbol;
  const balanceLabel = account.currency_symbol
    ? formatCentsBySymbol(account.current_balance_cents, currencySymbol)
    : formatCents(account.current_balance_cents, fallbackCurrency.id, currencies);
  const openingBalanceLabel = account.currency_symbol
    ? formatCentsBySymbol(account.initial_balance_cents, currencySymbol)
    : formatCents(account.initial_balance_cents, fallbackCurrency.id, currencies);

  return (
    <View className="mb-4 rounded-2xl border border-gray-200 bg-white px-5 py-5">
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Ionicons name="wallet-outline" size={22} color={themeColors.primary} />
        </View>
        <View className="ml-3 min-w-0 flex-1">
          <ThemedText
            className="text-base text-gray-900"
            numberOfLines={1}
            weight="semiBold"
          >
            {account.name}
          </ThemedText>
          <ThemedText className="mt-0.5 text-xs text-gray-500">
            Default currency
          </ThemedText>
        </View>
        <View
          className={`rounded-full px-3 py-1 ${
            account.is_archived ? 'bg-gray-100' : 'bg-emerald-50'
          }`}
        >
          <ThemedText
            className={account.is_archived ? 'text-gray-600' : 'text-emerald-700'}
            weight="semiBold"
          >
            {account.is_archived ? 'Archived' : 'Active'}
          </ThemedText>
        </View>
      </View>

      <View className="mt-4 h-px bg-gray-100" />
      <InformationRow
        label="Current balance"
        value={balanceLabel}
      />
      <InformationRow
        label="Opening balance"
        value={openingBalanceLabel}
      />
      <InformationRow label="Currency" value={currencySymbol} />
      <InformationRow label="Created" value={formatAccountDate(account.created_at)} />

      <TouchableOpacity
        activeOpacity={0.76}
        accessibilityLabel={`Remove ${account.name}`}
        accessibilityRole="button"
        className="mt-5 flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        disabled={isDeleting}
        onPress={() => onDelete(account)}
      >
        {isDeleting ? (
          <ActivityIndicator color="#DC2626" size="small" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={17} color="#DC2626" />
            <ThemedText className="ml-2 text-sm text-red-600" weight="semiBold">
              Remove account
            </ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AccountManagementCard;
