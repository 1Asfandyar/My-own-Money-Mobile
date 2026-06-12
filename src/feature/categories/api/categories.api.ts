import { apiRequest } from '@/services/api';
import type { TransactionsByCategoryDashboard } from '@/feature/categories/types/categoryDashboard.types';
import type {
  Category,
  CreateCategoryPayload,
} from '@/feature/categories/types/category.types';

export const listCategories = async (token: string) => {
  const result = await apiRequest<{ success: true; categories: Category[] }>(
    '/api/v0/categories',
    { token },
  );

  return (result.data.categories ?? []).map((category) => ({
    ...category,
    balance_cents: category.balance_cents ?? 0,
  }));
};

export const getCategoriesSummary = async (
  token: string,
  accountId: number,
) => {
  const query = new URLSearchParams({
    account_id: String(accountId),
  });
  const result = await apiRequest<
    { success: true } & Pick<TransactionsByCategoryDashboard, 'categories'>
  >(`/api/v0/categories/summary?${query.toString()}`, { token });
  const categories = result.data.categories ?? [];

  return {
    total_amount_cents: categories.reduce(
      (total, item) => total + item.amount_cents,
      0,
    ),
    total_absolute_amount_cents: categories.reduce(
      (total, item) => total + Math.abs(item.amount_cents),
      0,
    ),
    categories,
  };
};

export const createCategory = async (
  token: string,
  payload: CreateCategoryPayload,
) => {
  const result = await apiRequest<{ success: true; category: Category }>(
    '/api/v0/categories',
    {
      body: payload,
      method: 'POST',
      token,
    },
  );

  return {
    ...result.data.category,
    balance_cents: result.data.category.balance_cents ?? 0,
  };
};

export const deleteCategory = async (token: string, categoryId: number) => {
  await apiRequest<{ success: true }>(`/api/v0/categories/${categoryId}`, {
    method: 'DELETE',
    token,
  });
};
