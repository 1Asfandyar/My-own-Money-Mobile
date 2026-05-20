import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import type { ProfileAccordionSectionProps } from '@/feature/profile/types/profile.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const ProfileAccordionSection = ({
  children,
  isExpanded,
  onToggle,
  subtitle,
  title,
}: ProfileAccordionSectionProps) => (
  <View className="mb-5 rounded-2xl border border-gray-100 bg-white">
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      className="flex-row items-center justify-between px-4 py-5"
      onPress={onToggle}
    >
      <View className="min-w-0 flex-1 pr-3">
        <ThemedText className="text-lg text-gray-900" weight="bold">
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText className="mt-1 text-xs text-gray-500">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Ionicons
        name={isExpanded ? 'chevron-down' : 'chevron-forward'}
        size={20}
        color={themeColors.gray500}
      />
    </TouchableOpacity>

    {isExpanded ? <View className="px-4 pb-5">{children}</View> : null}
  </View>
);

export default ProfileAccordionSection;
