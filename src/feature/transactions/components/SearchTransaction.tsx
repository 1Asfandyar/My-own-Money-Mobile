import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

import TransactionDateFilterModal from '@/feature/transactions/components/TransactionDateFilterModal';
import type { SearchTransactionProps } from '@/feature/transactions/types/searchTransaction.types';
import { fontFamilies } from '@/theme/fonts';
import { themeColors, typography } from '@/theme/utilities';

const SearchTransaction = ({
  accounts,
  categories,
  filters,
  hasActiveDateFilter,
  onApplyFilters,
  onClearFilters,
  onClearSearch,
  onSearchQueryChange,
  searchQuery,
}: SearchTransactionProps) => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const hasSearchTerm = searchQuery.trim().length > 0;

  return (
    <>
      <View className="mt-3 flex-row items-center rounded-xl border border-gray-200 bg-white px-3 py-3">
        <Ionicons name="search" size={18} color={themeColors.gray500} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder="Search transactions"
          placeholderTextColor={themeColors.gray400}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          className={`${typography.primaryControlSize} ml-2 min-w-0 flex-1 text-gray-800`}
          style={{ fontFamily: fontFamilies.regular }}
        />
        {hasSearchTerm ? (
          <TouchableOpacity
            activeOpacity={0.75}
            accessibilityLabel="Clear transaction search"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClearSearch}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={themeColors.gray500}
            />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.75}
          accessibilityLabel="Filter transactions"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setIsFilterVisible(true)}
          className={`relative ml-2 h-9 w-9 items-center justify-center rounded-full ${
            hasActiveDateFilter ? 'bg-primary/10' : 'bg-gray-100'
          }`}
        >
          <Ionicons
            name="filter-outline"
            size={19}
            color={
              hasActiveDateFilter ? themeColors.primary : themeColors.gray700
            }
          />
          {hasActiveDateFilter ? (
            <View className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          ) : null}
        </TouchableOpacity>
      </View>

      <TransactionDateFilterModal
        accounts={accounts}
        categories={categories}
        filters={filters}
        isVisible={isFilterVisible}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        onClose={() => setIsFilterVisible(false)}
      />
    </>
  );
};

export default SearchTransaction;
