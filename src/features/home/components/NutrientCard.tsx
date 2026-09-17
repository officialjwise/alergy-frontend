import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Icon, Ring, Text, type IconName } from '@/components/ui';
import { spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface NutrientCardProps {
  /** Eaten or left, depending on the page toggle. */
  value: number;
  goal: number;
  /** "g" or "mg". */
  unit: string;
  /** "Protein eaten", "Fiber left". */
  label: string;
  progress: number;
  color: ColorToken;
  icon: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Small stat card: "0 /173g", the label, and a ring with the nutrient icon. */
export function NutrientCard({
  value,
  goal,
  unit,
  label,
  progress,
  color,
  icon,
  style,
  testID,
}: NutrientCardProps) {
  return (
    <DashboardCard
      accessibilityLabel={`${label}: ${value} of ${goal}${unit}`}
      padding={spacing.sm}
      style={[styles.card, style]}
      testID={testID}
    >
      <View style={styles.figure}>
        <Text variant="stat" color="text" style={styles.value}>
          {value}
        </Text>
        <Text variant="small" color="textMuted">
          /{goal}
          {unit}
        </Text>
      </View>
      <Text variant="small" color="textMuted" numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.ring}>
        <Ring size={rs(64)} thickness={6} progress={progress} color={color} trackColor="track">
          <Icon name={icon} size={rs(22)} color={color} />
        </Ring>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: rs(2) },
  figure: { flexDirection: 'row', alignItems: 'baseline', gap: rs(3) },
  value: { fontSize: rs(22), lineHeight: rs(28) },
  ring: { alignItems: 'center', marginTop: rs(spacing.md), marginBottom: rs(spacing.xs) },
});
