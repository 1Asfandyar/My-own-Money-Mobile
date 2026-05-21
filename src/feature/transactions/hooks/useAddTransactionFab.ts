import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROUTES } from '@/config/routes';
import { useAddTransactionFabStore } from '@/feature/transactions/store/addTransactionFab.store';

const useAddTransactionFab = (selectedAccountId?: number) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const closeMenu = useAddTransactionFabStore((state) => state.closeMenu);
  const isExpanded = useAddTransactionFabStore((state) => state.isExpanded);
  const toggleMenu = useAddTransactionFabStore((state) => state.toggleMenu);
  const bottomOffset = Math.max(insets.bottom, 12) + 104;

  const handleAddPersonalPress = useCallback(() => {
    closeMenu();
    router.push({
      pathname: ROUTES.ADD_PERSONAL_RECORD,
      params: selectedAccountId ? { accountId: selectedAccountId } : undefined,
    });
  }, [closeMenu, router, selectedAccountId]);

  const handleAddSharedPress = useCallback(() => {
    closeMenu();
    router.push({
      pathname: ROUTES.ADD_SHARED_RECORD,
      params: selectedAccountId ? { accountId: selectedAccountId } : undefined,
    });
  }, [closeMenu, router, selectedAccountId]);

  return {
    bottomOffset,
    isExpanded,
    onAddPersonalPress: handleAddPersonalPress,
    onAddSharedPress: handleAddSharedPress,
    onTogglePress: toggleMenu,
  };
};

export default useAddTransactionFab;
