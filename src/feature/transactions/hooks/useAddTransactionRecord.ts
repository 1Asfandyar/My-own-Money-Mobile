import { useLocalSearchParams } from 'expo-router';
import { useFormik } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  addTransactionRecordContent,
  addTransactionRecordInitialValues,
} from '@/feature/transactions/constants/addTransactionRecord.constants';
import { sharedExpenseSplitMethodLabels } from '@/feature/transactions/constants/sharedExpenseSplit.constants';
import type { Group } from '@/feature/groups/types/group.types';
import { getGroupUsers } from '@/feature/groups/utils/groupMembers.utils';
import { useAddTransactionRecordStore } from '@/feature/transactions/store/addTransactionRecord.store';
import useAddTransactionRecordOptions from '@/feature/transactions/hooks/useAddTransactionRecordOptions';
import useSaveAddTransactionRecord from '@/feature/transactions/hooks/useSaveAddTransactionRecord';
import useSharedExpenseFriends from '@/feature/transactions/hooks/useSharedExpenseFriends';
import useSharedExpenseParticipants from '@/feature/transactions/hooks/useSharedExpenseParticipants';
import type {
  AddTransactionRecordFormValues,
  AddTransactionRecordKind,
  AddTransactionRecordTextField,
  AddTransactionRecordViewModel,
} from '@/feature/transactions/types/addTransactionRecord.types';
import type { SharedExpenseSplitMethod } from '@/feature/transactions/types/sharedExpenseSplit.types';
import type { TransactionType } from '@/feature/transactions/types/transaction.types';
import {
  getAddTransactionAccountOptions,
  getAddTransactionAmountCents,
  getAddTransactionCategoryOptions,
  getLiveSplitValuesError,
  getValidatedAddTransactionRecordFieldErrors,
  validateAddTransactionRecord,
} from '@/feature/transactions/utils/addTransactionRecord.utils';
import {
  areSplitValueMapsEqual,
  getDefaultSharedExpenseSplitValues,
  reconcileSharedExpenseSplitValues,
  sanitizeSharedExpenseSplitInput,
} from '@/feature/transactions/utils/sharedExpenseSplit.utils';
import { useAuthStore } from '@/store/auth.store';

const useAddTransactionRecord = (
  recordKind: AddTransactionRecordKind,
  onSaved: () => void,
): Omit<AddTransactionRecordViewModel, 'cancel'> => {
  const params = useLocalSearchParams<{ accountId?: string }>();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const accountDropdownQuery = useAddTransactionRecordStore(
    (state) => state.accountDropdownQuery,
  );
  const accounts = useAddTransactionRecordStore((state) => state.accounts);
  const categories = useAddTransactionRecordStore((state) => state.categories);
  const categoryPickerQuery = useAddTransactionRecordStore(
    (state) => state.categoryPickerQuery,
  );
  const closeCategoryPicker = useAddTransactionRecordStore(
    (state) => state.closeCategoryPicker,
  );
  const closeDropdown = useAddTransactionRecordStore(
    (state) => state.closeDropdown,
  );
  const formError = useAddTransactionRecordStore((state) => state.formError);
  const isCategoryPickerVisible = useAddTransactionRecordStore(
    (state) => state.isCategoryPickerVisible,
  );
  const isLoadingOptions = useAddTransactionRecordStore(
    (state) => state.isLoadingOptions,
  );
  const openAccountDropdown = useAddTransactionRecordStore(
    (state) => state.openAccountDropdown,
  );
  const openCategoryPicker = useAddTransactionRecordStore(
    (state) => state.openCategoryPicker,
  );
  const openDropdown = useAddTransactionRecordStore(
    (state) => state.openDropdown,
  );
  const resetAddTransactionRecord = useAddTransactionRecordStore(
    (state) => state.resetAddTransactionRecord,
  );
  const setAccountDropdownQuery = useAddTransactionRecordStore(
    (state) => state.setAccountDropdownQuery,
  );
  const setAccounts = useAddTransactionRecordStore((state) => state.setAccounts);
  const setCategories = useAddTransactionRecordStore(
    (state) => state.setCategories,
  );
  const setCategoryPickerQuery = useAddTransactionRecordStore(
    (state) => state.setCategoryPickerQuery,
  );
  const setFormError = useAddTransactionRecordStore(
    (state) => state.setFormError,
  );
  const setIsLoadingOptions = useAddTransactionRecordStore(
    (state) => state.setIsLoadingOptions,
  );
  const content = addTransactionRecordContent[recordKind];
  const isSharedRecord = recordKind === 'shared';
  const [friendPickerQuery, setFriendPickerQuery] = useState('');
  const [isSplitSheetVisible, setIsSplitSheetVisible] = useState(false);
  const [splitValuesError, setSplitValuesError] = useState('');

  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.is_archived),
    [accounts],
  );
  const { isSavingRecord, saveRecord } = useSaveAddTransactionRecord({
    activeAccounts,
    categories,
    isSharedRecord,
    onSaved,
    setFormError,
    setSplitValuesError,
    token,
    user,
  });

  const formik = useFormik<AddTransactionRecordFormValues>({
    initialValues: addTransactionRecordInitialValues,
    validate: validateAddTransactionRecord(recordKind),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: saveRecord,
  });

  const {
    errors,
    handleSubmit,
    isSubmitting,
    setFieldError,
    setFieldTouched,
    setFieldValue,
    setValues,
    validateField: runFieldValidation,
    values,
  } = formik;
  const fieldErrors = useMemo(
    () => ({
      ...getValidatedAddTransactionRecordFieldErrors(errors),
      splitValues: splitValuesError || undefined,
    }),
    [errors, splitValuesError],
  );
  const setFormFieldValue = useCallback(
    <Field extends keyof AddTransactionRecordFormValues>(
      field: Field,
      value: AddTransactionRecordFormValues[Field],
      shouldValidate = false,
    ) => {
      void setFieldValue(field, value, shouldValidate).catch(() => undefined);
    },
    [setFieldValue],
  );

  const updateSharedUserIds = useCallback(
    (userIds: number[]) => {
      setFormFieldValue('sharedUserIds', userIds);
      setFieldError('sharedUserIds', undefined);
      setFormError('');
      setSplitValuesError('');
    },
    [setFieldError, setFormError, setFormFieldValue],
  );

  const sharedFriends = useSharedExpenseFriends({
    currentUserId: user?.id,
    onSelectionChange: updateSharedUserIds,
    selectedUserIds: values.sharedUserIds,
    token,
  });
  const { loadFriendsGroup, toggleSharedUser: toggleSharedFriendUser } =
    sharedFriends;
  const { sharedGroups } = useAddTransactionRecordOptions({
    loadFriendsGroup,
    recordKind,
    resetAddTransactionRecord,
    setAccounts,
    setCategories,
    setFormError,
    setIsLoadingOptions,
    token,
  });
  const { selectedSharedFriends, splitParticipantIds, splitParticipants } =
    useSharedExpenseParticipants({
      friends: sharedFriends.friends,
      groups: sharedGroups,
      selectedUserIds: values.sharedUserIds,
      user,
    });

  useEffect(() => {
    if (!values.accountId && activeAccounts.length > 0) {
      const routeAccount = activeAccounts.find(
        (account) => account.id === Number(params.accountId),
      );

      setFormFieldValue(
        'accountId',
        String(routeAccount?.id ?? activeAccounts[0].id),
      );
    }
  }, [activeAccounts, params.accountId, setFormFieldValue, values.accountId]);

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.category_type === values.transactionType,
      ),
    [categories, values.transactionType],
  );

  useEffect(() => {
    if (
      values.categoryId &&
      !filteredCategories.some(
        (category) => category.id === Number(values.categoryId),
      )
    ) {
      setFormFieldValue('categoryId', '');
    }
  }, [filteredCategories, setFormFieldValue, values.categoryId]);

  const accountOptions = useMemo(
    () => getAddTransactionAccountOptions(activeAccounts),
    [activeAccounts],
  );

  const categoryOptions = useMemo(
    () => getAddTransactionCategoryOptions(filteredCategories),
    [filteredCategories],
  );

  const selectedAccountId = values.accountId ? Number(values.accountId) : null;
  const selectedAccount = useMemo(
    () => activeAccounts.find((account) => account.id === selectedAccountId),
    [activeAccounts, selectedAccountId],
  );
  const selectedAccountCurrencyId =
    selectedAccount?.currency_id ?? user?.currency_id ?? 1;
  const selectedCategoryId = values.categoryId ? Number(values.categoryId) : null;
  const selectedCategory = useMemo(
    () =>
      categoryOptions.find((category) => category.id === selectedCategoryId),
    [categoryOptions, selectedCategoryId],
  );
  const totalAmountCents = getAddTransactionAmountCents(values.amount);
  const splitMethodLabel = sharedExpenseSplitMethodLabels[values.splitMethod];

  useEffect(() => {
    if (!isSharedRecord || values.splitMethod === 'equal') {
      return;
    }

    const nextSplitValues = reconcileSharedExpenseSplitValues(
      values.splitValues,
      values.splitMethod,
      splitParticipantIds,
      totalAmountCents,
    );

    if (!areSplitValueMapsEqual(nextSplitValues, values.splitValues)) {
      setFormFieldValue('splitValues', nextSplitValues);
    }
  }, [
    isSharedRecord,
    setFormFieldValue,
    splitParticipantIds,
    totalAmountCents,
    values.splitMethod,
    values.splitValues,
  ]);

  useEffect(() => {
    setSplitValuesError(
      getLiveSplitValuesError({
        isSharedRecord,
        participantIds: splitParticipantIds,
        splitMethod: values.splitMethod,
        splitValues: values.splitValues,
        totalAmountCents,
      }),
    );
  }, [
    isSharedRecord,
    splitParticipantIds,
    totalAmountCents,
    values.splitMethod,
    values.splitValues,
  ]);

  const updateField = useCallback(
    (field: AddTransactionRecordTextField, value: string) => {
      setFormFieldValue(field, value);
      setFieldError(field, undefined);
      setFormError('');
      if (field === 'amount') {
        setSplitValuesError('');
      }
    },
    [setFieldError, setFormError, setFormFieldValue],
  );

  const selectAccount = useCallback(
    (accountId: number) => {
      updateField('accountId', String(accountId));
    },
    [updateField],
  );

  const selectCategory = useCallback(
    (categoryId: number) => {
      updateField('categoryId', String(categoryId));
    },
    [updateField],
  );

  const updateSplitMethod = useCallback(
    (splitMethod: SharedExpenseSplitMethod) => {
      void setValues(
        (currentValues) => ({
          ...currentValues,
          splitMethod,
          splitValues: getDefaultSharedExpenseSplitValues(
            splitMethod,
            splitParticipantIds,
            totalAmountCents,
          ),
        }),
        false,
      ).catch(() => undefined);
      setSplitValuesError('');
      setFormError('');
    },
    [setFormError, setValues, splitParticipantIds, totalAmountCents],
  );

  const updateSplitValue = useCallback(
    (userId: number, value: string) => {
      const nextValue = sanitizeSharedExpenseSplitInput(
        values.splitMethod,
        value,
      );
      const nextSplitValues = {
        ...values.splitValues,
        [String(userId)]: nextValue,
      };

      setFormFieldValue('splitValues', nextSplitValues);
      setSplitValuesError(
        getLiveSplitValuesError({
          isSharedRecord,
          participantIds: splitParticipantIds,
          splitMethod: values.splitMethod,
          splitValues: nextSplitValues,
          totalAmountCents,
        }),
      );
      setFormError('');
    },
    [
      isSharedRecord,
      setFormError,
      setFormFieldValue,
      splitParticipantIds,
      totalAmountCents,
      values.splitMethod,
      values.splitValues,
    ],
  );

  const updateTransactionType = useCallback(
    (transactionType: TransactionType) => {
      setFormFieldValue('transactionType', transactionType);
      setFormFieldValue('categoryId', '');
      setFieldError('categoryId', undefined);
      setFormError('');
    },
    [setFieldError, setFormError, setFormFieldValue],
  );

  const validateField = useCallback(
    (field: keyof AddTransactionRecordFormValues) => {
      void setFieldTouched(field, true, false);
      void runFieldValidation(field);
    },
    [runFieldValidation, setFieldTouched],
  );

  const submit = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const openSplitSheet = useCallback(() => {
    setIsSplitSheetVisible(true);
  }, []);

  const closeSplitSheet = useCallback(() => {
    setIsSplitSheetVisible(false);
  }, []);

  const toggleSharedUser = useCallback(
    (userId: number) => {
      toggleSharedFriendUser(userId);
      setFriendPickerQuery('');
    },
    [toggleSharedFriendUser],
  );

  const toggleSharedGroup = useCallback(
    (group: Group) => {
      const groupUserIds = getGroupUsers(group, user?.id).map(
        (member) => member.id,
      );

      if (groupUserIds.length === 0) {
        return;
      }

      const isGroupSelected = groupUserIds.every((userId) =>
        values.sharedUserIds.includes(userId),
      );
      const nextSharedUserIds = isGroupSelected
        ? values.sharedUserIds.filter((userId) => !groupUserIds.includes(userId))
        : Array.from(new Set([...values.sharedUserIds, ...groupUserIds]));

      updateSharedUserIds(nextSharedUserIds);
      setFriendPickerQuery('');
    },
    [updateSharedUserIds, user?.id, values.sharedUserIds],
  );

  return {
    accountDropdownQuery,
    accountOptions,
    addFriend: sharedFriends.addFriend,
    categoryPickerQuery,
    categoryOptions,
    closeAddFriendModal: sharedFriends.closeAddFriendModal,
    closeCategoryPicker,
    closeDropdown,
    content,
    currentUserId: user?.id,
    fieldErrors,
    friendEmailQuery: sharedFriends.friendEmailQuery,
    friendSearchError: sharedFriends.friendSearchError,
    friendSearchResults: sharedFriends.friendSearchResults,
    friends: sharedFriends.friends,
    friendsGroupId: sharedFriends.friendsGroupId,
    formError,
    isAddFriendModalVisible: sharedFriends.isAddFriendModalVisible,
    isAddingFriend: sharedFriends.isAddingFriend,
    isCategoryPickerVisible,
    isLoadingOptions,
    isSaving: isSavingRecord || isSubmitting,
    isSearchingFriend: sharedFriends.isSearchingFriend,
    isSharedRecord,
    isSplitSheetVisible,
    isSubmitDisabled:
      isLoadingOptions ||
      isSavingRecord ||
      isSubmitting ||
      sharedFriends.isAddingFriend ||
      (isSharedRecord && values.sharedUserIds.length === 0),
    closeSplitSheet,
    openAddFriendModal: sharedFriends.openAddFriendModal,
    openAccountDropdown,
    openCategoryPicker,
    openDropdown,
    openSplitSheet,
    searchFriendByEmail: sharedFriends.searchFriendByEmail,
    selectAccount,
    selectCategory,
    selectedAccountId,
    selectedAccountCurrencyId,
    selectedCategory,
    selectedCategoryId,
    selectedSharedFriends,
    selectedSharedUserIds: values.sharedUserIds,
    setFriendPickerQuery,
    setAccountDropdownQuery,
    setCategoryPickerQuery,
    setFriendEmailQuery: sharedFriends.setFriendEmailQuery,
    sharedGroups,
    splitMethodLabel,
    splitParticipants,
    friendPickerQuery,
    submit,
    toggleSharedGroup,
    toggleSharedUser,
    totalAmountCents,
    updateField,
    updateSplitMethod,
    updateSplitValue,
    updateTransactionType,
    validateField,
    values,
  };
};

export default useAddTransactionRecord;
