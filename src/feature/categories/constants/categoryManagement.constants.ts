import type { Ionicons } from '@expo/vector-icons';

export const CATEGORY_MANAGEMENT_ICON_OPTIONS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { icon: 'cart-outline', label: 'Shopping' },
  { icon: 'restaurant-outline', label: 'Food' },
  { icon: 'car-outline', label: 'Transport' },
  { icon: 'home-outline', label: 'Home' },
  { icon: 'medical-outline', label: 'Health' },
  { icon: 'cash-outline', label: 'Money' },
  { icon: 'briefcase-outline', label: 'Work' },
  { icon: 'ellipsis-horizontal-circle-outline', label: 'Other' },
];

export const CATEGORY_MANAGEMENT_COLOR_OPTIONS = [
  '#2BA88C',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#4B5563',
] as const;
