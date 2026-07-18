import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, TouchableOpacity, View } from 'react-native';

import {
    getStoredBalanceVisibility,
    saveBalanceVisibility,
} from '@/feature/accounts/storage/balanceVisibility.storage';
import type { SelectedAccountBalanceCardProps } from '@/feature/accounts/types/accountsOverview.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatCents } from '@/utils/currency';

// Swiping further than this (in px) switches to the previous/next account.
const SWIPE_THRESHOLD = 48;

const SelectedAccountBalanceCard = ({
  accounts,
  currencies,
  displayCurrency,
  onSelectAccount,
  selectedAccount,
}: SelectedAccountBalanceCardProps) => {
  // Default to hidden until the user's saved preference loads, so balances
  // are never exposed by default in public/social settings.
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const cardOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;

    getStoredBalanceVisibility().then((storedIsVisible) => {
      if (isMounted) setIsBalanceVisible(storedIsVisible);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((isVisible) => {
      const nextIsVisible = !isVisible;
      saveBalanceVisibility(nextIsVisible);
      return nextIsVisible;
    });
  };

  const currentBalanceCents = selectedAccount?.current_balance_cents ?? 0;
  const balanceLabel = formatCents(
    currentBalanceCents,
    displayCurrency.id,
    currencies,
  );
  const selectedAccountIndex = accounts.findIndex(
    (account) => account.id === selectedAccount?.id,
  );

  const switchToIndex = useCallback(
    (nextIndex: number) => {
      const nextAccount = accounts[nextIndex];

      if (!nextAccount) return;

      Animated.sequence([
        Animated.timing(cardOpacity, {
          duration: 90,
          toValue: 0.4,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          duration: 150,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
      onSelectAccount(nextAccount.id);
    },
    [accounts, cardOpacity, onSelectAccount],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -SWIPE_THRESHOLD) {
            switchToIndex(selectedAccountIndex + 1);
          } else if (gestureState.dx >= SWIPE_THRESHOLD) {
            switchToIndex(selectedAccountIndex - 1);
          }
        },
      }),
    [selectedAccountIndex, switchToIndex],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      accessibilityActions={[
        { name: 'increment', label: 'Next account' },
        { name: 'decrement', label: 'Previous account' },
      ]}
      accessibilityHint={
        accounts.length > 1 ? 'Swipe left or right to switch accounts' : undefined
      }
      accessibilityLabel={`Account balance card, showing ${selectedAccount?.name ?? 'no account'}`}
      accessibilityRole={accounts.length > 1 ? 'adjustable' : undefined}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') {
          switchToIndex(selectedAccountIndex + 1);
        } else if (event.nativeEvent.actionName === 'decrement') {
          switchToIndex(selectedAccountIndex - 1);
        }
      }}
      style={{ opacity: cardOpacity }}
      className="mt-4 rounded-3xl bg-secondary px-5 py-6"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <ThemedText className="text-sm uppercase tracking-wide text-white/60">
            Account
          </ThemedText>
          <ThemedText
            className="pb-2 text-2xl text-white"
            weight="semiBold"
            numberOfLines={1}
          >
            {selectedAccount?.name ?? 'No account selected'}
          </ThemedText>
          <ThemedText className="text-sm text-white/70">
            Current balance in {displayCurrency.code}
          </ThemedText>
          <ThemedText
            className="mt-1 text-3xl text-white"
            weight="bold"
            numberOfLines={1}
          >
            {isBalanceVisible ? balanceLabel : '******'}
          </ThemedText>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            isBalanceVisible ? 'Hide account balance' : 'Show account balance'
          }
          accessibilityHint="Toggles whether your balance amount is visible on screen"
          accessibilityState={{ selected: !isBalanceVisible }}
          onPress={toggleBalanceVisibility}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
        >
          <Ionicons
            name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
            size={21}
            color={themeColors.white}
          />
        </TouchableOpacity>
      </View>

      {accounts.length > 1 ? (
        <View
          accessibilityElementsHidden
          className="mt-4 flex-row items-center justify-center"
          importantForAccessibility="no-hide-descendants"
        >
          {accounts.map((account, index) => (
            <View
              key={account.id}
              className={`mx-1 rounded-full ${
                index === selectedAccountIndex
                  ? 'h-2 w-5 bg-white'
                  : 'h-2 w-2 bg-white/30'
              }`}
            />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
};

export default SelectedAccountBalanceCard;
