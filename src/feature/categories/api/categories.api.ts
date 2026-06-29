import { apiRequest } from '@/services/api';
import type { TransactionCategoryBreakdown } from '@/feature/categories/types/categoryDashboard.types';
import type {
  Category,
  CreateCategoryPayload,
} from '@/feature/categories/types/category.types';

export const listCategories = async (
  token: string,
  { includeZeroBalance = false }: { includeZeroBalance?: boolean } = {},
) => {
  const params = includeZeroBalance
    ? '?include_zero_balance=true'
    : '';
  const result = await apiRequest<{ success: true; categories: Category[] }>(
    `/api/v0/categories${params}`,
    { token },
  );

  return (result.data.categories ?? []).map((category) => ({
    ...category,
    balance_cents: category.balance_cents ?? 0,
  }));
};

export const getCategoriesSummary = async (token: string) => {
  const result = await apiRequest<{ success: boolean; categories: Category[] }>(
    '/api/v0/categories',
    { token },
  );

  const rawCategories = result.data.categories ?? [];
  const total_absolute_amount_cents = rawCategories.reduce(
    (total, item) => total + Math.abs(item.balance_cents),
    0,
  );

  const categories: TransactionCategoryBreakdown[] = rawCategories.map((cat) => ({
    category: {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      balance_cents: cat.balance_cents,
      category_type: cat.category_type,
    },
    amount_cents: cat.balance_cents,
    percentage:
      total_absolute_amount_cents > 0
        ? (Math.abs(cat.balance_cents) / total_absolute_amount_cents) * 100
        : 0,
    transactions: [],
  }));

  return {
    total_amount_cents: rawCategories.reduce(
      (total, item) => total + item.balance_cents,
      0,
    ),
    total_absolute_amount_cents,
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
