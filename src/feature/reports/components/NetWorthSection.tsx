import { View } from 'react-native';

import AmountWithCurrency from '@/components/AmountWithCurrency';
import { useLoggedInUser } from '@/feature/auth/hooks/useLoggedInUser';
import type { NetWorth } from '@/feature/reports/types/report.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { fallbackCurrencies, formatAmount, getCurrencyById } from '@/utils/currency';

interface NetWorthRowProps {
  label: string;
  valueLabel: string;
  isLast: boolean;
  isTotal?: boolean;
  valueColor?: string;
}

const NetWorthRow = ({ label, valueLabel, isLast, isTotal, valueColor }: NetWorthRowProps) => (
  <View
    className={`flex-row items-center justify-between px-4 py-3 ${isLast ? '' : 'border-b border-gray-100'}`}
    style={{ backgroundColor: isTotal ? `${themeColors.primary}0D` : 'transparent' }}
  >
    <ThemedText className="flex-1 pr-3 text-sm text-gray-500" numberOfLines={1}>
      {label}
    </ThemedText>
    <ThemedText
      className="text-lg"
      weight="bold"
      numberOfLines={1}
      adjustsFontSizeToFit
      style={{ color: valueColor ?? themeColors.gray900 }}
    >
      {valueLabel}
    </ThemedText>
  </View>
);

interface NetWorthSectionProps {
  netWorth: NetWorth;
}

const NetWorthSection = ({ netWorth }: NetWorthSectionProps) => {
  const { user } = useLoggedInUser();
  const displayCurrency = getCurrencyById(user?.currency_id, fallbackCurrencies);
  const currencySymbol = displayCurrency.symbol;

  return (
    <View className="mx-4">
      <ThemedText className="mb-3 text-base text-gray-900" weight="semiBold">
        Net Worth
      </ThemedText>

      <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <NetWorthRow
          label="Accounts Balance"
          valueLabel={formatAmount(netWorth.total_accounts_balance_cents, currencySymbol, { useAbsoluteValue: true })}
          isLast={false}
        />
        <NetWorthRow
          label="Owed to You"
          valueLabel={formatAmount(netWorth.total_owed_to_you_cents, currencySymbol, { useAbsoluteValue: true })}
          isLast={false}
          valueColor={themeColors.primary}
        />
        <NetWorthRow
          label="You Owe"
          valueLabel={formatAmount(netWorth.total_you_owe_cents, currencySymbol, { useAbsoluteValue: true })}
          isLast={false}
          valueColor="#EF4444"
        />
        <View
          className="flex-row items-center justify-between px-4 py-3"
          style={{ backgroundColor: `${themeColors.primary}0D` }}
        >
          <ThemedText className="flex-1 pr-3 text-sm text-gray-500" numberOfLines={1}>
            Net Worth
          </ThemedText>
          <AmountWithCurrency
            amountCents={netWorth.net_worth_cents}
            currencySymbol={currencySymbol}
            weight="bold"
            className="text-lg"
            numberOfLines={1}
            adjustsFontSizeToFit
          />
        </View>
      </View>
    </View>
  );
};

export default NetWorthSection;
