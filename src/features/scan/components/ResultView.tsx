import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View, useWindowDimensions, type ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LabelTextCard } from './LabelTextCard';
import { ResultMoreSheet } from './ResultMoreSheet';
import {
  dietCompatibility,
  flaggedNames,
  ingredientRows,
  triggerCounts,
  type IngredientStatus,
} from '../ingredients';
import { VERDICT_THEME } from '../verdictTheme';
import { SafetyNotice } from '@/components/app/SafetyNotice';
import { VerdictBadge } from '@/components/app/VerdictBadge';
import { VerdictCard } from '@/components/app/VerdictCard';
import {
  Avatar,
  Button,
  Card,
  Divider,
  HeaderButton,
  Icon,
  ListRow,
  PressableScale,
  Screen,
  SectionHeader,
  showToast,
  StatCard,
  Text,
  useSheetRef,
  type IconName,
} from '@/components/ui';
import { useToggleSaved } from '@/features/history/useHistory';
import { evaluateProduct } from '@/services';
import { useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult, UserProfile } from '@/types';
import { formatTime } from '@/utils/date';

export type ResultVariant = 'food' | 'barcode' | 'label';

export function isResultVariant(value: unknown): value is ResultVariant {
  return value === 'food' || value === 'barcode' || value === 'label';
}

export interface ResultViewProps {
  scan: ScanResult;
  profile: UserProfile | null;
  variant: ResultVariant;
  /** Bottom buttons: the result screen passes Fix results + Done, product detail its own. */
  footer: ReactNode;
  onBack: () => void;
  /** Overrides the default save toggle (product detail creates a scan record first). */
  onToggleSave?: () => void;
  /** Replaces the "Scanned at" line (product detail for an unscanned product). */
  timeLabel?: string;
  testID?: string;
}

const STATUS_ICON: Record<IngredientStatus, { icon: IconName; color: ColorToken }> = {
  contains: { icon: 'closeCircle', color: 'danger' },
  may_contain: { icon: 'warning', color: 'warning' },
  cross_contact: { icon: 'warning', color: 'warning' },
  unclear: { icon: 'helpCircle', color: 'neutral' },
  clear: { icon: 'checkCircle', color: 'successBright' },
};

/**
 * Shared result layout (scan result and product detail): hero image with back,
 * share and more buttons, a card with bookmark, time and name, the floating
 * verdict card, three tiles, diet row, ingredient list, family members, the
 * scanned text (label variant) and the safety notice.
 */
export function ResultView({
  scan,
  profile,
  variant,
  footer,
  onBack,
  onToggleSave,
  timeLabel,
  testID,
}: ResultViewProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const moreRef = useSheetRef();
  const [ingredientsY, setIngredientsY] = useState(0);
  const toggleSaved = useToggleSaved();
  const profiles = useProfileStore((state) => state.profiles);

  const { product, verdict } = scan;
  const theme = VERDICT_THEME[verdict.kind];
  const rows = useMemo(() => ingredientRows(scan), [scan]);
  const counts = useMemo(() => triggerCounts(verdict), [verdict]);
  const diet = useMemo(() => dietCompatibility(verdict, profile), [profile, verdict]);
  const names = useMemo(() => flaggedNames(verdict), [verdict]);
  const members = useMemo(
    () =>
      profiles.length > 1
        ? profiles.map((member) => ({
            member,
            kind:
              member.id === scan.profileId ? verdict.kind : evaluateProduct(product, member).kind,
          }))
        : [],
    [product, profiles, scan.profileId, verdict.kind],
  );

  const summary =
    verdict.kind === 'safe'
      ? t('result.summary_safe')
      : verdict.kind === 'unsafe'
        ? t('result.summary_unsafe', { names: names.join(', ') })
        : verdict.kind === 'caution'
          ? names.length
            ? t('result.summary_caution', { names: names.join(', ') })
            : t('result.summary_caution_unclear')
          : t('result.summary_unknown');

  const scrollToIngredients = useCallback(() => {
    scrollRef.current?.scrollTo({ y: Math.max(0, ingredientsY - rs(spacing.md)), animated: true });
  }, [ingredientsY]);

  const defaultSave = useCallback(() => {
    const next = !scan.saved;
    toggleSaved.mutate(
      { id: scan.id, saved: next },
      {
        onSuccess: () =>
          showToast({
            message: next ? t('result.savedToast') : t('result.unsavedToast'),
            icon: 'bookmark',
          }),
      },
    );
  }, [scan.id, scan.saved, t, toggleSaved]);
  const save = onToggleSave ?? defaultSave;

  const share = useCallback(() => {
    void Share.share({
      title: t('result.shareTitle'),
      message: t('result.shareMessage', { name: product.name, verdict: t(theme.titleKey) }),
    });
  }, [product.name, t, theme.titleKey]);

  const heroHeight = Math.max(280, Math.round(height * 0.42));
  const headerTop = insets.top + rs(layout.headerTop);

  return (
    <Screen hero bleed scrollRef={scrollRef} footer={footer} testID={testID}>
      <View style={[styles.hero, { height: heroHeight, backgroundColor: colors[theme.tint] }]}>
        {product.imageUri ? (
          <Image
            source={{ uri: product.imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            placeholder={product.blurhash ? { blurhash: product.blurhash } : undefined}
            accessibilityLabel={product.name}
          />
        ) : product.blurhash ? (
          <Image
            source={{ blurhash: product.blurhash }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel={t('result.noImage')}
          />
        ) : (
          <View style={styles.heroPlaceholder} accessibilityLabel={t('result.noImage')}>
            <Icon
              name={variant === 'barcode' ? 'barcode' : 'restaurant'}
              size={rs(72)}
              color={theme.color}
              outline
            />
          </View>
        )}
        <View style={[styles.heroHeader, { top: headerTop }]}>
          <HeaderButton
            icon="arrowBack"
            label={t('a11y.backButton')}
            onDark
            onPress={onBack}
            testID="result-back"
          />
          <View style={styles.heroActions}>
            <HeaderButton
              icon="share"
              label={t('result.share')}
              onDark
              onPress={share}
              testID="result-share"
            />
            <HeaderButton
              icon="more"
              label={t('result.more')}
              onDark
              onPress={() => moreRef.current?.present()}
              testID="result-more"
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.metaRow}>
          <PressableScale
            onPress={save}
            haptic="light"
            pressedScale={0.9}
            accessibilityRole="button"
            accessibilityLabel={scan.saved ? t('result.unsave') : t('result.save')}
            accessibilityState={{ selected: scan.saved }}
            hitSlop={8}
            style={styles.bookmark}
            testID="result-bookmark"
          >
            <Icon name="bookmark" size={rs(22)} color="text" outline={!scan.saved} />
          </PressableScale>
          <Text variant="small" color="textMuted">
            {timeLabel ??
              t('result.scannedAt', { time: formatTime(scan.scannedAt, i18n.language) })}
          </Text>
        </View>
        <Text variant="sectionTitle" color="text" accessibilityRole="header">
          {product.name}
        </Text>
        {product.brand || (variant === 'barcode' && product.barcode) ? (
          <Text variant="body" color="textMuted">
            {[
              product.brand,
              variant === 'barcode' && product.barcode
                ? t('result.barcode', { code: product.barcode })
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        ) : null}

        <VerdictCard
          kind={verdict.kind}
          reason={summary}
          floating
          style={styles.verdict}
          testID="result-verdict"
        />

        <View style={styles.tiles}>
          <StatCard
            layout="tile"
            value={counts.contains}
            label={t('result.contains')}
            ring={{ progress: 0, color: 'danger', icon: 'closeCircle' }}
            onPress={scrollToIngredients}
            accessibilityLabel={`${t('result.contains')}: ${counts.contains}. ${t('result.tilesHint')}`}
            style={styles.tile}
          />
          <StatCard
            layout="tile"
            value={counts.mayContain}
            label={t('result.mayContain')}
            ring={{ progress: 0, color: 'warning', icon: 'warning' }}
            onPress={scrollToIngredients}
            accessibilityLabel={`${t('result.mayContain')}: ${counts.mayContain}. ${t('result.tilesHint')}`}
            style={styles.tile}
          />
          <StatCard
            layout="tile"
            value={profile?.restrictions.length ?? 0}
            label={t('result.checkedAgainst')}
            ring={{ progress: 0, color: 'success', icon: 'shieldCheck' }}
            onPress={scrollToIngredients}
            accessibilityLabel={`${t('result.checkedAgainst')}: ${profile?.restrictions.length ?? 0}. ${t('result.tilesHint')}`}
            style={styles.tile}
          />
        </View>

        {diet ? (
          <View
            style={styles.dietRow}
            accessible
            accessibilityLabel={
              diet.compatible
                ? t('result.dietCompatible', { diet: t(`diet.${diet.diet}`) })
                : t('result.dietNotCompatible', {
                    diet: t(`diet.${diet.diet}`),
                    matched: diet.matched.join(', '),
                  })
            }
          >
            <Icon
              name={diet.compatible ? 'checkCircle' : 'closeCircle'}
              size={rs(22)}
              color={diet.compatible ? 'successBright' : 'danger'}
            />
            <View style={styles.dietText}>
              <Text variant="small" color="textMuted">
                {t('result.diet')}
              </Text>
              <Text variant="label" color="text">
                {diet.compatible
                  ? t('result.dietCompatible', { diet: t(`diet.${diet.diet}`) })
                  : t('result.dietNotCompatible', {
                      diet: t(`diet.${diet.diet}`),
                      matched: diet.matched.join(', '),
                    })}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {variant === 'label' && scan.labelText ? (
        <View style={styles.section}>
          <LabelTextCard
            title={scan.mode === 'menu' ? t('result.menuText') : t('result.scannedText')}
            hint={t('result.scannedTextHint')}
            text={scan.labelText}
            triggers={verdict.triggers}
          />
        </View>
      ) : null}

      <View
        style={styles.section}
        onLayout={(event) => setIngredientsY(event.nativeEvent.layout.y)}
      >
        <SectionHeader
          title={t('result.ingredients')}
          actionLabel={t('result.addMore')}
          actionIcon="plus"
          onAction={() => router.push({ pathname: '/scan/fix/[id]', params: { id: scan.id } })}
        />
        <Card variant="outlined" padding={spacing.xs}>
          {rows.length === 0 ? (
            <Text variant="body" color="textMuted" style={styles.emptyRows}>
              {t('result.noIngredients')}
            </Text>
          ) : (
            rows.map((row, index) => {
              const status = STATUS_ICON[row.status];
              const reason =
                row.status === 'clear'
                  ? t('result.reason_clear')
                  : t(`result.reason_${row.status}`, {
                      name: row.trigger?.ingredientName ?? row.name,
                    });
              const description = row.fromMayContain
                ? `${t('result.mayContain')} · ${reason}`
                : reason;
              const ingredientId = row.trigger?.ingredientId;
              const canOpen =
                !!ingredientId && !ingredientId.startsWith('diet:') && ingredientId !== 'unclear';
              return (
                <View key={`${row.name}-${index}`}>
                  <ListRow
                    label={row.name}
                    description={description}
                    icon={status.icon}
                    iconColor={status.color}
                    iconOutline={false}
                    chevron={canOpen}
                    onPress={
                      canOpen
                        ? () =>
                            router.push({
                              pathname: '/ingredients/[id]',
                              params: { id: ingredientId },
                            })
                        : undefined
                    }
                    style={styles.row}
                    testID={`ingredient-${index}`}
                  />
                  {index < rows.length - 1 ? (
                    <Divider inset={rs(spacing.md + 24 + spacing.md)} />
                  ) : null}
                </View>
              );
            })
          )}
        </Card>
      </View>

      {members.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('result.worksFor')} />
          <Card variant="outlined" padding={spacing.md}>
            {members.map(({ member, kind }, index) => (
              <View key={member.id}>
                <View style={styles.memberRow}>
                  <Avatar name={member.name} color={member.color} size={40} bordered={false} />
                  <Text variant="label" color="text" style={styles.memberName} numberOfLines={1}>
                    {member.name}
                  </Text>
                  <VerdictBadge kind={kind} />
                </View>
                {index < members.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <SafetyNotice />
        <Button
          title={t('result.colorsLink')}
          variant="text"
          onPress={() => router.push('/settings/verdict-colors')}
        />
      </View>

      <ResultMoreSheet
        ref={moreRef}
        saved={scan.saved}
        onSave={save}
        onCompare={() => router.push({ pathname: '/compare', params: { a: scan.id } })}
        onShare={share}
        onReport={() => router.push({ pathname: '/scan/report/[id]', params: { id: scan.id } })}
        onLogReaction={() =>
          router.push({ pathname: '/reactions/new', params: { scanId: scan.id } })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: 'hidden' },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroHeader: {
    position: 'absolute',
    left: rs(layout.screenPaddingH),
    right: rs(layout.screenPaddingH),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroActions: { flexDirection: 'row', gap: rs(spacing.xs) },
  card: {
    marginTop: -radii.xl,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: rs(layout.screenPaddingH),
    paddingTop: rs(spacing.lg),
    gap: rs(spacing.xs),
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
  bookmark: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  verdict: { marginTop: rs(spacing.sm) },
  tiles: { flexDirection: 'row', gap: rs(spacing.xs), marginTop: rs(spacing.sm) },
  tile: { flex: 1 },
  dietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    marginTop: rs(spacing.sm),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  dietText: { flex: 1 },
  section: { paddingHorizontal: rs(layout.screenPaddingH), marginTop: rs(spacing.xl) },
  row: { paddingHorizontal: rs(spacing.sm) },
  emptyRows: { padding: rs(spacing.sm) },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm), minHeight: rs(56) },
  memberName: { flex: 1 },
});
