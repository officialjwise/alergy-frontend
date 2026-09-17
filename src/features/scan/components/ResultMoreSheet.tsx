import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Divider, ListRow, Sheet, type SheetRef } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ResultMoreSheetProps {
  saved: boolean;
  onSave: () => void;
  onCompare: () => void;
  onShare: () => void;
  onReport: () => void;
  onLogReaction: () => void;
}

/** "More" menu on a result: Save, Compare, Share, Report a problem, Log a reaction. */
export const ResultMoreSheet = forwardRef<SheetRef, ResultMoreSheetProps>(function ResultMoreSheet(
  { saved, onSave, onCompare, onShare, onReport, onLogReaction },
  ref,
) {
  const { t } = useTranslation();
  const close = () => {
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
  };
  const run = (action: () => void) => () => {
    close();
    action();
  };
  return (
    <Sheet ref={ref} title={t('result.more')} closeLabel={t('common.close')}>
      <View style={styles.list}>
        <ListRow
          label={saved ? t('result.unsave') : t('result.save')}
          icon="bookmark"
          iconOutline={!saved}
          onPress={run(onSave)}
          chevron
        />
        <Divider />
        <ListRow label={t('result.compare')} icon="compare" onPress={run(onCompare)} chevron />
        <Divider />
        <ListRow label={t('result.share')} icon="share" onPress={run(onShare)} chevron />
        <Divider />
        <ListRow
          label={t('result.logReaction')}
          icon="reaction"
          onPress={run(onLogReaction)}
          chevron
        />
        <Divider />
        <ListRow label={t('result.report')} icon="flag" onPress={run(onReport)} chevron />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({ list: { paddingBottom: rs(spacing.sm) } });
