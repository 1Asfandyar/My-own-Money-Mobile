import type { Ionicons } from '@expo/vector-icons';

import type {
  Category,
  ManageableCategoryType,
} from '@/feature/categories/types/category.types';

export type CategoryFormModalProps = {
  categoryName: string;
  categoryType: ManageableCategoryType;
  color: string;
  error: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSaving: boolean;
  isVisible: boolean;
  onChangeName: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onSelectColor: (value: string) => void;
  onSelectIcon: (value: keyof typeof Ionicons.glyphMap) => void;
  onSelectType: (value: ManageableCategoryType) => void;
};

export type CategoryManagementCardProps = {
  category: Category;
  isDeleting: boolean;
  onDelete: (category: Category) => void;
};

export type ManageCategoriesViewModel = {
  categories: Category[];
  categoryName: string;
  categoryType: ManageableCategoryType;
  color: string;
  error: string;
  formError: string;
  icon: keyof typeof Ionicons.glyphMap;
  isAddModalVisible: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onBack: () => void;
  onChangeName: (value: string) => void;
  onCloseAddModal: () => void;
  onDeleteCategory: (category: Category) => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  onSaveCategory: () => void;
  onSelectColor: (value: string) => void;
  onSelectIcon: (value: keyof typeof Ionicons.glyphMap) => void;
  onSelectType: (value: ManageableCategoryType) => void;
  removingCategoryId: number | null;
};

export type ManageCategoriesViewProps = {
  manager: ManageCategoriesViewModel;
};
