import { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddFriendModal from '@/feature/friendships/components/AddFriendModal';
import FriendshipManagementCard from '@/feature/friendships/components/FriendshipManagementCard';
import type {
  FriendshipLedger,
  ManageFriendsViewProps,
} from '@/feature/friendships/types/friendship.types';
import ManagementListState from '@/feature/main/components/ManagementListState';
import ManagementScreenHeader from '@/feature/main/components/ManagementScreenHeader';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const keyExtractor = (friendship: FriendshipLedger) => String(friendship.id);

const ManageFriendsView = ({ manager }: ManageFriendsViewProps) => {
  const renderFriendship = useCallback<ListRenderItem<FriendshipLedger>>(
    ({ item }) => (
      <FriendshipManagementCard
        currentUserId={manager.userId}
        friendship={item}
        isUpdating={manager.updatingFriendshipId === item.id}
        onAction={manager.onFriendshipAction}
      />
    ),
    [
      manager.onFriendshipAction,
      manager.updatingFriendshipId,
      manager.userId,
    ],
  );
  const header = useMemo(
    () => (
      <View className="mb-5">
        <ManagementScreenHeader
          addLabel="Add friend"
          onAdd={manager.onOpenAddModal}
          onBack={manager.onBack}
          subtitle="Manage friends and pending requests."
          title="Manage friends"
        />
        {manager.error && manager.friendships.length > 0 ? (
          <View className="mt-4 rounded-xl bg-red-50 px-4 py-3">
            <ThemedText className="text-sm text-red-600">
              {manager.error}
            </ThemedText>
          </View>
        ) : null}
      </View>
    ),
    [
      manager.error,
      manager.friendships.length,
      manager.onBack,
      manager.onOpenAddModal,
    ],
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <FlatList
        data={manager.isLoading ? [] : manager.friendships}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ManagementListState
            emptyMessage="Search for someone by email and send a friend request."
            emptyTitle="No friends yet"
            error={manager.error}
            icon="people-outline"
            isLoading={manager.isLoading}
            loadingLabel="Loading friends"
            onAdd={manager.onOpenAddModal}
            onRetry={manager.onRefresh}
          />
        }
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={manager.onRefresh}
            tintColor={themeColors.primary}
          />
        }
        renderItem={renderFriendship}
        showsVerticalScrollIndicator={false}
      />

      <AddFriendModal
        emailQuery={manager.emailQuery}
        error={manager.friendError}
        existingFriendIds={manager.existingFriendIds}
        isAdding={manager.isAdding}
        isSearching={manager.isSearching}
        isVisible={manager.isAddModalVisible}
        onAddUser={manager.addFriend}
        onChangeEmail={manager.setEmailQuery}
        onClose={manager.closeAddModal}
        onSearch={manager.searchByEmail}
        results={manager.results}
      />
    </SafeAreaView>
  );
};

export default ManageFriendsView;
