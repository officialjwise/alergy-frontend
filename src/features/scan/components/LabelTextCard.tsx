import { StyleSheet } from 'react-native';

import { highlightSegments } from '../ingredients';
import { VERDICT_THEME } from '../verdictTheme';
import { Card, Text } from '@/components/ui';
import { colors, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { TriggerKind, VerdictTrigger } from '@/types';

export interface LabelTextCardProps {
  title: string;
  hint: string;
  text: string;
  triggers: VerdictTrigger[];
}

const KIND_COLOR: Record<TriggerKind, ColorToken> = {
  contains: VERDICT_THEME.unsafe.color,
  may_contain: VERDICT_THEME.caution.color,
  cross_contact: VERDICT_THEME.caution.color,
  unclear: VERDICT_THEME.unknown.color,
};
const KIND_TINT: Record<TriggerKind, ColorToken> = {
  contains: VERDICT_THEME.unsafe.tint,
  may_contain: VERDICT_THEME.caution.tint,
  cross_contact: VERDICT_THEME.caution.tint,
  unclear: VERDICT_THEME.unknown.tint,
};

/** Scanned label or menu text with the flagged words highlighted in their verdict colour. */
export function LabelTextCard({ title, hint, text, triggers }: LabelTextCardProps) {
  const segments = highlightSegments(text, triggers);
  return (
    <Card title={title} variant="outlined" padding={spacing.lg}>
      <Text variant="body" color="textBody" accessibilityLabel={text}>
        {segments.map((segment, index) =>
          segment.kind ? (
            <Text
              key={`${index}-${segment.text}`}
              variant="bodyStrong"
              color={KIND_COLOR[segment.kind]}
              style={{ backgroundColor: colors[KIND_TINT[segment.kind]] }}
            >
              {segment.text}
            </Text>
          ) : (
            <Text key={`${index}-${segment.text}`} variant="body" color="textBody">
              {segment.text}
            </Text>
          ),
        )}
      </Text>
      <Text variant="small" color="textMuted" style={styles.hint}>
        {hint}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({ hint: { marginTop: rs(spacing.sm) } });
