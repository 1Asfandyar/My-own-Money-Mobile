import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type {
    ApiTransaction,
    ApiTransactionSplit,
    TransactionDetailViewProps,
} from '@/feature/transactions/types/transaction.types';
import {
    formatAmountBySymbol as formatAmount,
    formatTransactionDate as formatDate,
    getSoftColor,
    RENDER_AS_COLORS,
    RENDER_AS_ICONS,
} from '@/feature/transactions/utils/transactionListItem.utils';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

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

const TransactionActions = ({
  canDelete,
  canEdit,
  deleteFirst,
  isDeleting,
  onDelete,
  onEdit,
}: {
  canDelete: boolean;
  canEdit: boolean;
  deleteFirst: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) => {
  const deleteButton = canDelete ? (
    <HeaderIconButton
      accessibilityLabel="Delete transaction"
      disabled={isDeleting}
      iconName="trash-outline"
      onPress={onDelete}
    />
  ) : null;
  const editButton = canEdit ? (
    <HeaderIconButton
      accessibilityLabel="Edit transaction"
      iconName="create-outline"
      onPress={onEdit}
    />
  ) : null;

  if (!canEdit && !canDelete) {
    return <View className="w-11" />;
  }

  return (
    <View className="flex-row items-center gap-2">
      {deleteFirst ? deleteButton : editButton}
      {deleteFirst ? editButton : deleteButton}
    </View>
  );
};

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

const SharedExpenseSplitRow = ({
  currencySymbol,
  payerId,
  split,
}: {
  currencySymbol: string;
  payerId: number;
  split: ApiTransactionSplit;
}) => {
  const label = split.user.is_you ? 'You owe' : `${split.user.name} owes`;
  const amountLabel = formatAmount(split.owed_amount_cents, currencySymbol);

  return (
    <View className="mt-4 flex-row items-center">
      <SharedExpenseAvatar
        size={36}
        user={{
          full_name: split.user.is_you ? 'You' : split.user.name,
          id: split.user.id,
        }}
      />
      <View className="ml-3 min-w-0 flex-1">
        <ThemedText className="text-sm text-gray-700" numberOfLines={1}>
          {label} {amountLabel}
        </ThemedText>
        {split.user.id === payerId ? (
          <ThemedText className="mt-0.5 text-xs text-primary">
            Paid this expense
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
};

const SharedExpenseBody = ({ transaction }: { transaction: ApiTransaction }) => {
  const { paid_by, splits } = transaction;
  const currencySymbol = transaction.currency_symbol ?? '$';
  const paidByLabel = paid_by.is_you
    ? `You paid ${formatAmount(transaction.amount_cents, currencySymbol)}`
    : `${paid_by.name} paid ${formatAmount(transaction.amount_cents, currencySymbol)}`;

  return (
    <View className="mt-6">
      <View className="h-px bg-gray-100" />

      <View className="mt-7 flex-row items-center">
        <SharedExpenseAvatar
          size={50}
          user={{
            full_name: paid_by.is_you ? 'You' : paid_by.name,
            id: paid_by.id,
          }}
        />
        <ThemedText className="ml-3 flex-1 text-base text-gray-900">
          {paidByLabel}
        </ThemedText>
      </View>

      {splits && splits.length > 0 ? (
        <View className="ml-6 mt-2 border-l border-gray-200 pl-6">
          {splits.map((split) => (
            <SharedExpenseSplitRow
              key={split.user.id}
              currencySymbol={currencySymbol}
              payerId={paid_by.id}
              split={split}
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
      ? `You paid ${counterpart?.name ?? 'someone'}`
      : `${paid_by.name} paid you`;

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
  const totalLabel = formatAmount(
    transaction.amount_cents,
    transaction.currency_symbol ?? '$',
  );
  const dateLabel = formatDate(transaction.date);
  const isSharedExpense =
    transaction.render_as === 'shared_expense_payer' ||
    transaction.render_as === 'shared_expense_participant';
  const heroDateLabel = isSharedExpense
    ? `Added by ${
        transaction.paid_by.is_you ? 'you' : transaction.paid_by.name
      } on ${dateLabel}`
    : dateLabel;

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
          <TransactionActions
            canDelete={detail.canDelete}
            canEdit={detail.canEdit}
            deleteFirst={isSharedExpense}
            isDeleting={detail.isDeleting}
            onDelete={detail.onDelete}
            onEdit={detail.onEdit}
          />
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
              {heroDateLabel}
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
