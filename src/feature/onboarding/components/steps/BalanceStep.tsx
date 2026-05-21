import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';

import {
  onboardingLayout,
  onboardingStyles,
} from '../../styles/onboarding.styles';
import type { BalanceStepProps } from '../../types';

const BalanceStep = ({
  accountName,
  openingBalance,
  selectedCurrency,
  selectedAccountIcon,
  selectedAccountColor,
  onOpeningBalanceChange,
}: BalanceStepProps) => {
  return (
    <View className={onboardingStyles.stepContainer}>
      <Image
        source={require('../../../../assets/illustrations/onboarding-4.png')}
        contentFit="contain"
        style={[onboardingLayout.balanceIllustration, { width: '100%' }]}
      />

      <View className={onboardingStyles.balanceCopy}>
        <ThemedText className={onboardingStyles.title} weight="bold">
          Add opening balance
        </ThemedText>
        <ThemedText className={onboardingStyles.description}>
          This is the current balance of your account.
        </ThemedText>
      </View>

      <View className={onboardingStyles.accountPreview}>
        <View
          className={onboardingStyles.accountPreviewIcon}
          style={{ backgroundColor: `${selectedAccountColor}1A` }}
        >
          <Ionicons
            name={selectedAccountIcon}
            size={24}
            color={selectedAccountColor}
          />
        </View>

        <View className={onboardingStyles.accountPreviewCopy}>
          <ThemedText
            className={onboardingStyles.optionTitle}
            weight="semiBold"
          >
            {accountName.trim() || 'Your first account'}
          </ThemedText>
          <ThemedText className={onboardingStyles.optionDescription}>
            {selectedCurrency.code} account
          </ThemedText>
        </View>
      </View>

      <ThemedInput
        label="Opening balance"
        placeholder="0"
        value={openingBalance}
        onChangeText={onOpeningBalanceChange}
        keyboardType="decimal-pad"
        leftIcon="calculator-outline"
        containerClassName="mt-6"
        returnKeyType="done"
      />
    </View>
  );
};

export default BalanceStep;
