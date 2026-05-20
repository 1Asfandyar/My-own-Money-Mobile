import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ThemedText from '@/theme/components/ThemedText';
import { fontFamilies } from '@/theme/fonts';
import { themeColors, typography } from '@/theme/utilities';
import type { Currency } from '@/types/currency.types';

type IconName = ComponentProps<typeof Ionicons>['name'];

type CurrencyPreferenceModalProps = {
  currencies: Currency[];
  isLoading: boolean;
  isVisible: boolean;
  onClose: () => void;
  onSelect: (currencyId: number) => void;
  selectedCurrencyId: number;
};

type CurrencyOptionRowProps = {
  currency: Currency;
  isSelected: boolean;
  onSelect: (currencyId: number) => void;
};

const currencyIconsByCode: Record<string, IconName> = {
  EUR: 'business-outline',
  GBP: 'wallet-outline',
  PKR: 'cash-outline',
  USD: 'card-outline',
};

const getCurrencyIcon = (currencyCode: string): IconName =>
  currencyIconsByCode[currencyCode] ?? 'cash-outline';

const keyExtractor = (currency: Currency) => String(currency.id);

const CurrencyOptionRow = ({
  currency,
  isSelected,
  onSelect,
}: CurrencyOptionRowProps) => (
  <TouchableOpacity
    activeOpacity={0.78}
    accessibilityRole="button"
    onPress={() => onSelect(currency.id)}
    className={`mb-2 flex-row items-center rounded-2xl border px-4 py-4 ${
      isSelected ? 'border-primary bg-primary/10' : 'border-gray-100 bg-white'
    }`}
  >
    <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-100">
      <Ionicons
        name={getCurrencyIcon(currency.code)}
        size={20}
        color={themeColors.primary}
      />
    </View>

    <View className="ml-3 min-w-0 flex-1">
      <ThemedText className="text-base text-gray-900" numberOfLines={1} weight="semiBold">
        {currency.code}
      </ThemedText>
      <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
        {currency.name} - {currency.symbol}
      </ThemedText>
    </View>

    {isSelected ? (
      <Ionicons name="checkmark-circle" size={22} color={themeColors.primary} />
    ) : null}
  </TouchableOpacity>
);

const CurrencyPreferenceModal = ({
  currencies,
  isLoading,
  isVisible,
  onClose,
  onSelect,
  selectedCurrencyId,
}: CurrencyPreferenceModalProps) => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCurrencies = useMemo(
    () =>
      normalizedQuery.length === 0
        ? currencies
        : currencies.filter((currency) => {
            const label = `${currency.code} ${currency.name} ${currency.symbol}`;

            return label.toLowerCase().includes(normalizedQuery);
          }),
    [currencies, normalizedQuery],
  );

  const closeModal = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  const selectCurrency = useCallback(
    (currencyId: number) => {
      setQuery('');
      onSelect(currencyId);
    },
    [onSelect],
  );

  const renderItem = useCallback<ListRenderItem<Currency>>(
    ({ item }) => (
      <CurrencyOptionRow
        currency={item}
        isSelected={item.id === selectedCurrencyId}
        onSelect={selectCurrency}
      />
    ),
    [selectCurrency, selectedCurrencyId],
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={closeModal}
    >
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity
          activeOpacity={1}
          accessibilityLabel="Close currency picker"
          accessibilityRole="button"
          className="flex-1"
          onPress={closeModal}
        />

        <SafeAreaView
          edges={['bottom']}
          className="rounded-t-[28px] bg-white"
          style={{ height: '72%' }}
        >
          <View className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText className="text-xl text-gray-900" weight="bold">
                Default currency
              </ThemedText>

              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityLabel="Close currency picker"
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                onPress={closeModal}
              >
                <Ionicons name="close" size={22} color={themeColors.gray700} />
              </TouchableOpacity>
            </View>

            <View className="mb-3 flex-row items-center rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
              <Ionicons name="search" size={18} color={themeColors.gray500} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Search currencies"
                placeholderTextColor={themeColors.gray400}
                className={`${typography.primaryControlSize} ml-2 flex-1 text-gray-800`}
                style={{ fontFamily: fontFamilies.regular }}
              />
            </View>
          </View>

          <FlatList
            data={filteredCurrencies}
            initialNumToRender={10}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="items-center px-3 py-8">
                <ThemedText className="text-sm text-gray-500">
                  {isLoading ? 'Loading currencies' : 'No currencies found'}
                </ThemedText>
              </View>
            }
            maxToRenderPerBatch={10}
            renderItem={renderItem}
            showsVerticalScrollIndicator={filteredCurrencies.length > 6}
            contentContainerStyle={{
              paddingBottom: 24,
              paddingHorizontal: 20,
            }}
            windowSize={6}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default CurrencyPreferenceModal;
