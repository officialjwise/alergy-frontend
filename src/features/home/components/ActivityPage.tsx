import { StyleSheet, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Button, Icon, IconChip, PressableScale, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { ouncesToCups } from '@/features/tracking/nutrition';
import type { DailyActivity, HealthConnection, WaterDay } from '@/types';

export interface ActivityPageLabels {
  connectTitle: string;
  connectBody: string;
  connect: string;
  connectedTitle: string;
  connectedBody: string;
  manage: string;
  caloriesBurned: string;
  steps: string;
  cal: string;
  water: string;
  waterValue: (ounces: number, cups: number) => string;
  logWater: string;
}

export interface ActivityPageProps {
  health: HealthConnection;
  activity: DailyActivity;
  water: WaterDay;
  connecting: boolean;
  onConnect: () => void;
  onManage: () => void;
  onLogWater: () => void;
  labels: ActivityPageLabels;
}

/** Third dashboard page: Apple Health card, calories burned and steps, and the water row. */
export function ActivityPage({
  health,
  activity,
  water,
  connecting,
  onConnect,
  onManage,
  onLogWater,
  labels,
}: ActivityPageProps) {
  return (
    <View style={styles.page}>
      <View style={styles.row}>
        <DashboardCard style={styles.health} testID="home-health">
          <IconChip icon="heart" size={44} iconSize={22} color="health" background="surface" />
          <Text variant="label" color="text" align="center" numberOfLines={2}>
            {health.connected ? labels.connectedTitle : labels.connectTitle}
          </Text>
          <Text variant="small" color="textMuted" align="center" numberOfLines={2}>
            {health.connected ? labels.connectedBody : labels.connectBody}
          </Text>
          <Button
            title={health.connected ? labels.manage : labels.connect}
            variant={health.connected ? 'secondary' : 'primary'}
            size="sm"
            onPress={health.connected ? onManage : onConnect}
            loading={connecting}
            style={styles.connect}
          />
        </DashboardCard>
        <DashboardCard style={styles.burn} testID="home-burn">
          <Text variant="small" color="textMuted">
            {labels.caloriesBurned}
          </Text>
          <View style={styles.figure}>
            <Text variant="stat" color="text">
              {activity.caloriesBurned}
            </Text>
            <Text variant="small" color="textMuted">
              {labels.cal}
            </Text>
          </View>
          <View style={styles.steps}>
            <Icon name="steps" size={rs(18)} color="text" />
            <View>
              <Text variant="label" color="text">
                {labels.steps}
              </Text>
              <Text variant="small" color="textMuted">
                {activity.steps ? `${activity.steps.toLocaleString()} · ` : ''}
                {activity.stepCalories} {labels.cal}
              </Text>
            </View>
          </View>
        </DashboardCard>
      </View>
      <DashboardCard padding={spacing.sm} testID="home-water">
        <View style={styles.waterRow}>
          <Icon name="cup" size={rs(26)} color="water" />
          <View style={styles.waterText}>
            <Text variant="small" color="textMuted">
              {labels.water}
            </Text>
            <Text variant="label" color="text">
              {labels.waterValue(water.ounces, ouncesToCups(water.ounces))}
            </Text>
          </View>
          <PressableScale
            onPress={onLogWater}
            haptic="light"
            pressedScale={0.96}
            accessibilityRole="button"
            accessibilityLabel={labels.logWater}
            style={styles.logWater}
          >
            <Text variant="label" color="text">
              {labels.logWater}
            </Text>
          </PressableScale>
        </View>
      </DashboardCard>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: rs(spacing.sm) },
  row: { flexDirection: 'row', gap: rs(spacing.sm) },
  health: { flex: 1, alignItems: 'center', gap: rs(6) },
  connect: { marginTop: rs(spacing.xs), alignSelf: 'stretch' },
  burn: { flex: 1, gap: rs(2) },
  figure: { flexDirection: 'row', alignItems: 'baseline', gap: rs(4) },
  steps: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs), marginTop: rs(spacing.md) },
  waterRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  waterText: { flex: 1 },
  logWater: {
    minHeight: rs(36),
    paddingHorizontal: rs(spacing.md),
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
