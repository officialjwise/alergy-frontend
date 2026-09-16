import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  BackButton,
  Button,
  Chip,
  OptionCard,
  Screen,
  SearchInput,
  Skeleton,
  Text,
} from '@/components/ui';
import { cautionQuestion, dietQuestion, goalQuestion } from '@/features/onboarding/questions';
import { useIngredientSearch } from '@/features/onboarding/useIngredientSearch';
import { useActiveProfileEdit } from '@/features/profile/useProfileEdit';
import { ingredientById } from '@/mocks/ingredients';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import type { CautionLevel, Diet, Goal, Restriction, Severity } from '@/types';
import { createId } from '@/utils/id';

type Section = 'restrictions' | 'caution' | 'diet' | 'goal';
const SEVERITIES: Severity[] = ['mild', 'moderate', 'severe', 'anaphylaxis'];

/** Edits one section of the active profile using the same option cards as onboarding. */
export default function EditProfileSectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ section: string }>();
  const section = (
    ['restrictions', 'caution', 'diet', 'goal'].includes(params.section ?? '')
      ? params.section
      : 'restrictions'
  ) as Section;
  const { profile, update } = useActiveProfileEdit();

  if (!profile) {
    return (
      <Screen header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}>
        {null}
      </Screen>
    );
  }

  if (section === 'restrictions') {
    return (
      <RestrictionsEditor
        restrictions={profile.restrictions}
        customIngredients={profile.customIngredients}
        onSave={(restrictions, custom) => {
          update({ restrictions, customIngredients: custom });
          router.back();
        }}
      />
    );
  }

  const config =
    section === 'caution' ? cautionQuestion : section === 'diet' ? dietQuestion : goalQuestion;
  const current =
    section === 'caution' ? profile.cautionLevel : section === 'diet' ? profile.diet : profile.goal;
  const titleKey =
    section === 'caution'
      ? 'profile.cautionLevel'
      : section === 'diet'
        ? 'profile.diet'
        : 'profile.goal';

  return (
    <Screen header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}>
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t(titleKey)}
      </Text>
      <View style={[styles.list, { gap: rs(config.compact ? spacing.sm : layout.cardGap) }]}>
        {config.options.map((option) => (
          <OptionCard
            key={option.value}
            label={t(option.labelKey)}
            icon={option.icon}
            selected={current === option.value}
            density={config.compact ? 'compact' : 'regular'}
            onPress={() => {
              if (section === 'caution') update({ cautionLevel: option.value as CautionLevel });
              else if (section === 'diet') update({ diet: option.value as Diet });
              else update({ goal: option.value as Goal });
              router.back();
            }}
          />
        ))}
      </View>
    </Screen>
  );
}

function RestrictionsEditor({
  restrictions,
  customIngredients,
  onSave,
}: {
  restrictions: Restriction[];
  customIngredients:
    | Record<
        string,
        {
          id: string;
          name: string;
          aliases: string[];
          category: 'other';
          icon: string;
          isCustom?: boolean;
        }
      >
    | Record<string, never>
    | Record<string, import('@/types').Ingredient>;
  onSave: (
    restrictions: Restriction[],
    custom: Record<string, import('@/types').Ingredient>,
  ) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [draft, setDraft] = useState<Restriction[]>(restrictions);
  const [custom, setCustom] = useState<Record<string, import('@/types').Ingredient>>(
    customIngredients as Record<string, import('@/types').Ingredient>,
  );
  const [query, setQuery] = useState('');
  const search = useIngredientSearch(query);
  const trimmed = query.trim();

  const has = useCallback((id: string) => draft.some((r) => r.ingredientId === id), [draft]);
  const toggle = useCallback((id: string, name: string) => {
    setDraft((current) =>
      current.some((r) => r.ingredientId === id)
        ? current.filter((r) => r.ingredientId !== id)
        : [...current, { ingredientId: id, name, severity: 'moderate' }],
    );
  }, []);
  const cycleSeverity = useCallback((id: string) => {
    setDraft((current) =>
      current.map((r) =>
        r.ingredientId === id
          ? {
              ...r,
              severity:
                SEVERITIES[(SEVERITIES.indexOf(r.severity) + 1) % SEVERITIES.length] ?? 'moderate',
            }
          : r,
      ),
    );
  }, []);
  const addCustom = useCallback(() => {
    const id = createId('custom');
    const ingredient = {
      id,
      name: trimmed,
      aliases: [trimmed.toLowerCase()],
      category: 'other' as const,
      icon: 'flask',
      isCustom: true,
    };
    setCustom((c) => ({ ...c, [id]: ingredient }));
    toggle(id, trimmed);
    setQuery('');
  }, [toggle, trimmed]);

  const results = useMemo(() => search.data ?? [], [search.data]);
  const exact = results.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());

  return (
    <Screen
      header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}
      keyboardAvoiding
      footer={
        <Button title={t('common.save')} onPress={() => onSave(draft, custom)} haptic="medium" />
      }
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('profile.restrictions')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('severity.subtitle')}
      </Text>
      <View style={styles.search}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('ingredients.searchPlaceholder')}
          clearLabel={t('a11y.clearSearch')}
        />
      </View>
      {draft.length > 0 ? (
        <View style={styles.chips}>
          {draft.map((r) => (
            <Chip
              key={r.ingredientId}
              label={`${r.name} · ${t(`severity.${r.severity}`)}`}
              onPress={() => cycleSeverity(r.ingredientId)}
              onRemove={() => toggle(r.ingredientId, r.name)}
              removeLabel={t('ingredients.removeChip', { name: r.name })}
            />
          ))}
        </View>
      ) : null}
      <Text variant="sectionLabel" color="textMuted" style={styles.sectionLabel}>
        {trimmed ? t('ingredients.results') : t('ingredients.suggested')}
      </Text>
      <View style={styles.listCompact}>
        {search.isLoading && !search.data ? <Skeleton height={rs(68)} radius={16} /> : null}
        {results.map((ingredient) => (
          <OptionCard
            key={ingredient.id}
            label={ingredient.name}
            icon={ingredient.icon as never}
            density="compact"
            role="checkbox"
            selected={has(ingredient.id)}
            onPress={() => toggle(ingredient.id, ingredient.name)}
          />
        ))}
        {trimmed.length >= 2 && !exact ? (
          <OptionCard
            label={t('ingredients.addCustom', { query: trimmed })}
            description={t('ingredients.addCustomHint')}
            icon="plus"
            density="compact"
            role="checkbox"
            selected={false}
            onPress={addCustom}
          />
        ) : null}
        {Object.values(custom)
          .filter((c) => !results.some((r) => r.id === c.id) && !trimmed)
          .map((c) => (
            <OptionCard
              key={c.id}
              label={c.name}
              icon="flask"
              density="compact"
              role="checkbox"
              selected={has(c.id)}
              onPress={() => toggle(c.id, c.name)}
            />
          ))}
      </View>
      <Text variant="small" color="textMuted" style={styles.hint}>
        {ingredientById('peanuts') ? t('severity.applyAll') : ''}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(layout.titleToSubtitle) },
  list: { marginTop: rv(layout.titleToContent) },
  search: { marginTop: rv(layout.subtitleToContent) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.sm), marginTop: rs(spacing.md) },
  sectionLabel: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.sm) },
  listCompact: { gap: rs(spacing.sm) },
  hint: { marginTop: rs(spacing.md), opacity: 0 },
});
