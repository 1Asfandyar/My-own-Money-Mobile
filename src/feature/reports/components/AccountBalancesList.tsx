import { View } from 'react-native';

import type { ReportAccount } from '@/feature/reports/types/report.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatAmount } from '@/utils/currency';

interface AccountListRowProps {
  name: string;
  amountLabel: string;
  isLast: boolean;
  isTotal?: boolean;
}

const AccountListRow = ({ name, amountLabel, isLast, isTotal }: AccountListRowProps) => (
  <View
    className={`flex-row items-center justify-between px-4 py-3 ${isLast ? '' : 'border-b border-gray-100'}`}
    style={{ backgroundColor: isTotal ? `${themeColors.primary}0D` : 'transparent' }}
  >
    <ThemedText className="flex-1 pr-3 text-sm text-gray-500" numberOfLines={1}>
      {name}
    </ThemedText>
    <ThemedText
      className="text-lg text-gray-900"
      weight="bold"
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {amountLabel}
    </ThemedText>
  </View>
);

interface AccountBalancesListProps {
  accounts: ReportAccount[];
  totalBalanceCents: number;
  currencySymbol: string;
}

const AccountBalancesList = ({
  accounts,
  totalBalanceCents,
  currencySymbol,
}: AccountBalancesListProps) => {
  const showTotal = accounts.length > 1;

  return (
    <View className="mx-4 overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {accounts.map((account, index) => {
        const amountLabel = formatAmount(
          account.balance_cents,
          account.currency_symbol ?? currencySymbol,
        );

        return (
          <AccountListRow
            key={account.id}
            name={account.name}
            amountLabel={amountLabel}
            isLast={!showTotal && index === accounts.length - 1}
          />
        );
      })}

      {showTotal && (
        <AccountListRow
          name="Accounts Balance"
          amountLabel={formatAmount(totalBalanceCents, currencySymbol)}
          isLast
          isTotal
        />
      )}
    </View>
  );
};

export default AccountBalancesList;

