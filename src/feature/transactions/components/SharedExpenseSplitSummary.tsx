import { View } from 'react-native';

import type { SharedExpenseSplitSummaryProps } from '@/feature/transactions/types/addTransactionRecord.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';

const SharedExpenseSplitSummary = ({
  methodLabel,
  onOpenSplitSheet,
  participantCount,
}: SharedExpenseSplitSummaryProps) => (
  <View className="mt-2 items-center">
    <View className="flex-row flex-wrap items-center justify-center">
      <ThemedText className="text-base text-gray-700">
        Paid by you and split
      </ThemedText>
      <ThemedButton
        title={methodLabel}
        variant="outline"
        onPress={onOpenSplitSheet}
        containerClassName="ml-2 px-4 py-2"
        textClassName="text-sm"
      />
    </View>

    <ThemedText className="mt-3 text-xs text-gray-500">
      {participantCount} participant{participantCount === 1 ? '' : 's'}
    </ThemedText>
  </View>
);

export default SharedExpenseSplitSummary;
