import { useCallback } from 'react';
import { FlatList, Platform, RefreshControl } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { transactionListStyles } from '@/feature/transactions/components/TransactionList.styles';
import TransactionRow from '@/feature/transactions/components/TransactionRow';
import type {
  TransactionListItem,
  TransactionListProps,
} from '@/feature/transactions/types/transaction.types';
import { themeColors } from '@/theme/utilities';

const keyExtractor = (transaction: TransactionListItem) => String(transaction.id);

const TransactionList = ({
  contentContainerStyle,
  isRefreshing = false,
  ListEmptyComponent = null,
  ListHeaderComponent = null,
  onRefresh,
  transactions,
}: TransactionListProps) => {
  const renderItem = useCallback<ListRenderItem<TransactionListItem>>(
    ({ item }) => <TransactionRow transaction={item} />,
    [],
  );

  return (
    <FlatList
      className="flex-1 bg-gray-50"
      contentContainerStyle={[
        transactionListStyles.contentContainer,
        contentContainerStyle,
      ]}
      data={transactions}
      initialNumToRender={12}
      keyboardShouldPersistTaps="handled"
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      maxToRenderPerBatch={10}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            colors={[themeColors.primary]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={themeColors.primary}
          />
        ) : undefined
      }
      removeClippedSubviews={Platform.OS === 'android'}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      updateCellsBatchingPeriod={40}
      windowSize={7}
    />
  );
};

export default TransactionList;
