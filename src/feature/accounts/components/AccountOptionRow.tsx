import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { AccountOptionRowProps } from '@/feature/accounts/types/accountsOverview.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatCents } from '@/utils/currency';

const AccountOptionRow = ({
  account,
  currencies,
  isSelected,
  onSelectAccount,
}: AccountOptionRowProps) => (
  <TouchableOpacity
    activeOpacity={0.78}
    accessibilityRole="button"
    accessibilityLabel={`Select ${account.name}`}
    onPress={() => onSelectAccount(account.id)}
    className={`mb-3 flex-row items-center rounded-2xl border px-4 py-4 ${
      isSelected ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
    }`}
  >
    <View className="h-11 w-11 items-center justify-center rounded-full bg-white">
      <Ionicons
        name="wallet-outline"
        size={21}
        color={isSelected ? themeColors.primary : themeColors.gray700}
      />
    </View>

    <View className="ml-3 flex-1">
      <ThemedText
        className="text-base text-gray-900"
        weight="semiBold"
        numberOfLines={1}
      >
        {account.name}
      </ThemedText>
      <ThemedText className="mt-1 text-sm text-gray-500">
        {formatCents(
          account.current_balance_cents,
          account.currency_id,
          currencies,
        )}
      </ThemedText>
    </View>
    {isSelected ? (
      <Ionicons name="checkmark-circle" size={22} color={themeColors.primary} />
    ) : null}
  </TouchableOpacity>
);

export default memo(AccountOptionRow);
