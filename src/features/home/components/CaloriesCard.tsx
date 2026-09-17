import { StyleSheet, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Icon, Ring, Text } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export type NutrientMetric = 'eaten' | 'left';

export interface CaloriesCardProps {
  eaten: number;
  budget: number;
  metric: NutrientMetric;
  /** "Calories eaten" / "Calories left". */
  label: string;
  toggleHint: string;
  onToggle: () => void;
  testID?: string;
}

/** The hero card: big figure with "/budget", the metric label with a toggle, and the flame ring. */
export function CaloriesCard({
  eaten,
  budget,
  metric,
  label,
  toggleHint,
  onToggle,
  testID,
}: CaloriesCardProps) {
  const left = Math.max(0, budget - eaten);
  const value = metric === 'eaten' ? eaten : left;
  const progress = budget > 0 ? Math.min(1, eaten / budget) : 0;
  return (
    <DashboardCard
      onPress={onToggle}
      accessibilityLabel={`${label}: ${value} of ${budget}`}
      accessibilityHint={toggleHint}
      padding={spacing.lg}
      testID={testID}
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <View style={styles.figure}>
            <Text variant="statLg" color="text">
              {value}
            </Text>
            <Text variant="label" color="textMuted" style={styles.goal}>
              /{budget}
            </Text>
          </View>
          <View style={styles.labelRow}>
            <Text variant="body" color="textMuted">
              {label}
            </Text>
            <Icon name="swapVertical" size={rs(14)} color="textMuted" />
          </View>
        </View>
        <Ring size={rs(112)} thickness={10} progress={progress} color="primary" trackColor="track">
          <Icon name="flame" size={rs(30)} color="text" />
        </Ring>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  text: { flex: 1, gap: rs(2) },
  figure: { flexDirection: 'row', alignItems: 'baseline', gap: rs(4) },
  goal: { marginBottom: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
});
