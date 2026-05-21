import type { MainTabBarItem } from '@/feature/main/types/mainTabBar.types';

export const mainTabBarItems: MainTabBarItem[] = [
  {
    routeName: 'reports',
    title: 'Reports',
    accessibilityLabel: 'Open reports',
    iconName: 'grid-outline',
    activeIconName: 'grid',
  },
  {
    routeName: 'groups',
    title: 'Groups',
    accessibilityLabel: 'Open groups',
    iconName: 'people-outline',
    activeIconName: 'people',
  },
  {
    routeName: 'home',
    title: 'Home',
    accessibilityLabel: 'Open home',
    iconName: 'home-outline',
    activeIconName: 'home',
  },
  {
    routeName: 'transactions',
    title: 'Transactions',
    accessibilityLabel: 'Open transactions',
    iconName: 'receipt-outline',
    activeIconName: 'receipt',
  },
  {
    routeName: 'profile',
    title: 'You',
    accessibilityLabel: 'Open your profile',
    iconName: 'person-outline',
    activeIconName: 'person',
  },
];
