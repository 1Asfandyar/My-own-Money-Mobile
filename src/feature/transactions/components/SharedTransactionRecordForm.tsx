import { View } from 'react-native';

import SharedExpenseParticipants from '@/feature/transactions/components/SharedExpenseParticipants';
import SharedExpenseSplitSummary from '@/feature/transactions/components/SharedExpenseSplitSummary';
import TransactionRecordFields from '@/feature/transactions/components/TransactionRecordFields';
import type { SharedTransactionRecordFormProps } from '@/feature/transactions/types/addTransactionRecord.types';

const SharedTransactionRecordForm = ({ form }: SharedTransactionRecordFormProps) => {
  return (
    <View>
      <SharedExpenseParticipants
        currentUserId={form.currentUserId}
        error={form.fieldErrors.sharedUserIds}
        friends={form.friends}
        friendsGroupId={form.friendsGroupId}
        groups={form.sharedGroups}
        query={form.friendPickerQuery}
        selectedFriends={form.selectedSharedFriends}
        selectedUserIds={form.selectedSharedUserIds}
        onAddFriendPress={form.openAddFriendModal}
        onQueryChange={form.setFriendPickerQuery}
        onToggleGroup={form.toggleSharedGroup}
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
