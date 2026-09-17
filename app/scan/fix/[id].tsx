import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  Chip,
  confirm,
  Divider,
  ErrorState,
  Icon,
  ListRow,
  NavHeader,
  PressableScale,
  Screen,
  SearchInput,
  showToast,
  Skeleton,
  Text,
  TextField,
} from '@/components/ui';
import { useScan, useUpdateScan } from '@/features/history/useHistory';
import { useDebounced } from '@/features/onboarding/useIngredientSearch';
import { parseIngredients } from '@/features/scan/ingredients';
import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Product, ScanResult } from '@/types';
import { normalize } from '@/utils/text';

interface Item {
  name: string;
  unsure: boolean;
}

function itemsFrom(product: Product): Item[] {
  return [
    ...parseIngredients(product.ingredientsText).map((name) => ({ name, unsure: false })),
    ...product.mayContain.map((name) => ({ name, unsure: true })),
  ];
}

/** Edit a result's name and ingredients; saving re-runs the verdict against the profile. */
export default function FixResultsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scan = useScan(id);
  const update = useUpdateScan();
  const profile = useProfileStore(selectActiveProfile);

  if (scan.isLoading || (!scan.data && !scan.isError)) {
    return (
      <Screen header={<NavHeader title={t('fix.title')} />}>
        <Skeleton height={rs(60)} radius={radii.card} style={styles.gap} />
        <Skeleton height={rs(240)} radius={radii.lg} style={styles.gap} />
      </Screen>
    );
  }
  if (scan.isError || !scan.data || !profile) {
    return (
      <Screen header={<NavHeader title={t('fix.title')} />}>
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void scan.refetch()}
        />
      </Screen>
    );
  }
  return (
    <FixForm
      scan={scan.data}
      profileId={profile.id}
      saving={update.isPending}
      onSave={update.mutateAsync}
    />
  );
}

interface FixFormProps {
  scan: ScanResult;
  profileId: string;
  saving: boolean;
  onSave: (input: {
    id: string;
    patch: { product: Product; verdict: ScanResult['verdict'] };
  }) => Promise<ScanResult>;
}

function FixForm({ scan, profileId, saving, onSave }: FixFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(
    (state) => state.profiles.find((p) => p.id === profileId) ?? null,
  );
  const [name, setName] = useState(scan.product.name);
  const [items, setItems] = useState<Item[]>(() => itemsFrom(scan.product));
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 180);
  const trimmed = debounced.trim();

  const suggestions = useQuery({
    queryKey: queryKeys.ingredients.search(trimmed),
    queryFn: () => getServices().ingredients.search(trimmed, 6),
    enabled: trimmed.length >= 2,
  });

  const initial = useMemo(
    () => JSON.stringify({ name: scan.product.name, items: itemsFrom(scan.product) }),
    [scan.product],
  );
  const dirty = JSON.stringify({ name, items }) !== initial;

  const leave = useCallback(async () => {
    if (!dirty) {
      router.back();
      return;
    }
    const discard = await confirm({
      title: t('fix.discardTitle'),
      message: t('fix.discardBody'),
      confirmLabel: t('fix.discard'),
      cancelLabel: t('fix.keepEditing'),
      destructive: true,
      icon: 'trash',
    });
    if (discard) router.back();
  }, [dirty, router, t]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      void leave();
      return true;
    });
    return () => sub.remove();
  }, [leave]);

  const addItem = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    if (items.some((item) => normalize(item.name) === normalize(clean))) {
      setQuery('');
      return;
    }
    setItems((current) => [...current, { name: clean, unsure: false }]);
    setQuery('');
  };

  const save = async () => {
    if (!profile) return;
    const product: Product = {
      ...scan.product,
      name: name.trim() || scan.product.name,
      ingredientsText: items
        .filter((item) => !item.unsure)
        .map((item) => item.name)
        .join(', '),
      mayContain: items.filter((item) => item.unsure).map((item) => item.name),
    };
    try {
      const verdict = await getServices().scan.verdictFor(product, profile);
      await onSave({ id: scan.id, patch: { product, verdict } });
      showToast({ message: t('fix.saved'), icon: 'checkCircle' });
      router.back();
    } catch {
      showToast({ message: t('states.errorTitle'), icon: 'alert' });
    }
  };

  const exactMatch = (suggestions.data ?? []).some(
    (ingredient) => normalize(ingredient.name) === normalize(trimmed),
  );

  return (
    <Screen
      header={<NavHeader title={t('fix.title')} onLeftPress={() => void leave()} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('fix.save')}
          onPress={() => void save()}
          disabled={!dirty || items.length === 0}
          loading={saving}
          haptic="medium"
          testID="fix-save"
        />
      }
      testID="fix-results"
    >
      <TextField
        label={t('fix.name')}
        value={name}
        onChangeText={setName}
        placeholder={t('fix.namePlaceholder')}
        autoCapitalize="words"
        returnKeyType="done"
        style={styles.field}
        testID="fix-name"
      />
      <Text variant="label" color="text" style={styles.sectionLabel}>
        {t('fix.ingredients')}
      </Text>
      <Card variant="outlined" padding={spacing.xs}>
        {items.length === 0 ? (
          <Text variant="body" color="textMuted" style={styles.empty}>
            {t('fix.empty')}
          </Text>
        ) : (
          items.map((item, index) => (
            <View key={`${item.name}-${index}`}>
              <ListRow
                label={item.name}
                description={item.unsure ? t('fix.unsure') : undefined}
                icon={item.unsure ? 'helpCircle' : 'checkCircle'}
                iconColor={item.unsure ? 'warning' : 'successBright'}
                iconOutline={false}
                style={styles.row}
                trailing={
                  <View style={styles.rowActions}>
                    <PressableScale
                      onPress={() =>
                        setItems((current) =>
                          current.map((entry, i) =>
                            i === index ? { ...entry, unsure: !entry.unsure } : entry,
                          ),
                        )
                      }
                      haptic="selection"
                      accessibilityRole="button"
                      accessibilityLabel={
                        item.unsure
                          ? t('fix.markSure', { name: item.name })
                          : t('fix.markUnsure', { name: item.name })
                      }
                      accessibilityState={{ selected: item.unsure }}
                      hitSlop={6}
                      style={[styles.rowButton, item.unsure ? styles.rowButtonActive : null]}
                    >
                      <Text variant="small" color={item.unsure ? 'onPrimary' : 'textBody'}>
                        {t('fix.unsure')}
                      </Text>
                    </PressableScale>
                    <PressableScale
                      onPress={() => setItems((current) => current.filter((_, i) => i !== index))}
                      haptic="light"
                      accessibilityRole="button"
                      accessibilityLabel={t('fix.remove', { name: item.name })}
                      hitSlop={6}
                      style={styles.rowButton}
                    >
                      <Icon name="close" size={rs(18)} color="textBody" />
                    </PressableScale>
                  </View>
                }
              />
              {index < items.length - 1 ? <Divider /> : null}
            </View>
          ))
        )}
      </Card>
      <Text variant="small" color="textMuted" style={styles.hint}>
        {t('fix.unsureHint')}
      </Text>
      <View style={styles.add}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('fix.addPlaceholder')}
          clearLabel={t('a11y.clearSearch')}
          returnKeyType="done"
          onSubmitEditing={() => addItem(query)}
          testID="fix-add"
        />
        {trimmed.length >= 2 ? (
          <View style={styles.chips}>
            {(suggestions.data ?? []).map((ingredient) => (
              <Chip
                key={ingredient.id}
                label={ingredient.name}
                onPress={() => addItem(ingredient.name)}
              />
            ))}
            {!exactMatch ? (
              <Chip
                label={t('fix.addCustom', { name: trimmed })}
                selected
                onPress={() => addItem(trimmed)}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  field: { marginTop: rs(spacing.lg) },
  sectionLabel: { marginTop: rs(spacing.xl), marginBottom: rs(spacing.xs) },
  empty: { padding: rs(spacing.sm) },
  row: { paddingHorizontal: rs(spacing.sm) },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
  rowButton: {
    minHeight: 36,
    minWidth: 36,
    paddingHorizontal: rs(spacing.sm),
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowButtonActive: { backgroundColor: colors.warning },
  hint: { marginTop: rs(spacing.xs) },
  add: { marginTop: rs(spacing.lg), gap: rs(spacing.sm) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
});
