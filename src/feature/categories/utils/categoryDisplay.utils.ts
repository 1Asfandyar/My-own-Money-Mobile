import { Ionicons } from '@expo/vector-icons';

import {
  CATEGORY_COLOR_FALLBACK,
  CATEGORY_ICON_FALLBACK,
} from '@/feature/categories/constants/categoryDashboard.constants';
import type { Category } from '@/feature/categories/types/category.types';

export const getCategoryDisplayIcon = (
  category: Category,
): keyof typeof Ionicons.glyphMap => {
  const icon = category.icon;

  if (icon && icon in Ionicons.glyphMap) {
    return icon as keyof typeof Ionicons.glyphMap;
  }

  return CATEGORY_ICON_FALLBACK[category.category_type];
};

export const getCategoryDisplayColor = (category: Category) =>
  category.color ?? CATEGORY_COLOR_FALLBACK[category.category_type];

export const getCategorySoftColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}1A` : '#F3F4F6';
