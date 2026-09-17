import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { VerdictBadge } from '@/components/app/VerdictBadge';
import { Divider, ListRow, Sheet, Text, type SheetRef } from '@/components/ui';
import { useHistory } from '@/features/history/useHistory';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';
import { formatRelativeDay } from '@/utils/date';

export interface FoodPickerSheetProps {
  profileId: string | null;
  onPick: (scan: ScanResult) => void;
}

const MAX_ROWS = 12;

/** Pick a recently scanned food to attach to a reaction. */
export const FoodPickerSheet = forwardRef<SheetRef, FoodPickerSheetProps>(function FoodPickerSheet(
  { profileId, onPick },
  ref,
) {
  const { t, i18n } = useTranslation();
  const history = useHistory(profileId);
  const scans = (history.data ?? []).slice(0, MAX_ROWS);
  const close = () => {
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
  };
  return (
    <Sheet ref={ref} title={t('reactions.pickerTitle')} closeLabel={t('common.close')}>
      {scans.length === 0 ? (
        <Text variant="body" color="textMuted" style={styles.empty}>
          {t('reactions.pickerEmpty')}
        </Text>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {scans.map((scan, index) => (
            <View key={scan.id}>
              <ListRow
                label={scan.product.name}
                description={[
                  scan.product.brand,
                  formatRelativeDay(scan.scannedAt, i18n.language, {
                    today: t('history.today'),
                    yesterday: t('history.yesterday'),
                  }),
                ]
                  .filter(Boolean)
                  .join(' · ')}
                trailing={<VerdictBadge kind={scan.verdict.kind} />}
                onPress={() => {
                  close();
                  onPick(scan);
                }}
              />
              {index < scans.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </Sheet>
  );
});

const styles = StyleSheet.create({
  empty: { paddingVertical: rs(spacing.lg) },
  list: { maxHeight: 420, marginBottom: rs(spacing.sm) },
});
