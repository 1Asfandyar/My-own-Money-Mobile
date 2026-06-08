import { View } from 'react-native';

import SharedExpenseParticipants from '@/feature/transactions/components/SharedExpenseParticipants';
import SharedExpenseSplitSummary from '@/feature/transactions/components/SharedExpenseSplitSummary';
import TransactionRecordFields from '@/feature/transactions/components/TransactionRecordFields';
import type { SharedTransactionRecordFormProps } from '@/feature/transactions/types/addTransactionRecord.types';

const SharedTransactionRecordForm = ({ form }: SharedTransactionRecordFormProps) => {
  return (
    <View>
      <SharedExpenseParticipants
        error={form.fieldErrors.sharedUserIds}
        friends={form.friends}
        onChangeAudiencePress={form.changeSharedAudience}
        query={form.friendPickerQuery}
        selectedGroup={form.selectedSharedGroup}
        selectedFriends={form.selectedSharedFriends}
        selectedGroupMembers={form.selectedSharedGroupMembers}
        selectedUserIds={form.selectedSharedUserIds}
        onAddFriendPress={form.openAddFriendModal}
        onQueryChange={form.setFriendPickerQuery}
        onToggleFriend={form.toggleSharedUser}
      />

      <TransactionRecordFields form={form} />

      <SharedExpenseSplitSummary
        methodLabel={form.splitMethodLabel}
        participantCount={form.splitParticipants.length}
        onOpenSplitSheet={form.openSplitSheet}
      />
    </View>
  );
};

export default SharedTransactionRecordForm;
