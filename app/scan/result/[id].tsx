import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { SafetyNotice } from '@/components/app/SafetyNotice';
import { VerdictBadge } from '@/components/app/VerdictBadge';
import {
  BackButton,
  Button,
  Card,
  Divider,
  ErrorState,
  Icon,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { useScan, useToggleSaved } from '@/features/history/useHistory';
import { VERDICT_THEME } from '@/features/scan/verdictTheme';
import { ingredientById } from '@/mocks/ingredients';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

/**
 * Scan result: verdict header with icon + text (never colour alone), the
 * ingredients that triggered it and why, what was checked and cleared, the
 * label text, save-as-safe and the safety notice.
 */
export default function ScanResultScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scan = useScan(id);
  const toggleSaved = useToggleSaved();
  const profile = useProfileStore(selectActiveProfile);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home' as Href));

  if (scan.isLoading) {
    return (
      <Screen header={<BackButton onPress={back} label={t('a11y.backButton')} />}>
        <Skeleton height={rs(140)} radius={radii.lg} style={styles.skeleton} />
        <Skeleton height={rs(120)} radius={radii.lg} style={styles.skeleton} />
        <Skeleton height={rs(200)} radius={radii.lg} style={styles.skeleton} />
      </Screen>
    );
  }
  if (scan.isError || !scan.data) {
    return (
      <Screen header={<BackButton onPress={back} label={t('a11y.backButton')} />}>
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void scan.refetch()}
        />
      </Screen>
    );
  }

  const result = scan.data;
  const theme = VERDICT_THEME[result.verdict.kind];
  const profileName = profile && profile.profileFor !== 'myself' ? profile.name : undefined;
  const cleared = result.verdict.clearedIngredientIds
    .map(
      (ingredientId) =>
        profile?.customIngredients[ingredientId]?.name ?? ingredientById(ingredientId)?.name,
    )
    .filter((name): name is string => !!name);

  return (
    <Screen
      header={<BackButton onPress={back} label={t('a11y.backButton')} />}
      footer={
        <View style={styles.footer}>
          {result.verdict.kind === 'safe' ? (
            <Button
              title={result.saved ? t('verdict.saved') : t('verdict.saveFood')}
              variant={result.saved ? 'secondary' : 'primary'}
              leading={
                <Icon
                  name="bookmark"
                  size={rs(22)}
                  color={result.saved ? 'text' : 'onPrimary'}
                  outline={!result.saved}
                />
              }
              onPress={() => toggleSaved.mutate({ id: result.id, saved: !result.saved })}
              loading={toggleSaved.isPending}
              haptic="medium"
            />
          ) : null}
          <Button
            title={t('verdict.scanAgain')}
            variant={result.verdict.kind === 'safe' ? 'text' : 'primary'}
            onPress={() => router.replace('/scan' as Href)}
          />
        </View>
      }
    >
      <View
        style={[styles.hero, { backgroundColor: colors[theme.tint] }]}
        accessible
        accessibilityLabel={`${t(theme.titleKey)}. ${t(theme.bodyKey)}`}
      >
        <View style={[styles.heroIcon, { backgroundColor: colors[theme.color] }]}>
          <Icon
            name={
              theme.icon === 'checkCircle'
                ? 'check'
                : theme.icon === 'closeCircle'
                  ? 'close'
                  : theme.icon === 'warning'
                    ? 'warning'
                    : 'question'
            }
            size={rs(30)}
            color="onPrimary"
          />
        </View>
        <Text variant="titleLg" color={theme.color} align="center" accessibilityRole="header">
          {profileName && (result.verdict.kind === 'safe' || result.verdict.kind === 'unsafe')
            ? t(`${theme.titleKey}_other`, { name: profileName })
            : t(theme.titleKey)}
        </Text>
        <Text variant="body" color="textBody" align="center" style={styles.heroBody}>
          {t(theme.bodyKey)}
        </Text>
        {profile ? (
          <Text variant="small" color="textMuted" align="center">
            {t('verdict.checkedFor', { name: profile.name })}
          </Text>
        ) : null}
      </View>

      <View style={styles.product}>
        <View style={styles.thumb}>
          {result.product.imageUri ? (
            <Image
              source={{ uri: result.product.imageUri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : result.product.blurhash ? (
            <Image
              source={{ blurhash: result.product.blurhash }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <Icon name="barcode" size={rs(24)} color="textMuted" outline />
          )}
        </View>
        <View style={styles.productText}>
          <Text variant="sectionTitle" color="text">
            {result.product.name}
          </Text>
          {result.product.brand ? (
            <Text variant="body" color="textMuted">
              {result.product.brand}
            </Text>
          ) : null}
        </View>
        <Button
          title={t('verdict.viewProduct')}
          variant="text"
          onPress={() => router.push(`/product/${result.id}` as Href)}
          style={styles.detailLink}
        />
      </View>

      {result.verdict.triggers.length > 0 ? (
        <Card title={t('verdict.triggers')} style={styles.card}>
          {result.verdict.triggers.map((trigger, index) => (
            <View key={`${trigger.ingredientId}-${trigger.kind}`}>
              <View style={styles.trigger}>
                <Icon
                  name={trigger.kind === 'contains' ? 'closeCircle' : 'warning'}
                  size={rs(22)}
                  color={trigger.kind === 'contains' ? 'danger' : 'warning'}
                />
                <View style={styles.triggerText}>
                  <Text variant="label" color="text">
                    {trigger.ingredientName}
                    <Text variant="body" color="textMuted">
                      {'  '}
                      {t(`verdict.kind_${trigger.kind}`)}
                    </Text>
                  </Text>
                  {trigger.matchedText ? (
                    <Text variant="small" color="textMuted">
                      {t('verdict.matched', { text: trigger.matchedText })} ·{' '}
                      {t(`severity.${trigger.severity}`)}
                    </Text>
                  ) : null}
                </View>
              </View>
              {index < result.verdict.triggers.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </Card>
      ) : null}

      {cleared.length > 0 ? (
        <Card title={t('verdict.cleared')} style={styles.card}>
          <View style={styles.clearedRow}>
            <Icon name="checkCircle" size={rs(22)} color="successBright" />
            <Text variant="body" color="textBody" style={styles.triggerText}>
              {cleared.join(', ')}
            </Text>
          </View>
        </Card>
      ) : null}

      <Card title={t('verdict.ingredientsList')} style={styles.card}>
        <Text variant="body" color="textBody">
          {result.product.ingredientsText}
        </Text>
        {result.product.allergenStatement ? (
          <>
            <Text variant="bodyStrong" color="text" style={styles.statementTitle}>
              {t('verdict.allergenStatement')}
            </Text>
            <Text variant="body" color="textBody">
              {result.product.allergenStatement}
            </Text>
          </>
        ) : null}
        <VerdictBadge kind={result.verdict.kind} size="md" name={profileName} />
      </Card>

      <View style={styles.notice}>
        <SafetyNotice />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  skeleton: { marginTop: rs(spacing.md) },
  hero: {
    marginTop: rv(spacing.md),
    padding: rs(spacing.xl),
    borderRadius: radii.lg,
    alignItems: 'center',
    gap: rs(spacing.xs),
  },
  heroIcon: {
    width: rs(56),
    height: rs(56),
    borderRadius: rs(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(spacing.xs),
  },
  heroBody: { maxWidth: 320 },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    marginTop: rv(spacing.xl),
    flexWrap: 'wrap',
  },
  thumb: {
    width: rs(56),
    height: rs(56),
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productText: { flex: 1, minWidth: 140 },
  detailLink: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  card: { marginTop: rv(spacing.md) },
  trigger: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(spacing.sm),
    paddingVertical: rs(spacing.sm),
  },
  triggerText: { flex: 1, gap: 2 },
  clearedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: rs(spacing.sm) },
  statementTitle: { marginTop: rs(spacing.md), marginBottom: 4 },
  notice: { marginTop: rv(spacing.md) },
  footer: { gap: spacing.xs },
});
