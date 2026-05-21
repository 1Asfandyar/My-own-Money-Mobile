import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { sharedExpenseSplitMethods } from '@/feature/transactions/constants/sharedExpenseSplit.constants';
import { sharedExpenseSplitSheetStyles } from '@/feature/transactions/components/SharedExpenseSplitSheet.styles';
import SplitParticipantRow from '@/feature/transactions/components/SplitParticipantRow';
import type { SharedExpenseSplitSheetProps } from '@/feature/transactions/types/addTransactionRecord.types';
import type { GroupUser } from '@/feature/groups/types/group.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatCents } from '@/utils/currency';

const keyExtractor = (participant: GroupUser) => String(participant.id);

const SharedExpenseSplitSheet = ({
  currencyId,
  error,
  isVisible,
  method,
  onChangeMethod,
  onChangeValue,
  onClose,
  participants,
  totalAmountCents,
  values,
}: SharedExpenseSplitSheetProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const totalShares = useMemo(
    () =>
      participants.reduce((total, participant) => {
        const share = Number(values[String(participant.id)] ?? 0);

        return total + (Number.isFinite(share) ? share : 0);
      }, 0),
    [participants, values],
  );
  const selectedMethod =
    sharedExpenseSplitMethods.find((option) => option.value === method) ??
    sharedExpenseSplitMethods[0];
  const renderParticipant = useCallback<ListRenderItem<GroupUser>>(
    ({ item, index }) => (
      <SplitParticipantRow
        currencyId={currencyId}
        index={index}
        method={method}
        onChangeValue={onChangeValue}
        participant={item}
        participantCount={participants.length}
        totalAmountCents={totalAmountCents}
        totalShares={totalShares}
        value={values[String(item.id)] ?? ''}
      />
    ),
    [
      currencyId,
      method,
      onChangeValue,
      participants.length,
      totalAmountCents,
      totalShares,
      values,
    ],
  );

  const selectMethod = (nextMethod: SharedExpenseSplitSheetProps['method']) => {
    onChangeMethod(nextMethod);
    setIsDropdownOpen(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View
      className="z-50 justify-end"
      pointerEvents="box-none"
      style={sharedExpenseSplitSheetStyles.overlay}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close split settings"
        className="flex-1 bg-black/40"
        onPress={onClose}
      />

      <View
        className="overflow-hidden rounded-t-[28px] bg-white"
        style={sharedExpenseSplitSheetStyles.sheet}
      >
        <View className="px-5 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <ThemedText className="text-xl text-gray-900" weight="bold">
                Split settings
              </ThemedText>
              <ThemedText className="mt-1 text-sm text-gray-500">
                Total {formatCents(totalAmountCents, currencyId)}
              </ThemedText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close split settings"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color={themeColors.gray700} />
            </Pressable>
          </View>

          <View className="mb-4">
            <ThemedText className="mb-2 text-sm text-gray-600" weight="semiBold">
              Split type
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isDropdownOpen }}
              onPress={() => setIsDropdownOpen((isOpen) => !isOpen)}
              className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <View className="min-w-0 flex-1">
                <ThemedText className="text-base text-gray-900" weight="semiBold">
                  {selectedMethod.label}
                </ThemedText>
                <ThemedText
                  className="mt-0.5 text-xs text-gray-500"
                  numberOfLines={1}
                >
                  {selectedMethod.description}
                </ThemedText>
              </View>
              <Ionicons
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={themeColors.gray500}
              />
            </Pressable>

            {isDropdownOpen ? (
              <View className="mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white">
                {sharedExpenseSplitMethods.map((option) => {
                  const isSelected = option.value === method;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      onPress={() => selectMethod(option.value)}
                      className={`flex-row items-center px-4 py-3 ${
                        isSelected ? 'bg-primary/10' : 'bg-white'
                      }`}
                    >
                      <View className="min-w-0 flex-1">
                        <ThemedText
                          className={`text-sm ${
                            isSelected ? 'text-primary' : 'text-gray-900'
                          }`}
                          weight={isSelected ? 'semiBold' : 'regular'}
                        >
                          {option.label}
                        </ThemedText>
                        <ThemedText
                          className="mt-0.5 text-xs text-gray-500"
                          numberOfLines={1}
                        >
                          {option.description}
                        </ThemedText>
                      </View>
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={themeColors.primary}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          {error ? (
            <View className="mb-3 rounded-2xl bg-red-50 px-4 py-3">
              <ThemedText className="text-sm text-red-600">{error}</ThemedText>
            </View>
          ) : null}
        </View>

        <FlatList
          data={participants}
          initialNumToRender={8}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          maxToRenderPerBatch={8}
          nestedScrollEnabled
          renderItem={renderParticipant}
          showsVerticalScrollIndicator={participants.length > 4}
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 20 }}
          style={sharedExpenseSplitSheetStyles.participantsList}
          windowSize={5}
        />
      </View>
    </View>
  );
};

export default SharedExpenseSplitSheet;
