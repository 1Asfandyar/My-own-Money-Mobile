import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FloatingBubbleTabBarItem from '@/feature/main/components/FloatingBubbleTabBarItem';
import { mainTabBarItems } from '@/feature/main/constants/mainTabBar.constants';
import { themeColors } from '@/theme/utilities';
import { NavigationRoute } from '../types/mainTabBar.types';

const BAR_HEIGHT = 74;
const BAR_BOTTOM_OFFSET = 44;

const getMainTabItem = (routeName: string) =>
  mainTabBarItems.find((item) => item.routeName === routeName);

const getOrderedMainRoutes = (routes: NavigationRoute[]) =>
  mainTabBarItems
    .map((item) => routes.find((route) => route.name === item.routeName))
    .filter((route): route is NavigationRoute => Boolean(route));

const FloatingBubbleTabBar = ({ navigation, state }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index];
  const orderedRoutes = getOrderedMainRoutes(state.routes);
  const tabSlotWidth =
    `${100 / Math.max(orderedRoutes.length, 1)}%` as `${number}%`;

  const handleTabPress = (route: NavigationRoute, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, BAR_BOTTOM_OFFSET) },
      ]}
    >
      <View accessibilityRole="tablist" style={styles.container}>
        {orderedRoutes.map((route) => {
          const item = getMainTabItem(route.name);

          if (!item) {
            return null;
          }

          const isFocused = route.key === activeRoute.key;

          return (
            <FloatingBubbleTabBarItem
              key={route.key}
              isFocused={isFocused}
              item={item}
              onPress={() => handleTabPress(route, isFocused)}
              slotWidth={tabSlotWidth}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: 'rgba(43, 168, 140, 0.12)',
    borderWidth: 1,
    borderRadius: BAR_HEIGHT / 2,
    elevation: 16,
    flexDirection: 'row',
    height: BAR_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    shadowColor: themeColors.black,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    width: '100%',
  },
  wrapper: {
    left: 12,
    position: 'absolute',
    right: 12,
    zIndex: 30,
  },
});

export default FloatingBubbleTabBar;
