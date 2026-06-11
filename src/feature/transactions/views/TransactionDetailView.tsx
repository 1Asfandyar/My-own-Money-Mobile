import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type {
  ApiTransaction,
  ApiTransactionSplit,
  TransactionDetailViewProps,
  TransactionRenderAs,
} from '@/feature/transactions/types/transaction.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import {
  CATEGORY_COLOR_FALLBACK,
  CATEGORY_ICON_FALLBACK,
} from '@/feature/categories/constants/categoryDashboard.constants';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getSoftColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}1A` : '#F3F4F6';

const formatDate = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatAmount = (cents: number, symbol: string) => {
  const amount = cents / 100;

  return `${symbol} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const RENDER_AS_COLORS: Record<TransactionRenderAs, string> = {
  personal_expense: CATEGORY_COLOR_FALLBACK.expense,
  personal_income: CATEGORY_COLOR_FALLBACK.income,
  transfer: CATEGORY_COLOR_FALLBACK.transfer,
  shared_expense_payer: CATEGORY_COLOR_FALLBACK.income,
  shared_expense_participant: CATEGORY_COLOR_FALLBACK.expense,
  settlement_settler: CATEGORY_COLOR_FALLBACK.settlement,
  settlement_settlee: CATEGORY_COLOR_FALLBACK.settlement,
};

const RENDER_AS_ICONS: Record<TransactionRenderAs, keyof typeof Ionicons.glyphMap> = {
  personal_expense: CATEGORY_ICON_FALLBACK.expense,
  personal_income: CATEGORY_ICON_FALLBACK.income,
  transfer: CATEGORY_ICON_FALLBACK.transfer,
  shared_expense_payer: CATEGORY_ICON_FALLBACK.expense,
  shared_expense_participant: CATEGORY_ICON_FALLBACK.expense,
  settlement_settler: CATEGORY_ICON_FALLBACK.settlement,
  settlement_settlee: CATEGORY_ICON_FALLBACK.settlement,
};

const SPLIT_METHOD_LABELS: Record<string, string> = {
  equal: 'Equal',
  exact: 'Exact',
  percentage: 'Percentage',
  shares: 'Shares',
};

// ── Sub-components ────────────────────────────────────────────────────────────

const HeaderIconButton = ({
  accessibilityLabel,
  disabled = false,
  iconName,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.76}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    disabled={disabled}
    className="h-11 w-11 items-center justify-center rounded-full bg-gray-50"
    onPress={onPress}
  >
    <Ionicons
      name={iconName}
      size={22}
      color={disabled ? themeColors.gray400 : themeColors.gray900}
    />
  </TouchableOpacity>
);

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View className="mt-4 flex-row items-center">
    <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
      <Ionicons name={icon} size={17} color={themeColors.gray500} />
    </View>
    <View className="ml-3 flex-1">
      <ThemedText className="text-xs text-gray-400">{label}</ThemedText>
      <ThemedText className="mt-0.5 text-sm text-gray-900" weight="semiBold">
        {value}
      </ThemedText>
    </View>
  </View>
);

// ── Per-type body sections ────────────────────────────────────────────────────

const PersonalTransactionBody = ({ transaction }: { transaction: ApiTransaction }) => (
  <View className="mt-6">
    <View className="h-px bg-gray-100" />
    <View className="mt-4">
      <ThemedText className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Details
      </ThemedText>
      <DetailRow
        icon="wallet-outline"
        label="Account"
        value={transaction.account.name}
      />
      {transaction.category ? (
        <DetailRow
          icon="pricetag-outline"
          label="Category"
          value={transaction.category.name}
        />
      ) : null}
    </View>
  </View>
);

const TransferBody = ({ transaction }: { transaction: ApiTransaction }) => (
  <View className="mt-6">
    <View className="h-px bg-gray-100" />
    <View className="mt-4">
      <DetailRow
        icon="arrow-up-outline"
        label="From"
        value={transaction.account.name}
      />
      <DetailRow
        icon="arrow-down-outline"
        label="To"
        value={transaction.transfer_to_account?.name ?? '—'}
      />
    </View>
  </View>
);

const SplitRow = ({
  currency,
  split,
  splitMethod,
}: {
  currency: { symbol: string };
  split: ApiTransactionSplit;
  splitMethod: string | null;
}) => {
  const label = split.user.is_you ? 'You owe' : `${split.user.name} owes`;
  const amountLabel = formatAmount(split.owed_amount_cents, currency.symbol);

  let allocationLabel: string | null = null;

  if (splitMethod === 'percentage' && split.allocation_value !== null) {
    allocationLabel = `${split.allocation_value}%`;
  } else if (splitMethod === 'shares' && split.allocation_value !== null) {
    allocationLabel = `${split.allocation_value} shares`;
  }

  return (
    <View
      className={`mt-3 flex-row items-center rounded-xl px-3 py-2.5 ${
        split.user.is_you ? 'bg-primary/5' : 'bg-gray-50'
      }`}
    >
      <View className="flex-1">
        <ThemedText
          className={`text-sm ${split.user.is_you ? 'text-primary' : 'text-gray-700'}`}
          weight={split.user.is_you ? 'semiBold' : 'regular'}
        >
          {label}
        </ThemedText>
        {allocationLabel ? (
          <ThemedText className="mt-0.5 text-xs text-gray-400">
            {allocationLabel}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText
        className={`text-sm ${split.user.is_you ? 'text-primary' : 'text-gray-700'}`}
        weight="semiBold"
      >
        {amountLabel}
      </ThemedText>
    </View>
  );
};

const SharedExpenseBody = ({ transaction }: { transaction: ApiTransaction }) => {
  const { paid_by, currency, splits, split_method } = transaction;
  const paidByLabel = paid_by.is_you
    ? `You paid ${formatAmount(transaction.amount_cents, currency.symbol)}`
    : `${paid_by.name} paid ${formatAmount(transaction.amount_cents, currency.symbol)}`;

  return (
    <View className="mt-6">
      <View className="h-px bg-gray-100" />

      <View className="mt-4 flex-row items-center justify-between">
        <ThemedText className="text-sm text-gray-600">{paidByLabel}</ThemedText>
        {split_method ? (
          <View className="rounded-full bg-gray-100 px-2.5 py-1">
            <ThemedText className="text-xs text-gray-500" weight="semiBold">
              {SPLIT_METHOD_LABELS[split_method] ?? split_method}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {splits && splits.length > 0 ? (
        <View className="mt-3">
          {splits.map((split) => (
            <SplitRow
              key={split.user.id}
              currency={currency}
              split={split}
              splitMethod={split_method}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const SettlementBody = ({ transaction }: { transaction: ApiTransaction }) => {
  const { render_as, paid_by, counterpart, account } = transaction;

  const subheaderText =
    render_as === 'settlement_settler'
      ? `You paid ${counterpart?.name ?? 'someone'} back`
      : `${paid_by.name} paid you back`;

  return (
    <View className="mt-6">
      <View className="h-px bg-gray-100" />

      <ThemedText className="mt-4 text-base text-gray-700" weight="semiBold">
        {subheaderText}
      </ThemedText>

      <View className="mt-2">
        <DetailRow
          icon="wallet-outline"
          label="Account"
          value={account.name}
        />
        {counterpart ? (
          <DetailRow
            icon="person-outline"
            label="With"
            value={counterpart.name}
          />
        ) : null}
      </View>
    </View>
  );
};

const TransactionDetailBody = ({ transaction }: { transaction: ApiTransaction }) => {
  switch (transaction.render_as) {
    case 'personal_expense':
    case 'personal_income':
      return <PersonalTransactionBody transaction={transaction} />;

    case 'transfer':
      return <TransferBody transaction={transaction} />;

    case 'shared_expense_payer':
    case 'shared_expense_participant':
      return <SharedExpenseBody transaction={transaction} />;

    case 'settlement_settler':
    case 'settlement_settlee':
      return <SettlementBody transaction={transaction} />;

    default:
      return null;
  }
};

// ── Main view ─────────────────────────────────────────────────────────────────

const TransactionDetailView = ({ detail }: TransactionDetailViewProps) => {
  if (detail.isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-white"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <ActivityIndicator color={themeColors.primary} />
        <ThemedText className="mt-3 text-sm text-gray-500">
          Loading transaction...
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (detail.error && !detail.transaction) {
    return (
      <SafeAreaView
        className="flex-1 bg-white px-5 pt-5"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <HeaderIconButton
          accessibilityLabel="Go back"
          iconName="chevron-back"
          onPress={detail.onBack}
        />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={30} color={themeColors.gray400} />
          <ThemedText className="mt-3 text-center text-sm text-gray-500">
            {detail.error}
          </ThemedText>
          <ThemedButton
            title="Try again"
            onPress={detail.onRetry}
            containerClassName="mt-5 px-5 py-3"
          />
        </View>
      </SafeAreaView>
    );
  }

  const { transaction } = detail;

  if (!transaction) return null;

  const color = RENDER_AS_COLORS[transaction.render_as];
  const softColor = getSoftColor(color);
  const iconName = RENDER_AS_ICONS[transaction.render_as];
  const totalLabel = formatAmount(transaction.amount_cents, transaction.currency.symbol);
  const dateLabel = formatDate(transaction.date);

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <HeaderIconButton
            accessibilityLabel="Go back"
            iconName="chevron-back"
            onPress={detail.onBack}
          />
          <ThemedText className="text-xl text-gray-900" weight="semiBold">
            Details
          </ThemedText>
          <View className="flex-row items-center gap-2">
            {detail.canEdit ? (
              <HeaderIconButton
                accessibilityLabel="Edit transaction"
                iconName="create-outline"
                onPress={detail.onEdit}
              />
            ) : null}
            {detail.canDelete ? (
              <HeaderIconButton
                accessibilityLabel="Delete transaction"
                disabled={detail.isDeleting}
                iconName="trash-outline"
                onPress={detail.onDelete}
              />
            ) : null}
            {!detail.canEdit && !detail.canDelete ? (
              <View className="w-11" />
            ) : null}
          </View>
        </View>

        {/* Hero */}
        <View className="mt-7 flex-row items-start">
          <View
            className="h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: softColor }}
          >
            <Ionicons name={iconName} size={27} color={color} />
          </View>

          <View className="ml-4 min-w-0 flex-1">
            <ThemedText
              className="text-xl text-gray-900"
              numberOfLines={2}
              weight="semiBold"
            >
              {transaction.title}
            </ThemedText>
            <ThemedText
              adjustsFontSizeToFit
              className="mt-2 text-4xl text-gray-900"
              numberOfLines={1}
              weight="bold"
            >
              {totalLabel}
            </ThemedText>
            <ThemedText className="mt-2 text-sm text-gray-500">
              {dateLabel}
            </ThemedText>
            {transaction.note ? (
              <ThemedText className="mt-2 text-sm leading-5 text-gray-500">
                {transaction.note}
              </ThemedText>
            ) : null}
          </View>
        </View>

        {/* Type-specific body */}
        <TransactionDetailBody transaction={transaction} />

        {detail.error ? (
          <ThemedText className="mt-6 text-center text-xs text-red-500">
            {detail.error}
          </ThemedText>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetailView;
