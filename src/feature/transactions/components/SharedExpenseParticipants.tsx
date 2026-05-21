import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type { SharedExpenseParticipantsProps } from '@/feature/transactions/types/addTransactionRecord.types';
import {
  getGroupUsers,
  getUserLabel,
} from '@/feature/groups/utils/groupMembers.utils';
import ThemedText from '@/theme/components/ThemedText';
import { fontFamilies } from '@/theme/fonts';
import { themeColors, typography } from '@/theme/utilities';

const SharedExpenseParticipants = ({
  currentUserId,
  error,
  friends,
  friendsGroupId,
  groups,
  onAddFriendPress,
  onQueryChange,
  onToggleGroup,
  onToggleFriend,
  query,
  selectedFriends,
  selectedUserIds,
}: SharedExpenseParticipantsProps) => {
  const canAddFriends = friendsGroupId !== null;
  const normalizedQuery = query.trim().toLowerCase();
  const selectedUserIdSet = useMemo(
    () => new Set(selectedUserIds),
    [selectedUserIds],
  );
  const groupSearchResults = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return [];
    }

    return groups
      .map((group) => {
        const members = getGroupUsers(group, currentUserId);
        const groupName = group.name?.trim() || 'Custom group';
        const searchableText = [
          groupName,
          ...members.flatMap((member) => [
            getUserLabel(member),
            member.email ?? '',
            member.mobile_number ?? '',
          ]),
        ]
          .join(' ')
          .toLowerCase();

        return { group, groupName, members, searchableText };
      })
      .filter((item) => item.searchableText.includes(normalizedQuery))
      .sort((first, second) => first.groupName.localeCompare(second.groupName))
      .slice(0, 3);
  }, [currentUserId, groups, normalizedQuery]);
  const friendSearchResults = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return [];
    }

    return friends
      .filter((friend) => {
        const label = getUserLabel(friend).toLowerCase();
        const email = friend.email?.toLowerCase() ?? '';

        return label.includes(normalizedQuery) || email.includes(normalizedQuery);
      })
      .sort((first, second) => {
        const firstSelected = selectedUserIdSet.has(first.id);
        const secondSelected = selectedUserIdSet.has(second.id);

        if (firstSelected === secondSelected) {
          return getUserLabel(first).localeCompare(getUserLabel(second));
        }

        return firstSelected ? -1 : 1;
      })
      .slice(0, 5);
  }, [friends, normalizedQuery, selectedUserIdSet]);
  const shouldShowSearchResults = normalizedQuery.length > 0;
  const hasSearchResults =
    groupSearchResults.length > 0 || friendSearchResults.length > 0;

  return (
    <View className="mb-6">
      <View className="mb-2 flex-row items-center justify-between">
        <ThemedText className="text-base text-gray-900" weight="semiBold">
          With you and:
        </ThemedText>

        <TouchableOpacity
          activeOpacity={0.76}
          accessibilityRole="button"
          accessibilityLabel="Add friend"
          disabled={!canAddFriends}
          onPress={onAddFriendPress}
          className={`h-10 w-10 items-center justify-center rounded-full border ${
            canAddFriends
              ? 'border-primary/20 bg-primary/10'
              : 'border-gray-200 bg-gray-100'
          }`}
        >
          <Ionicons
            name="person-add-outline"
            size={18}
            color={canAddFriends ? themeColors.primary : themeColors.gray400}
          />
        </TouchableOpacity>
      </View>

      <View
        className={`min-h-16 rounded-2xl border bg-white px-3 py-2 ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
      >
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
              onChangeText={onQueryChange}
              placeholder={
                selectedFriends.length > 0
                  ? 'Search more friends or groups'
                  : 'Search friends or groups'
              }
              placeholderTextColor={themeColors.gray400}
              className={`${typography.primaryControlSize} flex-1 text-gray-800`}
              style={{ fontFamily: fontFamilies.regular, minWidth: 120 }}
            />
          </View>
        </View>
      </View>

      {error ? (
        <ThemedText className="mt-1 text-xs text-red-500">{error}</ThemedText>
      ) : null}

      {!canAddFriends ? (
        <ThemedText className="mt-2 text-xs text-red-500">
          Your friends group is not available yet. Please try again shortly.
        </ThemedText>
      ) : null}

      {shouldShowSearchResults ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {hasSearchResults ? (
            <>
              {groupSearchResults.map(({ group, groupName, members }) => {
                const groupUserIds = members.map((member) => member.id);
                const isSelected =
                  groupUserIds.length > 0 &&
                  groupUserIds.every((userId) =>
                    selectedUserIdSet.has(userId),
                  );
                const memberCountLabel = `${members.length} ${
                  members.length === 1 ? 'member' : 'members'
                }`;

                return (
                  <TouchableOpacity
                    key={`group-${group.id}`}
                    activeOpacity={0.78}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    disabled={members.length === 0}
                    onPress={() => onToggleGroup(group)}
                    className={`flex-row items-center border-b border-gray-100 px-4 py-3 ${
                      isSelected ? 'bg-primary/10' : 'bg-white'
                    } ${members.length === 0 ? 'opacity-60' : ''}`}
                  >
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
                        {groupName}
                      </ThemedText>
                      <ThemedText
                        className="mt-0.5 text-xs text-gray-500"
                        numberOfLines={1}
                      >
                        {memberCountLabel}
                      </ThemedText>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                      size={23}
                      color={
                        isSelected ? themeColors.primary : themeColors.gray400
                      }
                    />
                  </TouchableOpacity>
                );
              })}

              {friendSearchResults.map((friend) => {
                const isSelected = selectedUserIdSet.has(friend.id);
                const supportingLabel =
                  friend.email ??
                  friend.mobile_number ??
                  (isSelected ? 'Selected' : 'Tap to add');

                return (
                  <TouchableOpacity
                    key={friend.id}
                    activeOpacity={0.78}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => onToggleFriend(friend.id)}
                    className={`flex-row items-center border-b border-gray-100 px-4 py-3 ${
                      isSelected ? 'bg-primary/10' : 'bg-white'
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
                      <ThemedText
                        className="mt-0.5 text-xs text-gray-500"
                        numberOfLines={1}
                      >
                        {supportingLabel}
                      </ThemedText>
                    </View>
                    <Ionicons
                      name={
                        isSelected ? 'checkmark-circle' : 'add-circle-outline'
                      }
                      size={23}
                      color={
                        isSelected ? themeColors.primary : themeColors.gray400
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={0.78}
              accessibilityRole="button"
              disabled={!canAddFriends}
              onPress={onAddFriendPress}
              className="flex-row items-center px-4 py-4"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={themeColors.primary}
                />
              </View>
              <View className="ml-3 min-w-0 flex-1">
                <ThemedText className="text-sm text-gray-900" weight="semiBold">
                  No friend or group found
                </ThemedText>
                <ThemedText className="mt-0.5 text-xs text-gray-500">
                  Add by email
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={themeColors.gray400}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
};

export default SharedExpenseParticipants;
