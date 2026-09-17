import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ScanRow } from '@/components/app/ScanRow';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  IconChip,
  NavHeader,
  Screen,
  SectionHeader,
  Skeleton,
  Text,
  type IconName,
} from '@/components/ui';
import { ICONS } from '@/components/ui/iconNames';
import { useHistory } from '@/features/history/useHistory';
import { ingredientById } from '@/mocks/ingredients';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';

/** One ingredient: what it is also called, whether it is on the list, and which scans flagged it. */
export default function IngredientDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useProfileStore(selectActiveProfile);
  const history = useHistory(profile?.id ?? null);

  const ingredient = useMemo(
    () => (id ? (profile?.customIngredients[id] ?? ingredientById(id) ?? null) : null),
    [id, profile?.customIngredients],
  );
  const restriction = profile?.restrictions.find((item) => item.ingredientId === id) ?? null;
  const flagged = useMemo(
    () =>
      (history.data ?? []).filter((scan) =>
        scan.verdict.triggers.some((trigger) => trigger.ingredientId === id),
      ),
    [history.data, id],
  );

  const open = useCallback(
    (scan: ScanResult) =>
      router.push({ pathname: '/scan/result/[id]', params: { id: scan.id, from: 'ingredient' } }),
    [router],
  );

  const icon: IconName =
    ingredient && ingredient.icon in ICONS ? (ingredient.icon as IconName) : 'flask';
  const name = ingredient?.name ?? restriction?.name ?? t('ingredientDetail.unknown');

  return (
    <Screen header={<NavHeader title={t('ingredientDetail.title')} />} testID="ingredient-detail">
      <View style={styles.hero}>
        <IconChip icon={icon} size={72} iconSize={34} />
        <Text variant="title" color="text" align="center" accessibilityRole="header">
          {name}
        </Text>
        {ingredient ? (
          <Text variant="body" color="textMuted">
            {t('ingredientDetail.category')}: {t(`ingredientCategory.${ingredient.category}`)}
          </Text>
        ) : null}
      </View>

      <Card variant="outlined" padding={spacing.md} style={styles.card}>
        <View style={styles.statusRow}>
          <View
            style={[styles.dot, { backgroundColor: restriction ? colors.danger : colors.ring }]}
          />
          <Text variant="label" color="text" style={styles.statusText}>
            {restriction ? t('ingredientDetail.onYourList') : t('ingredientDetail.notOnList')}
          </Text>
        </View>
        {restriction ? (
          <Text variant="small" color="textMuted" style={styles.severity}>
            {t('ingredientDetail.severity', { level: t(`severity.${restriction.severity}`) })}
          </Text>
        ) : null}
        <Button
          title={t('ingredientDetail.editList')}
          variant="secondary"
          size="md"
          onPress={() => router.push('/settings/restrictions')}
          style={styles.edit}
        />
      </Card>

      {ingredient && ingredient.aliases.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('ingredientDetail.alsoCalled')} variant="label" />
          <View style={styles.chips}>
            {ingredient.aliases.slice(0, 12).map((alias) => (
              <Chip key={alias} label={alias} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title={t('ingredientDetail.flaggedScans')} />
        {history.isLoading ? (
          <View style={styles.list}>
            <Skeleton height={rs(92)} radius={radii.card} />
            <Skeleton height={rs(92)} radius={radii.card} />
          </View>
        ) : history.isError ? (
          <ErrorState
            title={t('states.errorTitle')}
            body={t('states.errorBody')}
            actionLabel={t('common.retry')}
            onAction={() => void history.refetch()}
            compact
          />
        ) : flagged.length === 0 ? (
          <EmptyState
            icon="scan"
            title={t('ingredientDetail.emptyTitle')}
            body={t('ingredientDetail.emptyBody')}
            compact
          />
        ) : (
          <View style={styles.list}>
            <Text variant="small" color="textMuted">
              {t('ingredientDetail.flaggedCount', { count: flagged.length })}
            </Text>
            {flagged.map((scan) => (
              <ScanRow key={scan.id} scan={scan} onPress={open} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: rs(spacing.sm), marginTop: rs(spacing.lg) },
  card: { marginTop: rs(spacing.xl), gap: rs(spacing.xs) },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { flex: 1 },
  severity: { marginLeft: rs(18) },
  edit: { marginTop: rs(spacing.sm) },
  section: { marginTop: rs(spacing.xl) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  list: { gap: rs(spacing.sm) },
});
