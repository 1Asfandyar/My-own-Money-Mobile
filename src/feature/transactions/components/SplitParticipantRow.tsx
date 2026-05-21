import { memo } from 'react';
import { TextInput, View } from 'react-native';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type { SplitParticipantRowProps } from '@/feature/transactions/types/addTransactionRecord.types';
import {
  getEqualSplitAmountCents,
  getSharedExpenseSplitInputSuffix,
  getSplitAmountCents,
} from '@/feature/transactions/utils/sharedExpenseSplit.utils';
import { getUserLabel } from '@/feature/groups/utils/groupMembers.utils';
import ThemedText from '@/theme/components/ThemedText';
import { fontFamilies } from '@/theme/fonts';
import { themeColors, typography } from '@/theme/utilities';
import { formatCents } from '@/utils/currency';

const SplitParticipantRow = ({
  currencyId,
  index,
  method,
  onChangeValue,
  participant,
  participantCount,
  totalAmountCents,
  totalShares,
  value,
}: SplitParticipantRowProps) => {
  const amountCents =
    method === 'equal'
      ? getEqualSplitAmountCents(totalAmountCents, participantCount, index)
      : getSplitAmountCents(method, value, totalAmountCents, totalShares);
  const inputSuffix = getSharedExpenseSplitInputSuffix(method);

  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-3">
      <SharedExpenseAvatar user={participant} size={42} />
      <View className="ml-3 min-w-0 flex-1">
        <ThemedText
          className="text-sm text-gray-900"
          weight="semiBold"
          numberOfLines={1}
        >
          {getUserLabel(participant)}
        </ThemedText>
        <ThemedText className="mt-0.5 text-xs text-gray-500">
          Owes {formatCents(amountCents, currencyId)}
        </ThemedText>
      </View>

      {method === 'equal' ? (
        <View className="rounded-xl bg-gray-50 px-3 py-2">
          <ThemedText className="text-sm text-gray-700" weight="semiBold">
            Equal
          </ThemedText>
        </View>
      ) : (
        <View className="w-28 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <TextInput
            value={value}
            onChangeText={(nextValue) =>
              onChangeValue(participant.id, nextValue)
            }
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={themeColors.gray400}
            className={`${typography.primaryControlSize} min-w-0 flex-1 text-left text-gray-900`}
            style={{ fontFamily: fontFamilies.semiBold }}
          />
          {inputSuffix ? (
            <>
              <View className="mx-2 h-5 w-px bg-gray-300" />
              <ThemedText className="text-xs text-gray-500">
                {inputSuffix}
              </ThemedText>
            </>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default memo(SplitParticipantRow);
