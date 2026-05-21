import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GroupFriendOptionRow from '@/feature/groups/components/GroupFriendOptionRow';
import type { EditGroupModalProps } from '@/feature/groups/types/groupDetail.types';
import type { GroupUser } from '@/feature/groups/types/group.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const keyExtractor = (friend: GroupUser) => String(friend.id);

const EditGroupModal = ({
  error,
  friends,
  groupName,
  isDisabled,
  isSaving,
  isVisible,
  onChangeGroupName,
  onClose,
  onSave,
  onToggleFriend,
  selectedFriendIds,
}: EditGroupModalProps) => {
  const selectedFriendIdSet = useMemo(
    () => new Set(selectedFriendIds),
    [selectedFriendIds],
  );
  const renderFriend = useCallback<ListRenderItem<GroupUser>>(
    ({ item }) => (
      <GroupFriendOptionRow
        friend={item}
        isSelected={selectedFriendIdSet.has(item.id)}
        onToggleFriend={onToggleFriend}
      />
    ),
    [onToggleFriend, selectedFriendIdSet],
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Close edit group"
          className="flex-1"
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <SafeAreaView
            edges={['bottom']}
            className="rounded-t-[28px] bg-white"
            style={{ maxHeight: '86%' }}
          >
            <View className="px-5 pb-4 pt-5">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="min-w-0 flex-1">
                  <ThemedText className="text-xl text-gray-900" weight="bold">
                    Edit group
                  </ThemedText>
                  <ThemedText className="mt-1 text-sm text-gray-500">
                    Update the group name and members.
                  </ThemedText>
                </View>

                <TouchableOpacity
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Close edit group"
                  onPress={onClose}
                  className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={22} color={themeColors.gray700} />
                </TouchableOpacity>
              </View>

              <ThemedInput
                leftIcon="people-outline"
                onChangeText={onChangeGroupName}
                placeholder="Group name"
                value={groupName}
                error={error}
              />
            </View>

            <FlatList
              data={friends}
              initialNumToRender={10}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View className="items-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8">
                  <Ionicons
                    name="person-add-outline"
                    size={24}
                    color={themeColors.primary}
                  />
                  <ThemedText className="mt-3 text-center text-sm text-gray-500">
                    Add friends first, then update this custom group.
                  </ThemedText>
                </View>
              }
              maxToRenderPerBatch={10}
              renderItem={renderFriend}
              showsVerticalScrollIndicator={friends.length > 5}
              contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 20 }}
              windowSize={6}
            />

            <View className="border-t border-gray-100 px-5 pb-3 pt-4">
              <ThemedButton
                title="Save group"
                leftIcon="checkmark-circle-outline"
                loading={isSaving}
                disabled={isDisabled}
                onPress={onSave}
              />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default EditGroupModal;
