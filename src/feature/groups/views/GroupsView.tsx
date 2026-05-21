import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { ROUTES } from '@/config/routes';
import CreateGroupModal from '@/feature/groups/components/CreateGroupModal';
import GroupListItem from '@/feature/groups/components/GroupListItem';
import type { Group } from '@/feature/groups/types/group.types';
import type { GroupsViewProps } from '@/feature/groups/types/groupsScreen.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const keyExtractor = (group: Group) => String(group.id);

const GroupsView = ({ groups }: GroupsViewProps) => {
  const router = useRouter();
  const hasGroups = groups.customGroups.length > 0;
  const hasFriends = groups.friends.length > 0;
  const openGroup = useCallback(
    (groupId: number) => {
      router.push({
        pathname: ROUTES.GROUP_DETAIL,
        params: { groupId: String(groupId) },
      });
    },
    [router],
  );
  const renderGroup = useCallback<ListRenderItem<Group>>(
    ({ item }) => <GroupListItem group={item} onOpenGroup={openGroup} />,
    [openGroup],
  );
  const listHeader = useMemo(
    () => (
      <>
        <View className="mb-5 flex-row items-start justify-between">
          <View className="min-w-0 flex-1">
            <ThemedText className="text-2xl text-gray-900" weight="bold">
              Groups
            </ThemedText>
            <ThemedText className="mt-1 text-sm leading-5 text-gray-500">
              Custom groups for shared expenses with your friends.
            </ThemedText>
          </View>

          {hasGroups ? (
            <ThemedButton
              title="Create"
              leftIcon="add-circle-outline"
              onPress={groups.onOpenCreateModal}
              disabled={!hasFriends}
              containerClassName="ml-3 px-4 py-3"
              textClassName="text-xs"
              iconSize={15}
            />
          ) : null}
        </View>

        {groups.error ? (
          <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
            <ThemedText className="text-sm text-red-600">
              {groups.error}
            </ThemedText>
          </View>
        ) : null}
      </>
    ),
    [groups.error, groups.onOpenCreateModal, hasFriends, hasGroups],
  );
  const listEmpty = useMemo(() => {
    if (groups.isLoading) {
      return (
        <View className="items-center justify-center py-14">
          <ActivityIndicator color={themeColors.primary} />
          <ThemedText className="mt-3 text-sm text-gray-500">
            Loading groups
          </ThemedText>
        </View>
      );
    }

    return (
      <View className="min-h-96 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white">
          <Ionicons
            name="people-outline"
            size={30}
            color={themeColors.primary}
          />
        </View>
        <ThemedText className="mt-4 text-lg text-gray-900" weight="semiBold">
          No custom groups yet
        </ThemedText>
        <ThemedText className="mt-2 text-center text-sm leading-5 text-gray-500">
          {hasFriends
            ? 'Create a group from friends you already have.'
            : 'Add friends first, then create custom groups from them.'}
        </ThemedText>

        <ThemedButton
          title="Create group"
          leftIcon="add-circle-outline"
          onPress={groups.onOpenCreateModal}
          disabled={!hasFriends}
          containerClassName="mt-6 min-w-44 px-5"
        />
      </View>
    );
  }, [groups.isLoading, groups.onOpenCreateModal, hasFriends]);
  const listFooter = useMemo(
    () =>
      !groups.isLoading && groups.error ? (
        <ThemedButton
          title="Retry"
          leftIcon="refresh"
          variant="outline"
          onPress={groups.onRefresh}
          containerClassName="mt-4"
        />
      ) : null,
    [groups.error, groups.isLoading, groups.onRefresh],
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={groups.isLoading ? [] : groups.customGroups}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 20,
          paddingTop: 24,
        }}
        initialNumToRender={8}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={8}
        renderItem={renderGroup}
        showsVerticalScrollIndicator={false}
        windowSize={6}
      />

      <CreateGroupModal
        error={groups.createError}
        friends={groups.friends}
        groupName={groups.createGroupName}
        isCreating={groups.isCreating}
        isDisabled={groups.isCreateDisabled}
        isVisible={groups.isCreateModalVisible}
        onChangeGroupName={groups.onChangeCreateGroupName}
        onClose={groups.onCloseCreateModal}
        onCreate={groups.onCreateGroup}
        onToggleFriend={groups.onToggleFriend}
        selectedFriendIds={groups.selectedFriendIds}
      />
    </View>
  );
};

export default GroupsView;
