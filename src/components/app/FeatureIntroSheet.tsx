import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Divider,
  Icon,
  IconChip,
  Sheet,
  Text,
  type IconName,
  type SheetRef,
} from '@/components/ui';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface FeatureIntroRow {
  icon: IconName;
  title: string;
  detail: string;
  status: string;
  statusColor: ColorToken;
}

export interface FeatureIntroSheetProps {
  icon: IconName;
  title: string;
  subtitle: string;
  rows: FeatureIntroRow[];
  /** Highlighted row at the bottom of the card. */
  summary: { label: string; value: string };
  /** Line under the card ("Saved foods watched: 0 → 12"). */
  footnote?: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryLoading?: boolean;
  secondaryLabel: string;
  onSecondary: () => void;
  closeLabel: string;
  onDismiss?: () => void;
  testID?: string;
}

/**
 * Reusable feature introduction sheet: icon, title, subtitle, a sample card
 * with a highlighted summary row, a footnote and two actions. Present with
 * `ref.current?.present()`.
 */
export const FeatureIntroSheet = forwardRef<SheetRef, FeatureIntroSheetProps>(
  function FeatureIntroSheet(
    {
      icon,
      title,
      subtitle,
      rows,
      summary,
      footnote,
      primaryLabel,
      onPrimary,
      primaryLoading = false,
      secondaryLabel,
      onSecondary,
      closeLabel,
      onDismiss,
      testID,
    },
    ref,
  ) {
    return (
      <Sheet ref={ref} closeLabel={closeLabel} onDismiss={onDismiss}>
        <View style={styles.wrap} testID={testID}>
          <IconChip icon={icon} size={56} iconSize={28} outline background="surface" />
          <Text variant="sectionTitle" color="text" align="center" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="body" color="textMuted" align="center" style={styles.subtitle}>
            {subtitle}
          </Text>
          <View style={styles.card}>
            {rows.map((row, index) => (
              <View key={`${row.title}-${index}`}>
                <View style={styles.row}>
                  <Icon name={row.icon} size={rs(20)} color="text" outline />
                  <View style={styles.rowText}>
                    <Text variant="label" color="text" numberOfLines={1}>
                      {row.title}
                    </Text>
                    <Text variant="small" color="textMuted" numberOfLines={1}>
                      {row.detail}
                    </Text>
                  </View>
                  <Text variant="label" color={row.statusColor} numberOfLines={1}>
                    {row.status}
                  </Text>
                </View>
                <Divider />
              </View>
            ))}
            <View style={styles.summary}>
              <Text variant="label" color="text" style={styles.summaryLabel}>
                {summary.label}
              </Text>
              <Text variant="label" color="success">
                {summary.value}
              </Text>
            </View>
          </View>
          {footnote ? (
            <Text variant="captionSm" color="textMuted" align="center">
              {footnote}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button
              title={primaryLabel}
              onPress={onPrimary}
              loading={primaryLoading}
              haptic="medium"
            />
            <Button title={secondaryLabel} variant="text" onPress={onSecondary} />
          </View>
        </View>
      </Sheet>
    );
  },
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: rs(spacing.sm), paddingTop: rs(spacing.sm) },
  subtitle: { maxWidth: 320, marginBottom: rs(spacing.xs) },
  card: {
    alignSelf: 'stretch',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: rs(spacing.sm),
    gap: rs(2),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm), minHeight: rs(56) },
  rowText: { flex: 1 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: rs(48),
    marginTop: rs(spacing.xs),
    paddingHorizontal: rs(spacing.sm),
    borderRadius: radii.sm,
    backgroundColor: colors.successTint,
  },
  summaryLabel: { flex: 1 },
  actions: { alignSelf: 'stretch', gap: rs(spacing.xs), marginTop: rs(spacing.xs) },
});
