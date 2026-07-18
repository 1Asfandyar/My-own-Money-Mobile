import { TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { CategoryChartTab, ReportCategorySpending } from '@/feature/reports/types/report.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatAmount } from '@/utils/currency';

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
const RADIUS = DONUT_SIZE / 2;
const HOLE_RATIO = 0.55;
const INNER_RADIUS = RADIUS * HOLE_RATIO;

const toRad = (deg: number) => (deg * Math.PI) / 180;

const polarXY = (cx: number, cy: number, r: number, angleDeg: number) => ({
  x: cx + r * Math.cos(toRad(angleDeg)),
  y: cy + r * Math.sin(toRad(angleDeg)),
});

const arcPath = (startDeg: number, sweepDeg: number): string => {
  const cx = RADIUS;
  const cy = RADIUS;
  // Cap to avoid degenerate full-circle arc
  const sweep = Math.min(sweepDeg, 359.9999);
  const endDeg = startDeg + sweep;
  const large = sweep > 180 ? 1 : 0;

  const os = polarXY(cx, cy, RADIUS, startDeg);
  const oe = polarXY(cx, cy, RADIUS, endDeg);
  const is = polarXY(cx, cy, INNER_RADIUS, startDeg);
  const ie = polarXY(cx, cy, INNER_RADIUS, endDeg);

  return [
    `M ${os.x} ${os.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${large} 0 ${is.x} ${is.y}`,
    'Z',
  ].join(' ');
};

interface DonutChartProps {
  items: DisplayCategory[];
  currencySymbol: string;
}

const DonutChart = ({ items, currencySymbol }: DonutChartProps) => {
  // Start at -90° so 0% begins at 12 o'clock
  let accumulated = -90;
  const segments = items.map((item) => {
    const sweep = (item.percent_of_expenses / 100) * 360;
    const start = accumulated;
    accumulated += sweep;
    return { ...item, startAngle: start, sweepAngle: sweep };
  });

  return (
    <View className="items-center">
      <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
        {segments.map((seg, i) => (
          <Path
            key={i}
            d={arcPath(seg.startAngle, seg.sweepAngle)}
            fill={seg.color}
          />
        ))}
      </Svg>

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
        Spending Breakdown
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

export default SpendingByCategory;
