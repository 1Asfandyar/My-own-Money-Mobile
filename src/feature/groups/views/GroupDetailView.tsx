import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import AmountWithCurrency from '@/components/AmountWithCurrency';
import { useLoggedInUser } from '@/feature/auth/hooks/useLoggedInUser';
import EditGroupModal from '@/feature/groups/components/EditGroupModal';
import MembersModal from '@/feature/groups/components/MembersModal';
import type { GroupBalanceType, MemberBalanceEntry, MemberBalances } from '@/feature/groups/types/group.types';
import type { GroupDetailViewProps } from '@/feature/groups/types/groupDetail.types';
import { getUserInitial } from '@/feature/groups/utils/groupMembers.utils';
import TransactionList from '@/feature/transactions/components/TransactionList';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { fallbackCurrencies, getCurrencyById } from '@/utils/currency';

const DEBT_COLOR = '#DC2626';

const getBalanceColor = (type: GroupBalanceType) => {
  if (type === 'owes_you') return themeColors.primary;
  if (type === 'you_owe') return DEBT_COLOR;
  return themeColors.gray500;
};

const getBalanceLabel = (type: GroupBalanceType) => {
  if (type === 'owes_you') return 'You are owed';
  if (type === 'you_owe') return 'You owe';
  return 'Settled up';
};

const getEntryDescription = (entry: MemberBalanceEntry) => {
  const fromName = entry.from_user.is_you ? 'You' : entry.from_user.name;
  const toName = entry.to_user.is_you ? 'you' : entry.to_user.name;
  const verb = entry.from_user.is_you ? 'owe' : 'owes';
  return `${fromName} ${verb} ${toName}`;
};

const getEntryColor = (entry: MemberBalanceEntry) => {
  if (entry.from_user.is_you) return DEBT_COLOR;
  if (entry.to_user.is_you) return themeColors.primary;
  return themeColors.gray500;
};

type BalanceSectionProps = {
  memberBalances: MemberBalances;
};

const BalanceSection = ({ memberBalances }: BalanceSectionProps) => {
  const { user } = useLoggedInUser();
  const displayCurrency = getCurrencyById(user?.currency_id, fallbackCurrencies);
  const { overall, per_member } = memberBalances;
  const overallColor = getBalanceColor(overall.type);
  const overallLabel = getBalanceLabel(overall.type);

  return (
    <View className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
      <View className="flex-row items-center justify-between">
        <ThemedText className="text-sm text-gray-500">Overall balance</ThemedText>
        <View className="flex-row items-center gap-1">
          <ThemedText className="text-sm" style={{ color: overallColor }} weight="semiBold">
            {overallLabel}
          </ThemedText>
          {overall.type !== 'settled_up' && (
            <AmountWithCurrency
              amountCents={overall.amount_cents}
              currencySymbol={displayCurrency.symbol}
              useAbsoluteValue={true}
              customColor={overallColor}
              weight="semiBold"
              className="text-sm"
            />
          )}
        </View>
      </View>

      {per_member.length > 0 && (
        <>
          <View className="my-3 h-px bg-gray-200" />
          {per_member.map((entry) => {
            const color = getEntryColor(entry);
            return (
              <View
                key={`${entry.from_user.id}-${entry.to_user.id}`}
                className="flex-row items-center justify-between py-1"
              >
                <ThemedText
                  className="min-w-0 flex-1 text-sm text-gray-700"
                  numberOfLines={1}
                >
                  {getEntryDescription(entry)}
                </ThemedText>
                <AmountWithCurrency
                  amountCents={entry.amount_cents}
                  currencySymbol={displayCurrency.symbol}
                  useAbsoluteValue={true}
                  customColor={color}
                  weight="semiBold"
                  className="ml-4 text-sm"
                />
              </View>
            );
          })}
        </>
      )}
    </View>
  );
};

const CONTENT_STYLE = { paddingBottom: 40, paddingHorizontal: 20, paddingTop: 20 };

const AVATAR_MAX = 3;

const GroupDetailView = ({ detail }: GroupDetailViewProps) => {
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);
  const groupName = detail.group?.name?.trim() || 'Group';
  const previewMembers = detail.members.slice(0, AVATAR_MAX);
  const extraCount = detail.members.length - AVATAR_MAX;

  const listHeader = (
    <View>
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
            detail.group && !detail.isLoading ? 'bg-primary/10' : 'bg-gray-100'
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
          <ThemedText className="text-sm text-red-600">{detail.error}</ThemedText>
        </View>
      ) : null}

      {detail.isLoading ? (
        <View className="items-center justify-center py-16">
          <ActivityIndicator color={themeColors.primary} />
          <ThemedText className="mt-3 text-sm text-gray-500">Loading group</ThemedText>
        </View>
      ) : detail.group ? (
        <>
          <View className="rounded-2xl border border-gray-100 bg-lightBlue px-5 py-5">
            <View className="flex-row items-center">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
                <Ionicons name="people-outline" size={28} color={themeColors.primary} />
              </View>
              <View className="ml-4 min-w-0 flex-1">
                <ThemedText
                  className="text-2xl text-gray-900"
                  weight="bold"
                  numberOfLines={2}
                >
                  {groupName}
                </ThemedText>
                <TouchableOpacity
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="View members"
                  onPress={() => setIsMembersModalVisible(true)}
                  className="mt-2 flex-row items-center"
                >
                  <View className="flex-row">
                    {previewMembers.map((member, index) => (
                      <View
                        key={member.id}
                        className="h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary/15"
                        style={{ marginLeft: index === 0 ? 0 : -8 }}
                      >
                        <ThemedText className="text-xs text-primary" weight="semiBold">
                          {getUserInitial(member)}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                  {extraCount > 0 && (
                    <ThemedText className="ml-2 text-xs text-gray-500">
                      +{extraCount} more
                    </ThemedText>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={13}
                    color={themeColors.gray400}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {detail.memberBalances && (
            <BalanceSection
              memberBalances={detail.memberBalances}
            />
          )}

          <View className="mb-3 mt-6 flex-row items-center justify-between">
            <ThemedText className="text-base text-gray-900" weight="semiBold">
              Activity
            </ThemedText>
            <ThemedText className="text-xs text-gray-400">
              {detail.transactions.length}{' '}
              {detail.transactions.length === 1 ? 'transaction' : 'transactions'}
            </ThemedText>
          </View>
        </>
      ) : (
        <View className="items-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10">
          <Ionicons name="alert-circle-outline" size={28} color={themeColors.primary} />
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
    </View>
  );

  const emptyState =
    !detail.isLoading && detail.group && detail.transactions.length === 0 ? (
      <View className="mt-3 items-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-7">
        <Ionicons name="receipt-outline" size={26} color={themeColors.gray400} />
        <ThemedText className="mt-3 text-center text-sm leading-5 text-gray-500">
          No activity yet.
        </ThemedText>
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-white">
      <TransactionList
        contentContainerStyle={CONTENT_STYLE}
        isRefreshing={detail.isLoading}
        ListEmptyComponent={emptyState}
        ListHeaderComponent={listHeader}
        onRefresh={detail.onRefresh}
        onSelectTransaction={detail.onSelectTransaction}
        transactions={detail.isLoading || !detail.group ? [] : detail.transactions}
      />

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

      <MembersModal
        currentUserId={detail.currentUserId}
        isVisible={isMembersModalVisible}
        members={detail.members}
        onClose={() => setIsMembersModalVisible(false)}
      />
    </View>
  );
};

export default GroupDetailView;
