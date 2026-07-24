import { Ionicons } from '@expo/vector-icons';
import { Modal, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type {
  MainSideMenuItem,
  MainSideMenuModalProps,
} from '@/feature/main/types/mainHeader.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const MainSideMenuRow = ({ icon, label, onPress, subtitle }: MainSideMenuItem) => (
  <TouchableOpacity
    activeOpacity={0.75}
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    className="mb-3 flex-row items-center rounded-2xl bg-gray-50 px-4 py-4"
  >
    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
      <Ionicons name={icon} size={20} color={themeColors.primary} />
    </View>
    <View className="ml-3 min-w-0 flex-1">
      <ThemedText className="text-sm text-gray-900" weight="semiBold">
        {label}
      </ThemedText>
      <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
        {subtitle}
      </ThemedText>
    </View>
    <Ionicons name="chevron-forward" size={18} color={themeColors.gray400} />
  </TouchableOpacity>
);

const MainSideMenuModal = ({
  menuHeaderSubtitle,
  menuHeaderTitle,
  isVisible,
  onClose,
  primaryItems,
  secondaryItems,
}: MainSideMenuModalProps) => (
  <Modal
    animationType="fade"
    transparent
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View className="flex-1 flex-row bg-black/35">
      <SafeAreaView
        edges={['top', 'bottom', 'left']}
        className="h-full w-[86%] max-w-sm bg-white"
      >
        <View className="flex-1 px-5 pb-5 pt-3">
          <View className="mb-5 flex-row items-start justify-between">
            <View className="min-w-0 flex-1 pr-3">
              <ThemedText className="text-xs uppercase tracking-wide text-gray-400">
                {menuHeaderSubtitle}
              </ThemedText>
              <ThemedText className="mt-1 text-2xl text-gray-900" weight="bold">
                {menuHeaderTitle}
              </ThemedText>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Close side menu"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color={themeColors.gray700} />
            </TouchableOpacity>
          </View>

          <ThemedText className="mb-3 text-xs uppercase tracking-wide text-gray-400">
            Manage and connect
          </ThemedText>
          {primaryItems.map((item) => (
            <MainSideMenuRow key={item.label} {...item} />
          ))}

          <ThemedText className="mb-3 mt-3 text-xs uppercase tracking-wide text-gray-400">
            App
          </ThemedText>
          {secondaryItems.map((item) => (
            <MainSideMenuRow key={item.label} {...item} />
          ))}
        </View>
      </SafeAreaView>

      <TouchableOpacity
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Close side menu overlay"
        className="flex-1"
        onPress={onClose}
      />
    </View>
  </Modal>
);

export default MainSideMenuModal;
