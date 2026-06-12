import { useLocalSearchParams } from 'expo-router';
import { useFormik } from 'formik';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  addTransactionRecordContent,
  addTransactionRecordInitialValues,
} from '@/feature/transactions/constants/addTransactionRecord.constants';
import { sharedExpenseSplitMethodLabels } from '@/feature/transactions/constants/sharedExpenseSplit.constants';
import { useAddTransactionRecordStore } from '@/feature/transactions/store/addTransactionRecord.store';
import useAddTransactionRecordOptions from '@/feature/transactions/hooks/useAddTransactionRecordOptions';
import useSaveAddTransactionRecord from '@/feature/transactions/hooks/useSaveAddTransactionRecord';
import useSharedExpenseFriends from '@/feature/transactions/hooks/useSharedExpenseFriends';
import useSharedExpenseGroups from '@/feature/transactions/hooks/useSharedExpenseGroups';
import useSharedExpenseParticipants from '@/feature/transactions/hooks/useSharedExpenseParticipants';
import { getGroupUsers } from '@/feature/groups/utils/groupMembers.utils';
import type { Group } from '@/feature/groups/types/group.types';
import type {
  AddTransactionRecordFormValues,
  AddTransactionRecordKind,
  AddTransactionRecordTextField,
  AddTransactionRecordViewModel,
} from '@/feature/transactions/types/addTransactionRecord.types';
import type {
  SharedExpenseSplitMethod,
  SharedExpenseUserSharePayload,
} from '@/feature/transactions/types/sharedExpenseSplit.types';
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
  const params = useLocalSearchParams<{
    accountId?: string;
    amountCents?: string;
    categoryId?: string;
    note?: string;
    transactionDate?: string;
    transactionId?: string;
    transactionType?: TransactionType;
    sharedUserIds?: string;
    splitMethod?: SharedExpenseSplitMethod;
    userShares?: string;
  }>();
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
  const routeTransactionId = Number(params.transactionId);
  const editingTransactionId = Number.isFinite(routeTransactionId)
    ? routeTransactionId
    : null;
  const routeTransactionType =
    params.transactionType === 'income' || params.transactionType === 'expense'
      ? params.transactionType
      : null;
  const hasAppliedRouteCategoryRef = useRef(false);
  const hasAppliedRouteRecordFieldsRef = useRef(false);
  const hasAppliedRouteSharedFieldsRef = useRef(false);
  const hasAppliedRouteTransactionTypeRef = useRef(false);
  const [friendPickerQuery, setFriendPickerQuery] = useState('');
  const [hasConfirmedSharedAudience, setHasConfirmedSharedAudience] = useState(
    Boolean(editingTransactionId || params.sharedUserIds),
  );
  const [isSplitSheetVisible, setIsSplitSheetVisible] = useState(false);
  const [isResolvingSharedGroup, setIsResolvingSharedGroup] = useState(false);
  const [selectedSharedAudienceFriendIds, setSelectedSharedAudienceFriendIds] =
    useState<number[]>([]);
  const [selectedSharedGroupId, setSelectedSharedGroupId] = useState<
    number | null
  >(null);
  const [selectedSharedGroup, setSelectedSharedGroup] =
    useState<Group | null>(null);
  const [sharedAudienceError, setSharedAudienceError] = useState('');
  const [splitValuesError, setSplitValuesError] = useState('');

  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.is_archived),
    [accounts],
  );
  const { deleteRecord, isDeletingRecord, isSavingRecord, saveRecord } =
    useSaveAddTransactionRecord({
    activeAccounts,
    categories,
    editingTransactionDate: params.transactionDate,
    editingTransactionId,
    groupId: selectedSharedGroupId,
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
  const { loadFriends, toggleSharedUser: toggleSharedFriendUser } =
    sharedFriends;
  const {
    groups: sharedExpenseGroups,
    loadGroups,
    resolveGroup,
  } = useSharedExpenseGroups({ token });
  useAddTransactionRecordOptions({
    loadFriends,
    loadGroups,
    recordKind,
    resetAddTransactionRecord,
    setAccounts,
    setCategories,
    setFormError,
    setIsLoadingOptions,
    token,
  });
  const selectedSharedGroupMembers = useMemo(
    () => getGroupUsers(selectedSharedGroup, user?.id),
    [selectedSharedGroup, user?.id],
  );
  const shareableUsers = useMemo(() => {
    const usersById = new Map(
      sharedFriends.friends.map((friend) => [friend.id, friend]),
    );

    selectedSharedGroupMembers.forEach((member) => {
      usersById.set(member.id, member);
    });

    return Array.from(usersById.values());
  }, [selectedSharedGroupMembers, sharedFriends.friends]);
  const { selectedSharedFriends, splitParticipantIds, splitParticipants } =
    useSharedExpenseParticipants({
      friends: shareableUsers,
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

  useEffect(() => {
    if (
      hasAppliedRouteTransactionTypeRef.current ||
      !routeTransactionType ||
      values.transactionType === routeTransactionType
    ) {
      if (routeTransactionType) {
        hasAppliedRouteTransactionTypeRef.current = true;
      }
      return;
    }

    hasAppliedRouteTransactionTypeRef.current = true;
    setFormFieldValue('transactionType', routeTransactionType);
    setFieldError('categoryId', undefined);
  }, [
    routeTransactionType,
    setFieldError,
    setFormFieldValue,
    values.transactionType,
  ]);

  useEffect(() => {
    if (hasAppliedRouteRecordFieldsRef.current) {
      return;
    }

    hasAppliedRouteRecordFieldsRef.current = true;

    if (params.amountCents) {
      const amountCents = Number(params.amountCents);
      const amount = Math.abs(amountCents) / 100;

      if (Number.isFinite(amount) && amount > 0) {
        setFormFieldValue(
          'amount',
          Number.isInteger(amount)
            ? String(amount)
            : amount.toFixed(2).replace(/\.?0+$/, ''),
        );
      }
    }

    if (params.note) {
      setFormFieldValue('note', params.note);
    }
  }, [
    params.amountCents,
    params.note,
    setFormFieldValue,
  ]);

  useEffect(() => {
    if (
      hasAppliedRouteSharedFieldsRef.current ||
      !isSharedRecord ||
      !user?.id
    ) {
      return;
    }

    hasAppliedRouteSharedFieldsRef.current = true;

    const routeSharedUserIds = (() => {
      if (!params.sharedUserIds) {
        return [];
      }

      try {
        const parsed = JSON.parse(params.sharedUserIds) as unknown;

        return Array.isArray(parsed)
          ? parsed
              .map((userId) => Number(userId))
              .filter(
                (userId) => Number.isFinite(userId) && userId !== user.id,
              )
          : [];
      } catch {
        return [];
      }
    })();

    const routeUserShares = (() => {
      if (!params.userShares) {
        return [];
      }

      try {
        const parsed = JSON.parse(params.userShares) as unknown;

        return Array.isArray(parsed)
          ? (parsed as SharedExpenseUserSharePayload[])
          : [];
      } catch {
        return [];
      }
    })();

    const routeSplitValues = Object.fromEntries(
      routeUserShares.map((share) => {
        if (params.splitMethod === 'exact') {
          return [
            String(share.user_id),
            String((share.amount_cents ?? 0) / 100),
          ];
        }

        if (params.splitMethod === 'percentage') {
          return [String(share.user_id), String(share.percentage ?? '')];
        }

        return [String(share.user_id), String(share.shares ?? '')];
      }),
    );

    void setValues(
      (currentValues) => ({
        ...currentValues,
        sharedUserIds: routeSharedUserIds,
        splitMethod: params.splitMethod ?? currentValues.splitMethod,
        splitValues: routeSplitValues,
      }),
      false,
    ).catch(() => undefined);
  }, [
    isSharedRecord,
    params.sharedUserIds,
    params.splitMethod,
    params.userShares,
    setValues,
    user?.id,
  ]);

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

  useEffect(() => {
    if (
      hasAppliedRouteCategoryRef.current ||
      values.categoryId ||
      !params.categoryId
    ) {
      return;
    }

    const routeCategoryId = Number(params.categoryId);
    const routeCategory = filteredCategories.find(
      (category) => category.id === routeCategoryId,
    );

    if (routeCategory) {
      hasAppliedRouteCategoryRef.current = true;
      setFormFieldValue('categoryId', String(routeCategory.id));
      setFieldError('categoryId', undefined);
    }
  }, [
    filteredCategories,
    params.categoryId,
    setFieldError,
    setFormFieldValue,
    values.categoryId,
  ]);

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

  const toggleSharedAudienceFriend = useCallback((userId: number) => {
    setSelectedSharedAudienceFriendIds((currentIds) =>
      currentIds.includes(userId)
        ? currentIds.filter((currentId) => currentId !== userId)
        : [...currentIds, userId],
    );
    setSelectedSharedGroup(null);
    setSelectedSharedGroupId(null);
    setSharedAudienceError('');
  }, []);

  const selectSharedGroup = useCallback((groupId: number) => {
    setSelectedSharedGroupId((currentGroupId) =>
      currentGroupId === groupId ? null : groupId,
    );
    setSelectedSharedAudienceFriendIds([]);
    setSelectedSharedGroup(null);
    setSharedAudienceError('');
  }, []);

  const continueSharedAudience = useCallback(async () => {
    if (selectedSharedGroupId !== null) {
      setIsResolvingSharedGroup(true);
      setSharedAudienceError('');

      try {
        const nextGroup = await resolveGroup(selectedSharedGroupId);
        const nextGroupMembers = getGroupUsers(nextGroup, user?.id);
        const nextGroupMemberIds = nextGroupMembers.map((member) => member.id);

        if (!nextGroup || nextGroupMemberIds.length === 0) {
          setSharedAudienceError('This group needs at least one other member.');
          return;
        }

        setSelectedSharedGroup(nextGroup);
        updateSharedUserIds(nextGroupMemberIds);
        setHasConfirmedSharedAudience(true);
        setFriendPickerQuery('');
      } catch (error) {
        setSharedAudienceError(
          error instanceof Error ? error.message : 'Could not load this group.',
        );
      } finally {
        setIsResolvingSharedGroup(false);
      }

      return;
    }

    if (selectedSharedAudienceFriendIds.length === 0) {
      setSharedAudienceError('Select at least one friend or group.');
      return;
    }

    setSelectedSharedGroup(null);
    updateSharedUserIds(selectedSharedAudienceFriendIds);
    setHasConfirmedSharedAudience(true);
    setFriendPickerQuery('');
    setSharedAudienceError('');
  }, [
    selectedSharedAudienceFriendIds,
    selectedSharedGroupId,
    resolveGroup,
    updateSharedUserIds,
    user?.id,
  ]);

  const changeSharedAudience = useCallback(() => {
    setSharedAudienceError('');
    setFriendPickerQuery('');

    if (selectedSharedGroup) {
      setSelectedSharedGroupId(selectedSharedGroup.id);
      setSelectedSharedAudienceFriendIds([]);
    } else {
      setSelectedSharedGroupId(null);
      setSelectedSharedAudienceFriendIds(values.sharedUserIds);
    }

    setHasConfirmedSharedAudience(false);
  }, [selectedSharedGroup, values.sharedUserIds]);

  const toggleSharedUser = useCallback(
    (userId: number) => {
      toggleSharedFriendUser(userId);
      setFriendPickerQuery('');
    },
    [toggleSharedFriendUser],
  );

  const isSharedAudienceStepVisible =
    isSharedRecord && !editingTransactionId && !hasConfirmedSharedAudience;

  return {
    accountDropdownQuery,
    accountOptions,
    addFriend: sharedFriends.addFriend,
    categoryPickerQuery,
    categoryOptions,
    changeSharedAudience,
    closeAddFriendModal: sharedFriends.closeAddFriendModal,
    closeCategoryPicker,
    closeDropdown,
    content,
    currentUserId: user?.id,
    deleteRecord,
    fieldErrors,
    friendEmailQuery: sharedFriends.friendEmailQuery,
    friendSearchError: sharedFriends.friendSearchError,
    friendSearchResults: sharedFriends.friendSearchResults,
    friends: sharedFriends.friends,
    formError,
    groups: sharedExpenseGroups,
    isAddFriendModalVisible: sharedFriends.isAddFriendModalVisible,
    isAddingFriend: sharedFriends.isAddingFriend,
    isCategoryPickerVisible,
    isDeleting: isDeletingRecord,
    isEditing: Boolean(editingTransactionId),
    isLoadingOptions,
    isSaving: isSavingRecord || isSubmitting,
    isSearchingFriend: sharedFriends.isSearchingFriend,
    isResolvingSharedGroup,
    isSharedAudienceStepVisible,
    isSharedRecord,
    isSplitSheetVisible,
    isSubmitDisabled:
      isLoadingOptions ||
      isDeletingRecord ||
      isSavingRecord ||
      isSubmitting ||
      sharedFriends.isAddingFriend ||
      isSharedAudienceStepVisible ||
      (isSharedRecord && values.sharedUserIds.length === 0),
    closeSplitSheet,
    continueSharedAudience,
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
    selectedSharedAudienceFriendIds,
    selectedSharedFriends,
    selectedSharedGroup,
    selectedSharedGroupId,
    selectedSharedGroupMembers,
    selectedSharedUserIds: values.sharedUserIds,
    setFriendPickerQuery,
    setAccountDropdownQuery,
    setCategoryPickerQuery,
    setFriendEmailQuery: sharedFriends.setFriendEmailQuery,
    splitMethodLabel,
    splitParticipants,
    friendPickerQuery,
    selectSharedGroup,
    sharedAudienceError,
    submit,
    toggleSharedAudienceFriend,
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
