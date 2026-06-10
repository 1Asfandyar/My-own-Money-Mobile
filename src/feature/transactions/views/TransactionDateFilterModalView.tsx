import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import SelectField from '@/components/SelectField';
import SelectSheetModal from '@/components/SelectSheetModal';
import {
  TRANSACTION_DATE_FILTER_FIELD_LABELS,
  TRANSACTION_DATE_FILTER_WEEKDAY_LABELS,
} from '@/feature/transactions/constants/transactionDateFilter.constants';
import type {
  TransactionDateFilterField,
  TransactionDateFilterModalViewProps,
} from '@/feature/transactions/types/transactionDateFilter.types';
import { formatDateFilterValue } from '@/feature/transactions/utils/transactionDateFilter.utils';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const TransactionDateFilterModalView = ({
  accounts,
  activeField,
  calendarDays,
  categories,
  draftFilters,
  isVisible,
  monthLabel,
  onApply,
  onChangeMonth,
  onClear,
  onClose,
  onSelectAccount,
  onSelectCategory,
  onSelectDate,
  onSelectField,
}: TransactionDateFilterModalViewProps) => {
  const [isAccountSheetVisible, setIsAccountSheetVisible] = useState(false);
  const [isCategorySheetVisible, setIsCategorySheetVisible] = useState(false);

  const accountOptions = accounts.map((a) => ({ label: a.name, value: a.id }));
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  const renderDateField = (field: TransactionDateFilterField) => {
    const isActive = activeField === field;
    const hasValue = Boolean(draftFilters[field]);

    return (
      <TouchableOpacity
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`${TRANSACTION_DATE_FILTER_FIELD_LABELS[field]} transaction date`}
        onPress={() => onSelectField(field)}
        className={`flex-1 rounded-2xl border px-4 py-3 ${
          isActive ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
        }`}
      >
        <ThemedText
          className={`text-xs uppercase ${isActive ? 'text-primary' : 'text-gray-500'}`}
          weight="bold"
        >
          {TRANSACTION_DATE_FILTER_FIELD_LABELS[field]}
        </ThemedText>
        <ThemedText
          className={`mt-1 text-sm ${hasValue ? 'text-gray-900' : 'text-gray-400'}`}
          numberOfLines={1}
          weight="semiBold"
        >
          {formatDateFilterValue(draftFilters[field])}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Modal
        animationType="slide"
        onRequestClose={onClose}
        transparent
        visible={isVisible}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close transaction filters"
            onPress={onClose}
            style={styles.backdrop}
          />

          <View
            className="rounded-t-3xl border border-gray-200 bg-white px-5 pb-6 pt-4"
            style={styles.sheet}
          >
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-gray-200" />

            <View className="flex-row items-start justify-between">
              <ThemedText className="text-xl text-gray-900" weight="bold">
                Filters
              </ThemedText>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close filters"
                onPress={onClose}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={22} color={themeColors.gray700} />
              </Pressable>
            </View>

            <View className="mt-5 flex-row">
              <SelectField
                label="Account"
                options={accountOptions}
                value={draftFilters.accountId}
                onPress={() => setIsAccountSheetVisible(true)}
                placeholder="All accounts"
              />
              <View className="w-3" />
              <SelectField
                label="Category"
                options={categoryOptions}
                value={draftFilters.categoryId}
                onPress={() => setIsCategorySheetVisible(true)}
                placeholder="All categories"
              />
            </View>

            <View className="mt-3 flex-row">
              {renderDateField('fromDate')}
              <View className="w-3" />
              {renderDateField('toDate')}
            </View>

            <View className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <View className="mb-3 flex-row items-center justify-between">
                <TouchableOpacity
                  activeOpacity={0.76}
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                  onPress={() => onChangeMonth(-1)}
                  className="h-9 w-9 items-center justify-center rounded-full bg-white"
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={themeColors.gray700}
                  />
                </TouchableOpacity>

                <ThemedText className="text-base text-gray-900" weight="semiBold">
                  {monthLabel}
                </ThemedText>

                <TouchableOpacity
                  activeOpacity={0.76}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                  onPress={() => onChangeMonth(1)}
                  className="h-9 w-9 items-center justify-center rounded-full bg-white"
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={themeColors.gray700}
                  />
                </TouchableOpacity>
              </View>

              <View className="mb-1 flex-row">
                {TRANSACTION_DATE_FILTER_WEEKDAY_LABELS.map((label, index) => (
                  <View key={`${label}-${index}`} style={styles.weekdayCell}>
                    <ThemedText
                      className="text-center text-xs text-gray-400"
                      weight="semiBold"
                    >
                      {label}
                    </ThemedText>
                  </View>
                ))}
              </View>

              <View className="flex-row flex-wrap">
                {calendarDays.map((day) => {
                  const isSelected =
                    day.value === draftFilters.fromDate ||
                    day.value === draftFilters.toDate;
                  const isInRange = Boolean(
                    draftFilters.fromDate &&
                      draftFilters.toDate &&
                      day.value > draftFilters.fromDate &&
                      day.value < draftFilters.toDate,
                  );

                  return (
                    <View key={day.value} style={styles.dayCell}>
                      <TouchableOpacity
                        activeOpacity={0.78}
                        accessibilityRole="button"
                        accessibilityLabel={day.value}
                        disabled={!day.isInMonth}
                        onPress={() => onSelectDate(day.value)}
                        className={`h-full w-full items-center justify-center rounded-full ${
                          isSelected
                            ? 'bg-primary'
                            : isInRange
                              ? 'bg-primary/10'
                              : day.isToday
                                ? 'border border-primary/40 bg-white'
                                : 'bg-transparent'
                        } ${day.isInMonth ? '' : 'opacity-0'}`}
                      >
                        <ThemedText
                          className={`text-sm ${
                            isSelected
                              ? 'text-white'
                              : day.isInMonth
                                ? 'text-gray-800'
                                : 'text-gray-300'
                          }`}
                          weight={
                            isSelected || day.isToday ? 'semiBold' : 'regular'
                          }
                        >
                          {day.dayLabel}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="mt-5 flex-row">
              <ThemedButton
                title="Reset"
                variant="outline"
                onPress={onClear}
                containerClassName="mr-3 flex-1"
              />
              <ThemedButton
                title="Apply"
                leftIcon="checkmark-circle-outline"
                onPress={onApply}
                containerClassName="flex-1"
                iconSize={16}
              />
            </View>
          </View>
        </View>
      </Modal>

      <SelectSheetModal
        isVisible={isAccountSheetVisible}
        label="Select account"
        allLabel="All accounts"
        options={accountOptions}
        value={draftFilters.accountId}
        onClose={() => setIsAccountSheetVisible(false)}
        onSelect={onSelectAccount}
        searchable={accountOptions.length > 5}
      />

      <SelectSheetModal
        isVisible={isCategorySheetVisible}
        label="Select category"
        allLabel="All categories"
        options={categoryOptions}
        value={draftFilters.categoryId}
        onClose={() => setIsCategorySheetVisible(false)}
        onSelect={onSelectCategory}
        searchable={categoryOptions.length > 5}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
  },
  dayCell: {
    aspectRatio: 1,
    padding: 2,
    width: `${100 / 7}%`,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
  },
  weekdayCell: {
    width: `${100 / 7}%`,
  },
});

export default TransactionDateFilterModalView;
