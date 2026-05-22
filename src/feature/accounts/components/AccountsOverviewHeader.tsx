import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import type { AccountsOverviewHeaderProps } from '@/feature/accounts/types/accountsOverview.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const AccountsOverviewHeader = ({
  firstName,
  onRefresh,
}: AccountsOverviewHeaderProps) => {
  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        <ThemedText className="text-2xl text-gray-900" weight="bold">
          Welcome{firstName ? `, ${firstName}` : ''}
        </ThemedText>
      </View>

      <TouchableOpacity
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Refresh dashboard"
        onPress={onRefresh}
        className="h-10 w-10 items-center justify-center rounded-2xl bg-gray-100"
      >
        <Ionicons name="refresh" size={18} color={themeColors.gray700} />
      </TouchableOpacity>
    </View>
  );
};

export default AccountsOverviewHeader;
