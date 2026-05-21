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

import { addFriendModalStyles } from '@/feature/transactions/components/AddFriendModal.styles';
import FriendSearchResultRow from '@/feature/transactions/components/FriendSearchResultRow';
import type { AddFriendModalProps } from '@/feature/transactions/types/addTransactionRecord.types';
import type { GroupUser } from '@/feature/groups/types/group.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const keyExtractor = (user: GroupUser) => String(user.id);

const AddFriendModal = ({
  emailQuery,
  error,
  existingFriendIds,
  isAdding,
  isSearching,
  isVisible,
  onAddUser,
  onChangeEmail,
  onClose,
  onSearch,
  results,
}: AddFriendModalProps) => {
  const existingFriendIdSet = useMemo(
    () => new Set(existingFriendIds),
    [existingFriendIds],
  );
  const renderResult = useCallback<ListRenderItem<GroupUser>>(
    ({ item }) => (
      <FriendSearchResultRow
        isAdding={isAdding}
        isAlreadyFriend={existingFriendIdSet.has(item.id)}
        isSearching={isSearching}
        onAddUser={onAddUser}
        user={item}
      />
    ),
    [existingFriendIdSet, isAdding, isSearching, onAddUser],
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
          accessibilityLabel="Close add friend"
          className="flex-1"
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <SafeAreaView edges={['bottom']} className="rounded-t-[28px] bg-white">
            <View className="px-5 pb-5 pt-5">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="min-w-0 flex-1">
                  <ThemedText className="text-xl text-gray-900" weight="bold">
                    Add friend
                  </ThemedText>
                  <ThemedText className="mt-1 text-sm text-gray-500">
                    Search by email to add someone to your friends group.
                  </ThemedText>
                </View>

                <TouchableOpacity
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Close add friend"
                  onPress={onClose}
                  className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={22} color={themeColors.gray700} />
                </TouchableOpacity>
              </View>

              <ThemedInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                leftIcon="mail-outline"
                onChangeText={onChangeEmail}
                onSubmitEditing={onSearch}
                placeholder="friend@email.com"
                returnKeyType="search"
                textContentType="emailAddress"
                value={emailQuery}
                error={error}
              />

              <ThemedButton
                title="Search email"
                leftIcon="search"
                loading={isSearching}
                disabled={isAdding}
                onPress={onSearch}
                containerClassName="mt-2"
              />
            </View>

            <FlatList
              data={results}
              initialNumToRender={8}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
              maxToRenderPerBatch={8}
              renderItem={renderResult}
              showsVerticalScrollIndicator={results.length > 3}
              contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 20 }}
              style={addFriendModalStyles.resultsList}
              windowSize={5}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddFriendModal;
