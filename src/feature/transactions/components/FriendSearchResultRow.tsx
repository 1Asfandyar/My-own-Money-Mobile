import { memo } from 'react';
import { View } from 'react-native';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type { FriendSearchResultRowProps } from '@/feature/transactions/types/addTransactionRecord.types';
import { getUserLabel } from '@/feature/groups/utils/groupMembers.utils';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';

const FriendSearchResultRow = ({
  isAdding,
  isAlreadyFriend,
  isSearching,
  onAddUser,
  user,
}: FriendSearchResultRowProps) => (
  <View className="mb-3 flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-4">
    <SharedExpenseAvatar user={user} size={40} />
    <View className="ml-3 min-w-0 flex-1">
      <ThemedText
        className="text-sm text-gray-900"
        weight="semiBold"
        numberOfLines={1}
      >
        {getUserLabel(user)}
      </ThemedText>
      {user.email ? (
        <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {user.email}
        </ThemedText>
      ) : null}
    </View>
    <ThemedButton
      title={isAlreadyFriend ? 'Added' : 'Add'}
      leftIcon={isAlreadyFriend ? 'checkmark-circle' : 'person-add-outline'}
      loading={isAdding && !isAlreadyFriend}
      disabled={isAlreadyFriend || isAdding || isSearching}
      onPress={() => onAddUser(user.id)}
      containerClassName="ml-3 px-3 py-2"
      textClassName="text-xs"
      iconSize={14}
    />
  </View>
);

export default memo(FriendSearchResultRow);
