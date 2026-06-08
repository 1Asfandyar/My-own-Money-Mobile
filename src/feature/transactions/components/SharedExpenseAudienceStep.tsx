import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type { SharedExpenseAudienceStepProps } from '@/feature/transactions/types/addTransactionRecord.types';
import type { Group, GroupUser } from '@/feature/groups/types/group.types';
import {
  getGroupUsers,
  getUserLabel,
} from '@/feature/groups/utils/groupMembers.utils';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { fontFamilies } from '@/theme/fonts';
import { themeColors, typography } from '@/theme/utilities';

const visibleMemberLimit = 4;

const getGroupName = (group: Group) => group.name?.trim() || 'Group';

const AudienceSection = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <View className="mb-6">
    <ThemedText className="mb-3 text-base text-gray-900" weight="semiBold">
      {title}
    </ThemedText>
    {children}
  </View>
);

const EmptySection = ({ label }: { label: string }) => (
  <View className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
    <ThemedText className="text-sm text-gray-500">{label}</ThemedText>
  </View>
);

const FriendSearchField = ({
  onAddFriendPress,
  onChangeQuery,
  onToggleFriend,
  query,
  selectedFriends,
}: {
  onAddFriendPress: () => void;
  onChangeQuery: (query: string) => void;
  onToggleFriend: (userId: number) => void;
  query: string;
  selectedFriends: GroupUser[];
}) => (
  <View className="mb-3">
    <View className="mb-2 flex-row items-center justify-between">
      <ThemedText className="text-base text-gray-900" weight="semiBold">
        With you and:
      </ThemedText>

      <TouchableOpacity
        activeOpacity={0.76}
        accessibilityRole="button"
        accessibilityLabel="Add friend"
        onPress={onAddFriendPress}
        className="h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10"
      >
        <Ionicons
          name="person-add-outline"
          size={18}
          color={themeColors.primary}
        />
      </TouchableOpacity>
    </View>

    <View className="min-h-16 rounded-2xl border border-gray-200 bg-white px-3 py-2">
      <View className="flex-row flex-wrap items-center">
        {selectedFriends.map((friend) => (
          <TouchableOpacity
            key={friend.id}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${getUserLabel(friend)}`}
            onPress={() => onToggleFriend(friend.id)}
            className="mb-2 mr-2 flex-row items-center rounded-full border border-gray-200 bg-gray-50 py-1 pl-1 pr-2"
          >
            <SharedExpenseAvatar user={friend} size={30} />
            <ThemedText
              className="ml-2 max-w-36 text-sm text-gray-800"
              numberOfLines={1}
            >
              {getUserLabel(friend)}
            </ThemedText>
            <Ionicons
              name="close-circle"
              size={16}
              color={themeColors.gray400}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        ))}

        <View className="mb-2 min-w-36 flex-1 flex-row items-center py-1">
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder={
              selectedFriends.length > 0 ? 'Search more friends' : 'Search friends'
            }
            placeholderTextColor={themeColors.gray400}
            className={`${typography.primaryControlSize} flex-1 text-gray-800`}
            style={{ fontFamily: fontFamilies.regular, minWidth: 120 }}
          />
        </View>
      </View>
    </View>
  </View>
);

const FriendRow = ({
  friend,
  isSelected,
  onToggleFriend,
}: {
  friend: GroupUser;
  isSelected: boolean;
  onToggleFriend: (userId: number) => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.78}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: isSelected }}
    onPress={() => onToggleFriend(friend.id)}
    className={`mb-3 flex-row items-center rounded-xl border px-4 py-4 ${
      isSelected
        ? 'border-primary bg-primary/10'
        : 'border-gray-200 bg-white'
    }`}
  >
    <SharedExpenseAvatar user={friend} size={42} />
    <View className="ml-3 min-w-0 flex-1">
      <ThemedText
        className="text-sm text-gray-900"
        weight="semiBold"
        numberOfLines={1}
      >
        {getUserLabel(friend)}
      </ThemedText>
      {friend.email ? (
        <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {friend.email}
        </ThemedText>
      ) : null}
    </View>
    <Ionicons
      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
      size={24}
      color={isSelected ? themeColors.primary : themeColors.gray400}
    />
  </TouchableOpacity>
);

const GroupMemberPreview = ({ members }: { members: GroupUser[] }) => {
  const visibleMembers = members.slice(0, visibleMemberLimit);
  const extraMembersCount = Math.max(members.length - visibleMembers.length, 0);

  if (visibleMembers.length === 0) {
    return null;
  }

  return (
    <View className="mt-3 flex-row flex-wrap">
      {visibleMembers.map((member) => (
        <View
          key={member.id}
          className="mb-2 mr-2 flex-row items-center rounded-full bg-gray-100 px-2 py-1"
        >
          <SharedExpenseAvatar user={member} size={24} />
          <ThemedText
            className="ml-1.5 max-w-28 text-xs text-gray-700"
            numberOfLines={1}
          >
            {getUserLabel(member)}
          </ThemedText>
        </View>
      ))}

      {extraMembersCount > 0 ? (
        <View className="mb-2 mr-2 rounded-full bg-primary/10 px-3 py-1.5">
          <ThemedText className="text-xs text-primary" weight="semiBold">
            +{extraMembersCount}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
};

const GroupRow = ({
  currentUserId,
  group,
  isSelected,
  onSelectGroup,
}: {
  currentUserId?: number | null;
  group: Group;
  isSelected: boolean;
  onSelectGroup: (groupId: number) => void;
}) => {
  const members = getGroupUsers(group, currentUserId);
  const hasMemberData = Array.isArray(group.members);
  const memberLabel = hasMemberData
    ? `${members.length} ${members.length === 1 ? 'member' : 'members'}`
    : 'Members';

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={() => onSelectGroup(group.id)}
      className={`mb-3 rounded-xl border px-4 py-4 ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-gray-200 bg-white'
      }`}
    >
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Ionicons
            name="people-outline"
            size={21}
            color={themeColors.primary}
          />
        </View>
        <View className="ml-3 min-w-0 flex-1">
          <ThemedText
            className="text-sm text-gray-900"
            weight="semiBold"
            numberOfLines={1}
          >
            {getGroupName(group)}
          </ThemedText>
          <ThemedText className="mt-0.5 text-xs text-gray-500">
            {memberLabel}
          </ThemedText>
        </View>
        <Ionicons
          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color={isSelected ? themeColors.primary : themeColors.gray400}
        />
      </View>

      <GroupMemberPreview members={members} />
    </TouchableOpacity>
  );
};

const SharedExpenseAudienceStep = ({
  currentUserId,
  error,
  friends,
  groups,
  isResolvingGroup,
  onChangeFriendQuery,
  onAddFriendPress,
  onContinue,
  onSelectGroup,
  onToggleFriend,
  query,
  selectedFriendIds,
  selectedGroupId,
}: SharedExpenseAudienceStepProps) => {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedFriendIdSet = useMemo(
    () => new Set(selectedFriendIds),
    [selectedFriendIds],
  );
  const selectedFriends = useMemo(
    () => friends.filter((friend) => selectedFriendIdSet.has(friend.id)),
    [friends, selectedFriendIdSet],
  );
  const visibleFriends = useMemo(() => {
    const matchingFriends =
      normalizedQuery.length === 0
        ? friends
        : friends.filter((friend) => {
            const label = getUserLabel(friend).toLowerCase();
            const email = friend.email?.toLowerCase() ?? '';

            return label.includes(normalizedQuery) || email.includes(normalizedQuery);
          });

    return [...matchingFriends].sort((first, second) => {
      const firstSelected = selectedFriendIdSet.has(first.id);
      const secondSelected = selectedFriendIdSet.has(second.id);

      if (firstSelected === secondSelected) {
        return getUserLabel(first).localeCompare(getUserLabel(second));
      }

      return firstSelected ? -1 : 1;
    });
  }, [friends, normalizedQuery, selectedFriendIdSet]);
  const isNextDisabled =
    isResolvingGroup ||
    (selectedFriendIds.length === 0 && selectedGroupId === null);
  const emptyFriendsLabel =
    friends.length === 0
      ? 'No friends yet'
      : 'No friends match your search';

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 128,
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AudienceSection title="Friends">
          <FriendSearchField
            onAddFriendPress={onAddFriendPress}
            onChangeQuery={onChangeFriendQuery}
            onToggleFriend={onToggleFriend}
            query={query}
            selectedFriends={selectedFriends}
          />

          {visibleFriends.length > 0 ? (
            visibleFriends.map((friend) => (
              <FriendRow
                key={friend.id}
                friend={friend}
                isSelected={selectedFriendIdSet.has(friend.id)}
                onToggleFriend={onToggleFriend}
              />
            ))
          ) : (
            <EmptySection label={emptyFriendsLabel} />
          )}
        </AudienceSection>

        <AudienceSection title="Groups">
          {groups.length > 0 ? (
            groups.map((group) => (
              <GroupRow
                key={group.id}
                currentUserId={currentUserId}
                group={group}
                isSelected={selectedGroupId === group.id}
                onSelectGroup={onSelectGroup}
              />
            ))
          ) : (
            <EmptySection label="No groups yet" />
          )}
        </AudienceSection>
      </ScrollView>

      <View className="border-t border-gray-100 bg-white px-5 pb-5 pt-4">
        {error ? (
          <View className="mb-3 rounded-xl bg-red-50 px-4 py-3">
            <ThemedText className="text-sm text-red-600">{error}</ThemedText>
          </View>
        ) : null}

        <ThemedButton
          title="Next"
          rightIcon="arrow-forward"
          loading={isResolvingGroup}
          disabled={isNextDisabled}
          onPress={onContinue}
        />
      </View>
    </View>
  );
};

export default SharedExpenseAudienceStep;
