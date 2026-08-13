import type { TextProps } from 'react-native';

import ThemedText from '@/theme/components/ThemedText';
import type { FontWeight } from '@/theme/types';
import { formatCentsBySymbol } from '@/utils/currency';

export interface AmountWithCurrencyProps extends Omit<TextProps, 'children' | 'weight'> {
  /** Amount in cents */
  amountCents: number;
  /** Currency symbol (e.g., "$", "Rs", "€") */
  currencySymbol: string;
  /** Whether to show absolute value (default: false) */
  useAbsoluteValue?: boolean;
  /** Font weight (default: "bold") */
  weight?: FontWeight;
  /** Custom color override */
  customColor?: string;
}

/**
 * Component to display amounts with currency symbol and color coding.
 * Positive amounts are shown in green (#16A34A), negative amounts in red (#EF4444).
 *
 * @example
 * <AmountWithCurrency
 *   amountCents={50000}
 *   currencySymbol="$"
 *   weight="bold"
 * />
 */
function AmountWithCurrency({
  amountCents,
  currencySymbol,
  useAbsoluteValue = false,
  weight,
  customColor,
  ...textProps
}: AmountWithCurrencyProps) {
  const displayAmount = useAbsoluteValue ? Math.abs(amountCents) : amountCents;
  const isNegative = amountCents < 0;
  
  // Determine color based on amount sign
  let color = customColor;
  if (!customColor) {
    color = isNegative ? '#EF4444' : '#16A34A';
  }

  const formattedAmount = formatCentsBySymbol(displayAmount, currencySymbol);
  const finalWeight: FontWeight = weight === undefined ? 'bold' : weight;

  return (
    <ThemedText weight={finalWeight} style={{ color }} {...textProps}>
      {formattedAmount}
    </ThemedText>
  );
}

export default AmountWithCurrency;
