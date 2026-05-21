import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';

export type ExpenseOverviewTab = 'personal' | 'shared';

export type ExpenseOverviewTabConfig = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: ExpenseOverviewTab;
};

export type ExpenseOverviewTabsProps = {
  selectedTab: ExpenseOverviewTab;
  onSelectTab: (tab: ExpenseOverviewTab) => void;
  children?: ReactNode;
};
