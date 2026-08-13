import { View } from 'react-native';

import type { SharedMoney, SharedMoneyBreakdownItem } from '@/feature/reports/types/report.types';
import AmountWithCurrency from '@/components/AmountWithCurrency';
import { useLoggedInUser } from '@/feature/auth/hooks/useLoggedInUser';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatAmount, fallbackCurrencies, getCurrencyById } from '@/utils/currency';

const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

interface BreakdownRowProps {
  item: SharedMoneyBreakdownItem;
  currencySymbol: string;
}

const BreakdownRow = ({ item, currencySymbol }: BreakdownRowProps) => {
  const owesYou = item.direction === 'owes_you';

  return (
    <View className="mb-3 flex-row items-center">
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${themeColors.primary}20` }}
      >
        <ThemedText className="text-sm text-primary" weight="semiBold">
          {getInitials(item.name)}
        </ThemedText>
      </View>

      <ThemedText className="flex-1 text-sm text-gray-800" weight="semiBold">
        {item.name}
      </ThemedText>

      <View className="items-end">
        <ThemedText
          className="text-xs"
          style={{ color: owesYou ? themeColors.gray500 : themeColors.gray500 }}
        >
          {owesYou ? 'owes you' : 'you owe'}
        </ThemedText>
        <AmountWithCurrency
          amountCents={item.amount_cents}
          currencySymbol={currencySymbol}
          useAbsoluteValue={true}
          customColor={owesYou ? themeColors.primary : '#EF4444'}
          className="text-sm"
        />
      </View>
    </View>
  );
};

interface SharedMoneySectionProps {
  sharedMoney: SharedMoney;
}

const SharedMoneySection = ({ sharedMoney }: SharedMoneySectionProps) => {
  const { user } = useLoggedInUser();
  const displayCurrency = getCurrencyById(user?.currency_id, fallbackCurrencies);
  const currencySymbol = displayCurrency.symbol;
  const { net_cents, breakdown } = sharedMoney;

  const summaryText =
    net_cents > 0
      ? `You're owed ${formatAmount(net_cents, currencySymbol, { useAbsoluteValue: true })}`
      : net_cents < 0
        ? `You owe ${formatAmount(net_cents, currencySymbol, { useAbsoluteValue: true })}`
        : 'All settled up';

  const summaryColor =
    net_cents > 0 ? themeColors.primary : net_cents < 0 ? '#EF4444' : themeColors.gray500;

  return (
    <View className="mx-4 mt-5">
      <View className="mb-1 flex-row items-center justify-between">
        <ThemedText className="text-base text-gray-900" weight="semiBold">
          Shared Balances
        </ThemedText>
        <ThemedText className="text-xs text-gray-400">(current balance)</ThemedText>
      </View>

      <ThemedText className="mb-4 text-sm" weight="semiBold" style={{ color: summaryColor }}>
        {summaryText}
      </ThemedText>

      {breakdown.length === 0 ? (
        <ThemedText className="text-sm text-gray-400">No shared balances.</ThemedText>
      ) : (
        breakdown.map((item) => (
          <BreakdownRow key={item.user_id} item={item} currencySymbol={currencySymbol} />
        ))
      )}
    </View>
  );
};

export default SharedMoneySection;
