import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

type ManagementScreenHeaderProps = {
  addLabel: string;
  onAdd: () => void;
  onBack: () => void;
  subtitle: string;
  title: string;
};

const ManagementScreenHeader = ({
  addLabel,
  onAdd,
  onBack,
  subtitle,
  title,
}: ManagementScreenHeaderProps) => (
  <View>
    <View className="flex-row items-center justify-between">
      <TouchableOpacity
        activeOpacity={0.76}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center rounded-full bg-gray-100"
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={22} color={themeColors.gray900} />
      </TouchableOpacity>

      <ThemedButton
        title={addLabel}
        leftIcon="add-circle-outline"
        containerClassName="px-4 py-3"
        iconSize={16}
        onPress={onAdd}
        textClassName="text-sm"
      />
    </View>

    <ThemedText className="mt-6 text-2xl text-gray-900" weight="bold">
      {title}
    </ThemedText>
    <ThemedText className="mt-1 text-sm leading-5 text-gray-500">
      {subtitle}
    </ThemedText>
  </View>
);

export default ManagementScreenHeader;
