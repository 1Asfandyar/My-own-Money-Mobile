import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, TouchableOpacity, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { GroupUser } from '@/feature/groups/types/group.types';
import {
  getUserInitial,
  getUserLabel,
} from '@/feature/groups/utils/groupMembers.utils';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

type MembersModalProps = {
  currentUserId?: number | null;
  isVisible: boolean;
  members: GroupUser[];
  onClose: () => void;
};

type MemberItemProps = {
  currentUserId?: number | null;
  member: GroupUser;
};

const keyExtractor = (member: GroupUser) => String(member.id);

const MemberItem = ({ currentUserId, member }: MemberItemProps) => {
  const supportingLabel =
    member.id === currentUserId
      ? 'You'
      : member.email ?? member.mobile_number ?? 'Group member';

  return (
    <View className="mb-3 flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-4">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
        <ThemedText className="text-sm text-primary" weight="semiBold">
          {getUserInitial(member)}
        </ThemedText>
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <ThemedText className="text-sm text-gray-900" weight="semiBold" numberOfLines={1}>
          {getUserLabel(member)}
        </ThemedText>
        <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {supportingLabel}
        </ThemedText>
      </View>
    </View>
  );
};

const MembersModal = ({ currentUserId, isVisible, members, onClose }: MembersModalProps) => {
  const renderMember: ListRenderItem<GroupUser> = ({ item }) => (
    <MemberItem currentUserId={currentUserId} member={item} />
  );

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Close members"
          className="flex-1"
          onPress={onClose}
        />
        <SafeAreaView
          edges={['bottom']}
          className="rounded-t-[28px] bg-white"
          style={{ maxHeight: '80%' }}
        >
          <View className="px-5 pb-4 pt-5">
            <View className="flex-row items-center justify-between">
              <View className="min-w-0 flex-1">
                <ThemedText className="text-xl text-gray-900" weight="bold">
                  Members
                </ThemedText>
                <ThemedText className="mt-1 text-sm text-gray-500">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </ThemedText>
              </View>
              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Close members"
                onPress={onClose}
                className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={22} color={themeColors.gray700} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={members}
            initialNumToRender={12}
            keyExtractor={keyExtractor}
            renderItem={renderMember}
            showsVerticalScrollIndicator={members.length > 6}
            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 20 }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default MembersModal;
