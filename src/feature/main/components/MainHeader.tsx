import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { themeColors } from '@/theme/utilities';

const MainHeader = () => {
  return (
    <SafeAreaView edges={['top']} className="bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-3 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open side menu"
          className="h-11 w-11 items-center justify-center rounded-xl bg-gray-100"
        >
          <Ionicons name="menu" size={24} color={themeColors.gray900} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          className="h-11 w-11 items-center justify-center rounded-xl bg-gray-100"
        >
          <Ionicons name="notifications-outline" size={21} color={themeColors.gray700} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default MainHeader;
