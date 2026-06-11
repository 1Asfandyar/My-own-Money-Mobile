import { StyleSheet, TouchableOpacity, View } from 'react-native';

import type { CategoryChartTab, ReportCategorySpending } from '@/feature/reports/types/report.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const PALETTE = [
  '#2BA88C',
  '#D4AF37',
  '#FF6B6B',
  '#45B7D1',
  '#A78BFA',
  '#FB923C',
  '#34D399',
  '#F472B6',
];

const MAX_VISIBLE = 5;

const formatAmount = (cents: number, symbol: string): string => {
  const amount = cents / 100;
  return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

type DisplayCategory = ReportCategorySpending & { color: string };

const buildDisplayCategories = (categories: ReportCategorySpending[]): DisplayCategory[] => {
  if (categories.length <= MAX_VISIBLE) {
    return categories.map((c, i) => ({ ...c, color: PALETTE[i % PALETTE.length] }));
  }

  const visible: DisplayCategory[] = categories.slice(0, MAX_VISIBLE).map((c, i) => ({
    ...c,
    color: PALETTE[i % PALETTE.length],
  }));

  const rest = categories.slice(MAX_VISIBLE);
  const othersCents = rest.reduce((sum, c) => sum + c.amount_cents, 0);
  const othersPercent = rest.reduce((sum, c) => sum + c.percent_of_expenses, 0);
  const othersCount = rest.reduce((sum, c) => sum + c.transaction_count, 0);

  visible.push({
    category_id: -1,
    category_name: 'Others',
    amount_cents: othersCents,
    percent_of_expenses: othersPercent,
    transaction_count: othersCount,
    color: themeColors.gray300,
  });

  return visible;
};

// ── Bar view ─────────────────────────────────────────────────────────────────

interface BarRowProps {
  name: string;
  amountLabel: string;
  percent: number;
  transactionCount: number;
  color: string;
}

const BarRow = ({ name, amountLabel, percent, transactionCount, color }: BarRowProps) => (
  <View className="mb-4">
    <View className="flex-row items-center justify-between">
      <ThemedText className="flex-1 text-sm text-gray-800" weight="semiBold" numberOfLines={1}>
        {name}
      </ThemedText>
      <View className="flex-row items-center">
        <ThemedText className="mr-2 text-xs text-gray-400">
          {transactionCount} txn{transactionCount !== 1 ? 's' : ''}
        </ThemedText>
        <ThemedText className="min-w-16 text-right text-sm text-gray-800" weight="semiBold">
          {amountLabel}
        </ThemedText>
        <ThemedText className="ml-2 w-10 text-right text-sm text-gray-500">
          {percent}%
        </ThemedText>
      </View>
    </View>

    <View className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
      <View
        className="h-full rounded-full"
        style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
      />
    </View>
  </View>
);

// ── Donut chart ───────────────────────────────────────────────────────────────

const DONUT_SIZE = 160;
const HOLE_RATIO = 0.55;

interface PieSegmentProps {
  startAngle: number;
  sweepAngle: number;
  color: string;
}

const PieSegment = ({ startAngle, sweepAngle, color }: PieSegmentProps) => {
  const halfSize = DONUT_SIZE / 2;

  if (sweepAngle <= 0) return null;

  if (sweepAngle > 180) {
    return (
      <>
        <PieSegment startAngle={startAngle} sweepAngle={180} color={color} />
        <PieSegment startAngle={startAngle + 180} sweepAngle={sweepAngle - 180} color={color} />
      </>
    );
  }

  return (
    <View
      style={[
        styles.segmentContainer,
        { transform: [{ rotate: `${startAngle}deg` }] },
      ]}
    >
      <View
        style={[
          styles.segmentHalf,
          {
            backgroundColor: color,
            transform: [
              { translateX: -(halfSize / 2) },
              { rotate: `${sweepAngle - 180}deg` },
              { translateX: halfSize / 2 },
            ],
          },
        ]}
      />
    </View>
  );
};

interface DonutChartProps {
  items: DisplayCategory[];
  currencySymbol: string;
}

const DonutChart = ({ items, currencySymbol }: DonutChartProps) => {
  const halfSize = DONUT_SIZE / 2;
  const holeSize = DONUT_SIZE * HOLE_RATIO;

  let accumulated = -90;
  const segments = items.map((item) => {
    const sweep = (item.percent_of_expenses / 100) * 360;
    const start = accumulated;
    accumulated += sweep;
    return { ...item, startAngle: start, sweepAngle: sweep };
  });

  return (
    <View className="items-center">
      <View style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
        <View style={styles.donutBackground} />

        {segments.map((seg, i) => (
          <PieSegment
            key={i}
            startAngle={seg.startAngle}
            sweepAngle={seg.sweepAngle}
            color={seg.color}
          />
        ))}

        <View
          style={[
            styles.donutHole,
            {
              width: holeSize,
              height: holeSize,
              borderRadius: holeSize / 2,
              top: halfSize - holeSize / 2,
              left: halfSize - holeSize / 2,
            },
          ]}
        />
      </View>

      <View className="mt-4 w-full">
        {items.map((item, i) => (
          <View key={i} className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <View
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <ThemedText className="text-sm text-gray-700" numberOfLines={1}>
                {item.category_name}
              </ThemedText>
            </View>
            <ThemedText className="text-sm text-gray-600" weight="semiBold">
              {formatAmount(item.amount_cents, currencySymbol)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const TabButton = ({ label, active, onPress }: TabButtonProps) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className="flex-1 items-center rounded-xl py-2"
    style={{ backgroundColor: active ? themeColors.primary : 'transparent' }}
  >
    <ThemedText
      className="text-sm"
      weight="semiBold"
      style={{ color: active ? themeColors.white : themeColors.gray500 }}
    >
      {label}
    </ThemedText>
  </TouchableOpacity>
);

interface SpendingByCategoryProps {
  categories: ReportCategorySpending[];
  activeTab: CategoryChartTab;
  currencySymbol: string;
  onTabChange: (tab: CategoryChartTab) => void;
}

const SpendingByCategory = ({
  categories,
  activeTab,
  currencySymbol,
  onTabChange,
}: SpendingByCategoryProps) => {
  const items = buildDisplayCategories(categories);

  return (
    <View className="mx-4 mt-5">
      <ThemedText className="mb-4 text-base text-gray-900" weight="semiBold">
        Where did it go?
      </ThemedText>

      <View className="mb-4 flex-row rounded-2xl bg-gray-100 p-1">
        <TabButton label="Bar" active={activeTab === 'bar'} onPress={() => onTabChange('bar')} />
        <TabButton label="Donut" active={activeTab === 'donut'} onPress={() => onTabChange('donut')} />
      </View>

      {activeTab === 'bar' ? (
        <View>
          {items.map((item) => (
            <BarRow
              key={item.category_id}
              name={item.category_name}
              amountLabel={formatAmount(item.amount_cents, currencySymbol)}
              percent={item.percent_of_expenses}
              transactionCount={item.transaction_count}
              color={item.color}
            />
          ))}
        </View>
      ) : (
        <DonutChart items={items} currencySymbol={currencySymbol} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  segmentContainer: {
    position: 'absolute',
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    borderRadius: DONUT_SIZE / 2,
    overflow: 'hidden',
  },
  segmentHalf: {
    position: 'absolute',
    width: DONUT_SIZE / 2,
    height: DONUT_SIZE,
    left: DONUT_SIZE / 2,
  },
  donutBackground: {
    position: 'absolute',
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    borderRadius: DONUT_SIZE / 2,
    backgroundColor: themeColors.gray100,
  },
  donutHole: {
    position: 'absolute',
    backgroundColor: themeColors.white,
  },
});

export default SpendingByCategory;
