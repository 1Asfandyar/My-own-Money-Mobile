import { ScrollView, View } from 'react-native';

import type { ReportAccount } from '@/feature/reports/types/report.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const formatBalance = (cents: number, currencyCode: string): string => {
  const amount = cents / 100;
  return amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

interface AccountCardProps {
  name: string;
  balanceLabel: string;
  currencyCode: string;
  isTotal?: boolean;
}

const AccountCard = ({ name, balanceLabel, currencyCode, isTotal }: AccountCardProps) => (
  <View
    className="mr-3 w-36 rounded-2xl border px-4 py-4"
    style={{
      borderColor: isTotal ? `${themeColors.primary}33` : `${themeColors.gray300}`,
      backgroundColor: isTotal ? `${themeColors.primary}10` : themeColors.white,
    }}
  >
    <ThemedText className="text-xs text-gray-500" numberOfLines={1}>
      {name}
    </ThemedText>
    <ThemedText className="mt-1 text-lg text-gray-900" weight="bold" numberOfLines={1} adjustsFontSizeToFit>
      {balanceLabel}
    </ThemedText>
    <ThemedText className="mt-0.5 text-xs text-gray-400" weight="semiBold">
      {currencyCode}
    </ThemedText>
  </View>
);

interface AccountBalancesRowProps {
  accounts: ReportAccount[];
  totalBalanceCents: number;
}

const AccountBalancesRow = ({ accounts, totalBalanceCents }: AccountBalancesRowProps) => {
  const defaultCode = accounts[0]?.currency_code ?? 'PKR';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
    >
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          name={account.name}
          balanceLabel={formatBalance(account.balance_cents, account.currency_code)}
          currencyCode={account.currency_code}
        />
      ))}

      {accounts.length > 1 && (
        <AccountCard
          name="Total"
          balanceLabel={formatBalance(totalBalanceCents, defaultCode)}
          currencyCode={defaultCode}
          isTotal
        />
      )}
    </ScrollView>
  );
};

export default AccountBalancesRow;
