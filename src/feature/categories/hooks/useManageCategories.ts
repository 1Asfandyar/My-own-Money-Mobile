import type { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/config/routes';
import {
  createCategory,
  deleteCategory,
  listCategories,
} from '@/feature/categories/api/categories.api';
import { CATEGORY_MANAGEMENT_COLOR_OPTIONS } from '@/feature/categories/constants/categoryManagement.constants';
import type {
  Category,
  ManageableCategoryType,
} from '@/feature/categories/types/category.types';
import type { ManageCategoriesViewModel } from '@/feature/categories/types/manageCategories.types';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { getRequestError } from '@/utils/errors';

const DEFAULT_ICON: keyof typeof Ionicons.glyphMap = 'cart-outline';

const useManageCategories = (): ManageCategoriesViewModel => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] =
    useState<ManageableCategoryType>('expense');
  const [color, setColor] = useState<string>(
    CATEGORY_MANAGEMENT_COLOR_OPTIONS[0],
  );
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap>(DEFAULT_ICON);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [removingCategoryId, setRemovingCategoryId] = useState<number | null>(
    null,
  );
  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (first, second) =>
          first.category_type.localeCompare(second.category_type) ||
          first.name.localeCompare(second.name),
      ),
    [categories],
  );
  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const loadCategories = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      setCategories(await listCategories(token, { includeZeroBalance: true }));
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(getRequestError(requestError, 'Could not load categories.'));
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, token]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openAddModal = useCallback(() => {
    setCategoryName('');
    setCategoryType('expense');
    setColor(CATEGORY_MANAGEMENT_COLOR_OPTIONS[0]);
    setIcon(DEFAULT_ICON);
    setFormError('');
    setIsAddModalVisible(true);
  }, []);

  const closeAddModal = useCallback(() => {
    if (!isSaving) {
      setFormError('');
      setIsAddModalVisible(false);
    }
  }, [isSaving]);

  const saveCategory = useCallback(async () => {
    if (!token) {
      setFormError('Please sign in again to add a category.');
      return;
    }

    const name = categoryName.trim();

    if (!name) {
      setFormError('Enter a category name.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const category = await createCategory(token, {
        category_type: categoryType,
        color,
        icon,
        name,
      });

      setCategories((currentCategories) => [...currentCategories, category]);
      setIsAddModalVisible(false);
    } catch (requestError) {
      setFormError(
        getRequestError(requestError, 'Could not create this category.'),
      );
    } finally {
      setIsSaving(false);
    }
  }, [categoryName, categoryType, color, icon, token]);

  const removeCategory = useCallback(
    (category: Category) => {
      Alert.alert(
        'Remove category?',
        `This will permanently remove "${category.name}". This action cannot be undone.`,
        [
          { style: 'cancel', text: 'Cancel' },
          {
            style: 'destructive',
            text: 'Remove',
            onPress: async () => {
              if (!token) {
                setError('Please sign in again to remove this category.');
                return;
              }

              setRemovingCategoryId(category.id);
              setError('');

              try {
                await deleteCategory(token, category.id);
                setCategories((currentCategories) =>
                  currentCategories.filter((item) => item.id !== category.id),
                );
              } catch (requestError) {
                setError(
                  getRequestError(
                    requestError,
                    'Could not remove this category.',
                  ),
                );
              } finally {
                setRemovingCategoryId(null);
              }
            },
          },
        ],
      );
    },
    [token],
  );

  return {
    categories: sortedCategories,
    categoryName,
    categoryType,
    color,
    error,
    formError,
    icon,
    isAddModalVisible,
    isLoading,
    isSaving,
    onBack: () => router.back(),
    onChangeName: setCategoryName,
    onCloseAddModal: closeAddModal,
    onDeleteCategory: removeCategory,
    onOpenAddModal: openAddModal,
    onRefresh: () => void loadCategories(),
    onSaveCategory: () => void saveCategory(),
    onSelectColor: setColor,
    onSelectIcon: setIcon,
    onSelectType: setCategoryType,
    removingCategoryId,
  };
};

export default useManageCategories;
