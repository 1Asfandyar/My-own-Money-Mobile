import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type { SharedTransactionDetailViewProps } from '@/feature/transactions/types/transaction.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const HeaderIconButton = ({
  accessibilityLabel,
  disabled = false,
  iconName,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.76}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    disabled={disabled}
    className="h-11 w-11 items-center justify-center rounded-full bg-gray-50"
    onPress={onPress}
  >
    <Ionicons
      name={iconName}
      size={22}
      color={disabled ? themeColors.gray400 : themeColors.gray900}
    />
  </TouchableOpacity>
);

const SharedTransactionDetailView = ({
  detail,
}: SharedTransactionDetailViewProps) => {
  if (detail.isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-white px-6"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <ActivityIndicator color={themeColors.primary} />
        <ThemedText className="mt-3 text-sm text-gray-500">
          Loading shared expense...
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (detail.error && detail.participantRows.length === 0) {
    return (
      <SafeAreaView
        className="flex-1 bg-white px-5 pt-5"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <HeaderIconButton
          accessibilityLabel="Go back"
          iconName="chevron-back"
          onPress={detail.onBack}
        />
        <View className="flex-1 items-center justify-center">
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={themeColors.gray400}
          />
          <ThemedText className="mt-3 text-center text-sm text-gray-500">
            {detail.error}
          </ThemedText>
          <ThemedButton
            title="Try again"
            onPress={detail.onRetry}
            containerClassName="mt-5 px-5 py-3"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <HeaderIconButton
            accessibilityLabel="Go back"
            iconName="chevron-back"
            onPress={detail.onBack}
          />
          <ThemedText className="text-xl text-gray-900" weight="semiBold">
            Details
          </ThemedText>
          <View className="flex-row items-center">
            <HeaderIconButton
              accessibilityLabel="Delete shared expense"
              disabled={detail.isDeleting}
              iconName="trash-outline"
              onPress={detail.onDelete}
            />
            <View className="w-2" />
            <HeaderIconButton
              accessibilityLabel="Edit shared expense"
              iconName="create-outline"
              onPress={detail.onEdit}
            />
          </View>
        </View>

        <View className="mt-7 flex-row items-start">
        <View
          className="h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: detail.categorySoftColor }}
        >
          <Ionicons
            name={detail.categoryIconName}
            size={27}
            color={detail.categoryColor}
          />
        </View>

        <View className="ml-4 min-w-0 flex-1">
          <ThemedText
            className="text-xl text-gray-900"
            numberOfLines={2}
            weight="semiBold"
          >
            {detail.title}
          </ThemedText>
          <ThemedText
            adjustsFontSizeToFit
            className="mt-2 text-4xl text-gray-900"
            numberOfLines={1}
            weight="bold"
          >
            {detail.amountLabel}
          </ThemedText>
          <ThemedText className="mt-3 text-sm text-gray-500">
            {detail.createdByLabel}
          </ThemedText>
          {detail.note ? (
            <ThemedText className="mt-2 text-sm leading-5 text-gray-500">
              {detail.note}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <View className="mt-8 h-px bg-gray-100" />

      <View className="mt-7">
        <View className="flex-row items-center">
          {detail.paidByUser ? (
            <SharedExpenseAvatar user={detail.paidByUser} size={50} />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="person" size={22} color={themeColors.primary} />
            </View>
          )}
          <ThemedText className="ml-3 flex-1 text-base text-gray-900">
            {detail.paidByLabel}
          </ThemedText>
        </View>

        <View className="ml-6 mt-2 border-l border-gray-200 pl-6">
          {detail.participantRows.map((participant) => (
            <View key={participant.id} className="mt-4 flex-row items-center">
              <SharedExpenseAvatar user={participant.user} size={36} />
              <View className="ml-3 min-w-0 flex-1">
                <ThemedText
                  className="text-sm text-gray-700"
                  numberOfLines={1}
                >
                  {participant.label}
                </ThemedText>
                {participant.isPayer ? (
                  <ThemedText className="mt-0.5 text-xs text-primary">
                    Paid this expense
                  </ThemedText>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </View>

        {detail.error ? (
          <ThemedText className="mt-6 text-center text-xs text-red-500">
            {detail.error}
          </ThemedText>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SharedTransactionDetailView;
