import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

type ManagementListStateProps = {
  emptyMessage: string;
  emptyTitle: string;
  error: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLoading: boolean;
  loadingLabel: string;
  onAdd: () => void;
  onRetry: () => void;
};

const ManagementListState = ({
  emptyMessage,
  emptyTitle,
  error,
  icon,
  isLoading,
  loadingLabel,
  onAdd,
  onRetry,
}: ManagementListStateProps) => {
  if (isLoading) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator color={themeColors.primary} />
        <ThemedText className="mt-3 text-sm text-gray-500">
          {loadingLabel}
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="rounded-2xl border border-red-100 bg-red-50 px-5 py-5">
        <ThemedText className="text-base text-red-700" weight="semiBold">
          Could not load this information
        </ThemedText>
        <ThemedText className="mt-2 text-sm leading-5 text-red-600">
          {error}
        </ThemedText>
        <ThemedButton
          title="Try again"
          containerClassName="mt-4"
          onPress={onRetry}
          variant="outline"
        />
      </View>
    );
  }

  return (
    <View className="items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-white">
        <Ionicons name={icon} size={29} color={themeColors.primary} />
      </View>
      <ThemedText className="mt-4 text-lg text-gray-900" weight="semiBold">
        {emptyTitle}
      </ThemedText>
      <ThemedText className="mt-2 text-center text-sm leading-5 text-gray-500">
        {emptyMessage}
      </ThemedText>
      <ThemedButton
        title="Add new"
        leftIcon="add-circle-outline"
        containerClassName="mt-6 px-6"
        onPress={onAdd}
      />
    </View>
  );
};

export default ManagementListState;
