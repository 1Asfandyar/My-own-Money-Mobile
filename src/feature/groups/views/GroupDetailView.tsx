import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

import EditGroupModal from '@/feature/groups/components/EditGroupModal';
import type { GroupDetailViewProps } from '@/feature/groups/types/groupDetail.types';
import {
  getUserInitial,
  getUserLabel,
} from '@/feature/groups/utils/groupMembers.utils';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const GroupDetailView = ({ detail }: GroupDetailViewProps) => {
  const groupName = detail.group?.name?.trim() || 'Custom group';

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.76}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={detail.onBack}
            className="h-11 w-11 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.gray900} />
          </TouchableOpacity>

          <ThemedText
            className="mx-3 min-w-0 flex-1 text-center text-lg text-gray-900"
            weight="semiBold"
            numberOfLines={1}
          >
            Group
          </ThemedText>

          <TouchableOpacity
            activeOpacity={0.76}
            accessibilityRole="button"
            accessibilityLabel="Edit group"
            disabled={!detail.group || detail.isLoading}
            onPress={detail.onOpenEditModal}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              detail.group && !detail.isLoading
                ? 'bg-primary/10'
                : 'bg-gray-100'
            }`}
          >
            <Ionicons
              name="create-outline"
              size={21}
              color={
                detail.group && !detail.isLoading
                  ? themeColors.primary
                  : themeColors.gray400
              }
            />
          </TouchableOpacity>
        </View>

        {detail.error ? (
          <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
            <ThemedText className="text-sm text-red-600">
              {detail.error}
            </ThemedText>
          </View>
        ) : null}

        {detail.isLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator color={themeColors.primary} />
            <ThemedText className="mt-3 text-sm text-gray-500">
              Loading group
            </ThemedText>
          </View>
        ) : detail.group ? (
          <>
            <View className="rounded-2xl border border-gray-100 bg-lightBlue px-5 py-5">
              <View className="flex-row items-center">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
                  <Ionicons
                    name="people-outline"
                    size={28}
                    color={themeColors.primary}
                  />
                </View>
                <View className="ml-4 min-w-0 flex-1">
                  <ThemedText
                    className="text-2xl text-gray-900"
                    weight="bold"
                    numberOfLines={2}
                  >
                    {groupName}
                  </ThemedText>
                  <ThemedText className="mt-1 text-sm text-gray-600">
                    {detail.members.length}{' '}
                    {detail.members.length === 1 ? 'member' : 'members'}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View className="mb-3 mt-6 flex-row items-center justify-between">
              <ThemedText className="text-base text-gray-900" weight="semiBold">
                Members
              </ThemedText>
              <ThemedButton
                title="Edit"
                leftIcon="create-outline"
                variant="outline"
                onPress={detail.onOpenEditModal}
                containerClassName="px-3 py-2"
                textClassName="text-xs"
                iconSize={14}
              />
            </View>

            {detail.members.map((member) => {
              const supportingLabel =
                member.id === detail.currentUserId
                  ? 'You'
                  : member.email ?? member.mobile_number ?? 'Group member';

              return (
                <View
                  key={member.id}
                  className="mb-3 flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-4"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    <ThemedText
                      className="text-sm text-primary"
                      weight="semiBold"
                    >
                      {getUserInitial(member)}
                    </ThemedText>
                  </View>
                  <View className="ml-3 min-w-0 flex-1">
                    <ThemedText
                      className="text-sm text-gray-900"
                      weight="semiBold"
                      numberOfLines={1}
                    >
                      {getUserLabel(member)}
                    </ThemedText>
                    <ThemedText
                      className="mt-0.5 text-xs text-gray-500"
                      numberOfLines={1}
                    >
                      {supportingLabel}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <View className="items-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10">
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={themeColors.primary}
            />
            <ThemedText className="mt-3 text-center text-sm text-gray-500">
              This group is not available.
            </ThemedText>
          </View>
        )}

        {!detail.isLoading && detail.error ? (
          <ThemedButton
            title="Retry"
            leftIcon="refresh"
            variant="outline"
            onPress={detail.onRefresh}
            containerClassName="mt-4"
          />
        ) : null}
      </ScrollView>

      <EditGroupModal
        error={detail.editError}
        friends={detail.editFriends}
        groupName={detail.editGroupName}
        isDisabled={detail.isEditDisabled}
        isSaving={detail.isSaving}
        isVisible={detail.isEditModalVisible}
        onChangeGroupName={detail.onChangeEditGroupName}
        onClose={detail.onCloseEditModal}
        onSave={detail.onSaveGroup}
        onToggleFriend={detail.onToggleEditFriend}
        selectedFriendIds={detail.editSelectedFriendIds}
      />
    </View>
  );
};

export default GroupDetailView;
