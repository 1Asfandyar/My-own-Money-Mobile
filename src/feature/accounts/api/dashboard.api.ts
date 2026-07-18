import type { Category } from '@/feature/categories/types/category.types';
import type {
    TransactionCategoryBreakdown,
    TransactionsByCategoryDashboard,
} from '@/feature/categories/types/categoryDashboard.types';
import type {
    FriendshipBalance,
    FriendshipLedger,
    FriendshipUser,
} from '@/feature/friendships/types/friendship.types';
import { apiRequest } from '@/services/api';
import type { Account } from '@/types/account.types';

type DashboardSummary = {
  total_income: number;
  total_expense: number;
  total_owed_to_you_cents: number;
  total_you_owe_cents: number;
};

type DashboardFriendship = {
  id: number;
  status: 'pending' | 'accepted' | 'blocked';
  requested_by_id: number;
  friend: FriendshipUser;
  balance?: FriendshipBalance;
  created_at: string;
  updated_at: string;
};

type DashboardResponse = {
  success: boolean;
  summary: DashboardSummary;
  accounts: Account[];
  categories: Category[];
  friendships: DashboardFriendship[];
};

type DashboardData = {
  accounts: Account[];
  categoryDashboard: TransactionsByCategoryDashboard;
  friendshipLedgers: FriendshipLedger[];
  summary: DashboardSummary;
};

const mapCategoriesToDashboard = (
  categories: Category[],
): TransactionsByCategoryDashboard => {
  const total_absolute_amount_cents = categories.reduce(
    (total, item) => total + Math.abs(item.balance_cents),
    0,
  );

  const items: TransactionCategoryBreakdown[] = categories.map((category) => ({
    category: {
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      balance_cents: category.balance_cents,
      category_type: category.category_type,
    },
    amount_cents: category.balance_cents,
    percentage:
      total_absolute_amount_cents > 0
        ? (Math.abs(category.balance_cents) / total_absolute_amount_cents) * 100
        : 0,
    transactions: [],
  }));

  return {
    categories: items,
    total_absolute_amount_cents,
    total_amount_cents: categories.reduce(
      (total, item) => total + item.balance_cents,
      0,
    ),
  };
};

const mapFriendshipsToLedgers = (
  friendships: DashboardFriendship[],
): FriendshipLedger[] =>
  friendships.map((friendship) => ({
    ...friendship,
    balance_summary: friendship.balance ?? { amount_cents: 0, type: 'settled_up' },
  }));

export const getDashboardData = async (token: string): Promise<DashboardData> => {
  const result = await apiRequest<DashboardResponse>('/api/v0/dashboard', {
    token,
  });

  const data = result.data;

  return {
    accounts: data.accounts ?? [],
    categoryDashboard: mapCategoriesToDashboard(data.categories ?? []),
    friendshipLedgers: mapFriendshipsToLedgers(data.friendships ?? []),
    summary: data.summary,
  };
};
