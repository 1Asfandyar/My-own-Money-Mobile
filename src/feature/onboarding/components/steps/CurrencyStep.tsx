import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

import { onboardingStyles } from '../../styles/onboarding.styles';
import type { CurrencyStepProps } from '../../types';

const CurrencyStep = ({
  currencies,
  selectedCurrency,
  onSelectCurrency,
}: CurrencyStepProps) => {
  return (
    <View className={onboardingStyles.stepContainer}>
      <View className={onboardingStyles.heroIconContainer}>
        <Ionicons
          name="globe-outline"
          size={42}
          color={themeColors.primary}
        />
      </View>

      <ThemedText className={onboardingStyles.title} weight="bold">
        Choose your currency
      </ThemedText>
      <ThemedText className={onboardingStyles.description}>
        Pick one currency for your whole app. You can change this later from Settings.
      </ThemedText>

      <View className={onboardingStyles.optionsList}>
        {currencies.map((currency) => {
          const isSelected = currency.code === selectedCurrency.code;

          return (
            <TouchableOpacity
              key={currency.code}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectCurrency(currency.code)}
              className={`${onboardingStyles.currencyOption} ${
                isSelected
                  ? onboardingStyles.selectedOption
                  : onboardingStyles.unselectedOption
              }`}
            >
              <View className={onboardingStyles.currencyIconContainer}>
                <Ionicons
                  name={currency.icon}
                  size={23}
                  color={themeColors.primary}
                />
              </View>

              <View className={onboardingStyles.optionCopy}>
                <ThemedText
                  className={onboardingStyles.optionTitle}
                  weight="semiBold"
                >
                  {currency.code} - {currency.symbol}
                </ThemedText>
                <ThemedText className={onboardingStyles.optionDescription}>
                  {currency.name}
                </ThemedText>
              </View>

              {isSelected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={themeColors.primary}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CurrencyStep;
