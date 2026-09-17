import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, StyleSheet, View } from 'react-native';

import { VerdictBadge } from '@/components/app/VerdictBadge';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  SectionHeader,
  SettingsRow,
  SettingsSection,
  Skeleton,
  Text,
  type IconName,
} from '@/components/ui';
import { useHistory } from '@/features/history/useHistory';
import { ingredientRows, type IngredientStatus } from '@/features/scan/ingredients';
import { VERDICT_THEME } from '@/features/scan/verdictTheme';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { borders, colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';
import { normalize } from '@/utils/text';

type Slot = 'a' | 'b';
type CellStatus = IngredientStatus | 'absent';

const STATUS_ICON: Record<CellStatus, { icon: IconName; color: ColorToken }> = {
  contains: { icon: 'closeCircle', color: 'danger' },
  may_contain: { icon: 'warning', color: 'warning' },
  cross_contact: { icon: 'warning', color: 'warning' },
  unclear: { icon: 'helpCircle', color: 'neutral' },
  clear: { icon: 'checkCircle', color: 'successBright' },
  absent: { icon: 'minus', color: 'textPlaceholder' },
};

/** Two products side by side with an ingredient-by-ingredient comparison and share. */
export default function CompareScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ a?: string; b?: string }>();
  const profile = useProfileStore(selectActiveProfile);
  const history = useHistory(profile?.id ?? null);
  const [slotA, setSlotA] = useState<string | null>(params.a ?? null);
  const [slotB, setSlotB] = useState<string | null>(params.b ?? null);
  const [selected, setSelected] = useState<Slot>(params.a && !params.b ? 'b' : 'a');
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const scans = useMemo(() => history.data ?? [], [history.data]);
  const byId = useMemo(() => new Map(scans.map((scan) => [scan.id, scan])), [scans]);
  const a = slotA ? (byId.get(slotA) ?? null) : null;
  const b = slotB ? (byId.get(slotB) ?? null) : null;

  /** Recent products, one per product id, newest first. */
  const recent = useMemo(() => {
    const seen = new Set<string>();
    return scans.filter((scan) => {
      if (seen.has(scan.product.id)) return false;
      seen.add(scan.product.id);
      return true;
    });
  }, [scans]);

  const pick = (scan: ScanResult) => {
    if (selected === 'a') {
      setSlotA(scan.id);
      setSelected('b');
    } else {
      setSlotB(scan.id);
      setSelected('a');
    }
  };

  const comparison = useMemo(() => {
    if (!a || !b) return [];
    const rowsA = new Map(ingredientRows(a).map((row) => [normalize(row.name), row]));
    const rowsB = new Map(ingredientRows(b).map((row) => [normalize(row.name), row]));
    const keys = Array.from(new Set([...rowsA.keys(), ...rowsB.keys()]));
    return keys
      .map((key) => {
        const rowA = rowsA.get(key);
        const rowB = rowsB.get(key);
        return {
          key,
          name: rowA?.name ?? rowB?.name ?? key,
          a: (rowA?.status ?? 'absent') as CellStatus,
          b: (rowB?.status ?? 'absent') as CellStatus,
        };
      })
      .filter((row) => !onlyDifferences || row.a !== row.b);
  }, [a, b, onlyDifferences]);

  const share = () => {
    if (!a || !b) return;
    void Share.share({
      message: t('compare.shareMessage', {
        a: a.product.name,
        verdictA: t(VERDICT_THEME[a.verdict.kind].titleKey),
        b: b.product.name,
        verdictB: t(VERDICT_THEME[b.verdict.kind].titleKey),
      }),
    });
  };

  const ready = !!a && !!b;

  return (
    <Screen
      header={<NavHeader title={t('compare.title')} />}
      footer={
        ready ? (
          <Button
            title={t('compare.share')}
            onPress={share}
            haptic="medium"
            testID="compare-share"
          />
        ) : undefined
      }
      testID="compare"
    >
      <View style={styles.slots}>
        <SlotCard slot="a" scan={a} selected={selected === 'a'} onPress={() => setSelected('a')} />
        <SlotCard slot="b" scan={b} selected={selected === 'b'} onPress={() => setSelected('b')} />
      </View>

      <SectionHeader title={t('compare.recent')} variant="label" style={styles.recentHeader} />
      {history.isLoading ? (
        <View style={styles.thumbRow}>
          <Skeleton width={rs(64)} height={rs(64)} radius={radii.sm} />
          <Skeleton width={rs(64)} height={rs(64)} radius={radii.sm} />
          <Skeleton width={rs(64)} height={rs(64)} radius={radii.sm} />
        </View>
      ) : recent.length === 0 ? (
        <Text variant="small" color="textMuted">
          {t('compare.noRecent')}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {recent.map((scan) => {
            const inUse = scan.id === slotA || scan.id === slotB;
            return (
              <PressableScale
                key={scan.id}
                onPress={() => pick(scan)}
                haptic="selection"
                pressedScale={0.94}
                accessibilityRole="button"
                accessibilityLabel={scan.product.name}
                accessibilityState={{ selected: inUse }}
                style={[styles.thumb, inUse ? styles.thumbInUse : null]}
                testID={`compare-thumb-${scan.id}`}
              >
                <Thumb scan={scan} />
              </PressableScale>
            );
          })}
        </ScrollView>
      )}

      {ready ? (
        <>
          <SettingsSection style={styles.toggle}>
            <SettingsRow
              label={t('compare.onlyDifferences')}
              icon="filter"
              toggle={{ value: onlyDifferences, onChange: setOnlyDifferences }}
            />
          </SettingsSection>
          <SectionHeader title={t('compare.ingredients')} />
          <Card variant="outlined" padding={spacing.sm}>
            {comparison.length === 0 ? (
              <Text variant="body" color="textMuted" style={styles.same}>
                {t('compare.same')}
              </Text>
            ) : (
              comparison.map((row, index) => (
                <View key={row.key}>
                  <View
                    style={styles.compareRow}
                    accessible
                    accessibilityLabel={t('compare.rowA11y', {
                      name: row.name,
                      a: statusLabel(row.a, t),
                      b: statusLabel(row.b, t),
                    })}
                  >
                    <Text
                      variant="body"
                      color="textBody"
                      style={styles.compareName}
                      numberOfLines={2}
                    >
                      {row.name}
                    </Text>
                    <View style={styles.cell}>
                      <Icon
                        name={STATUS_ICON[row.a].icon}
                        size={rs(22)}
                        color={STATUS_ICON[row.a].color}
                      />
                    </View>
                    <View style={styles.cell}>
                      <Icon
                        name={STATUS_ICON[row.b].icon}
                        size={rs(22)}
                        color={STATUS_ICON[row.b].color}
                      />
                    </View>
                  </View>
                  {index < comparison.length - 1 ? <Divider /> : null}
                </View>
              ))
            )}
          </Card>
        </>
      ) : (
        <EmptyState
          icon="compare"
          title={t('compare.pickTwo')}
          body={t('compare.pickTwoBody')}
          compact
        />
      )}
    </Screen>
  );
}

function statusLabel(status: CellStatus, t: (key: string) => string): string {
  if (status === 'absent') return t('compare.absent');
  if (status === 'clear') return t('result.reason_clear');
  return t(`verdict.kind_${status}`);
}

function Thumb({ scan }: { scan: ScanResult }) {
  const { product } = scan;
  if (product.imageUri)
    return (
      <Image
        source={{ uri: product.imageUri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
    );
  if (product.blurhash)
    return (
      <Image
        source={{ blurhash: product.blurhash }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
    );
  return <Icon name="barcode" size={rs(22)} color="textMuted" outline />;
}

function SlotCard({
  slot,
  scan,
  selected,
  onPress,
}: {
  slot: Slot;
  scan: ScanResult | null;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const label = slot === 'a' ? t('compare.slotA') : t('compare.slotB');
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${scan?.product.name ?? t('compare.slotEmpty')}. ${t('compare.selectSlot', { slot: label })}`}
      accessibilityState={{ selected }}
      style={[styles.slot, selected ? styles.slotSelected : null]}
      testID={`compare-slot-${slot}`}
    >
      <View style={styles.slotImage}>
        {scan ? <Thumb scan={scan} /> : <Icon name="plus" size={rs(28)} color="textMuted" />}
      </View>
      <Text variant="label" color={scan ? 'text' : 'textMuted'} numberOfLines={2} align="center">
        {scan?.product.name ?? t('compare.slotEmpty')}
      </Text>
      {scan ? <VerdictBadge kind={scan.verdict.kind} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  slots: { flexDirection: 'row', gap: rs(spacing.sm), marginTop: rs(spacing.md) },
  slot: {
    flex: 1,
    alignItems: 'center',
    gap: rs(spacing.xs),
    padding: rs(spacing.md),
    borderRadius: radii.lg,
    borderWidth: borders.selected,
    borderColor: colors.border,
    backgroundColor: colors.background,
    minHeight: rs(190),
  },
  slotSelected: { borderColor: colors.primary },
  slotImage: {
    width: rs(88),
    height: rs(88),
    borderRadius: radii.card,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentHeader: { marginTop: rs(spacing.xl) },
  thumbRow: { flexDirection: 'row', gap: rs(spacing.xs) },
  thumb: {
    width: rs(64),
    height: rs(64),
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borders.selected,
    borderColor: 'transparent',
  },
  thumbInUse: { borderColor: colors.primary },
  toggle: { marginTop: rs(spacing.xl), marginBottom: rs(spacing.md) },
  same: { padding: rs(spacing.sm) },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: rs(52),
    paddingHorizontal: rs(spacing.xs),
  },
  compareName: { flex: 1 },
  cell: { width: rs(56), alignItems: 'center' },
});
