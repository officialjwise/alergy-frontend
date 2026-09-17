import { StyleSheet, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface HealthScoreCardProps {
  title: string;
  /** 1..10 or null before any food is logged. */
  score: number | null;
  notAvailableLabel: string;
  body: string;
  testID?: string;
}

/** "Health Score" card: title, score on the right, thin bar and the explanation. */
export function HealthScoreCard({
  title,
  score,
  notAvailableLabel,
  body,
  testID,
}: HealthScoreCardProps) {
  const value = score === null ? notAvailableLabel : `${score}/10`;
  const color: keyof typeof colors =
    score === null ? 'track' : score >= 7 ? 'success' : score >= 4 ? 'warning' : 'danger';
  return (
    <DashboardCard accessibilityLabel={`${title}: ${value}. ${body}`} testID={testID}>
      <View style={styles.head}>
        <Text variant="cardTitle" color="text">
          {title}
        </Text>
        <Text variant="cardTitle" color="text">
          {value}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${score === null ? 0 : score * 10}%`, backgroundColor: colors[color] },
          ]}
        />
      </View>
      <Text variant="small" color="textMuted">
        {body}
      </Text>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.track,
    marginTop: rs(spacing.sm),
    marginBottom: rs(spacing.sm),
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill },
});
