import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export type MainTabRouteName =
  | 'home'
  | 'transactions'
  | 'groups'
  | 'reports'
  | 'profile';

export type MainTabBarItem = {
  accessibilityLabel: string;
  activeIconName?: keyof typeof Ionicons.glyphMap;
  iconName: keyof typeof Ionicons.glyphMap;
  routeName: MainTabRouteName;
  title: string;
};

export type NavigationRoute = BottomTabBarProps['state']['routes'][number];

export type FloatingBubbleTabBarItemProps = {
  isFocused: boolean;
  item: MainTabBarItem;
  onPress: () => void;
  slotWidth: `${number}%`;
};