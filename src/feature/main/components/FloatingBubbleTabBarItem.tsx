import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import type { FloatingBubbleTabBarItemProps } from '@/feature/main/types/mainTabBar.types';
import { useAuthStore } from '@/store/auth.store';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import type { AuthUser } from '@/types/auth.types';

const getInitial = (name?: string) => name?.trim().charAt(0).toUpperCase() || 'U';

const getProfileImageUrl = (user: AuthUser | null) =>
  user?.avatar_url?.trim() ||
  user?.photo_url?.trim() ||
  user?.profile_photo_url?.trim() ||
  user?.profile_image_url?.trim() ||
  null;

const FloatingBubbleTabBarItem = ({
  isFocused,
  item,
  onPress,
  slotWidth,
}: FloatingBubbleTabBarItemProps) => {
  const user = useAuthStore((state) => state.user);
  const isProfileTab = item.routeName === 'profile';
  const iconName = isFocused ? item.activeIconName ?? item.iconName : item.iconName;
  const profileImageUrl = isProfileTab ? getProfileImageUrl(user) : null;

  return (
    <Pressable
      accessibilityLabel={item.accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabSlot,
        { width: slotWidth },
        pressed ? styles.pressedTabSlot : null,
      ]}
    >
      <View style={styles.tabContent}>
        {isProfileTab ? (
          <View style={styles.avatarFrame}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <ThemedText style={styles.avatarInitial} weight="semiBold">
                {getInitial(user?.full_name)}
              </ThemedText>
            )}
          </View>
        ) : (
          <Ionicons
            name={iconName}
            size={24}
            color={isFocused ? themeColors.primaryDark : themeColors.gray900}
          />
        )}
        <ThemedText
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          style={[styles.label, isFocused ? styles.activeLabel : null]}
          weight={isFocused ? 'semiBold' : 'medium'}
        >
          {item.title}
        </ThemedText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  activeLabel: {
    color: themeColors.primaryDark,
  },
  avatarFrame: {
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    borderColor: 'transparent',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 28,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarInitial: {
    color: themeColors.white,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: themeColors.gray900,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
    maxWidth: '100%',
    textAlign: 'center',
  },
  pressedTabSlot: {
    opacity: 0.72,
  },
  tabContent: {
    alignItems: 'center',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    paddingHorizontal: 4,
    width: '100%',
  },
  tabSlot: {
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
    height: 68,
    justifyContent: 'center',
    minWidth: 0,
  },
});

export default FloatingBubbleTabBarItem;
