import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { Button, Chip, OptionCard, SearchInput, Skeleton, Text } from '@/components/ui';
import { useIngredientSearch } from '@/features/onboarding/useIngredientSearch';
import { ingredientById } from '@/mocks/ingredients';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import type { Ingredient } from '@/types';
import { createId } from '@/utils/id';

type Row =
  | { kind: 'ingredient'; ingredient: Ingredient }
  | { kind: 'custom'; query: string }
  | { kind: 'loading' };

/**
 * "Which ingredients do you avoid?": search field, removable chips for the
 * chosen ingredients, and a "Suggested" (or results) list of compact cards.
 * Typing something unknown offers to add it as a custom ingredient.
 */
export default function IngredientsScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const [query, setQuery] = useState('');
  const selected = useOnboardingStore((state) => state.answers.ingredients);
  const custom = useOnboardingStore((state) => state.answers.customIngredients);
  const addIngredient = useOnboardingStore((state) => state.addIngredient);
  const removeIngredient = useOnboardingStore((state) => state.removeIngredient);
  const { data, isLoading, isError } = useIngredientSearch(query);

  const resolve = useCallback(
    (id: string): Ingredient | undefined => custom[id] ?? ingredientById(id),
    [custom],
  );

  const trimmed = query.trim();
  const rows = useMemo<Row[]>(() => {
    if (isLoading && !data) return [{ kind: 'loading' }, { kind: 'loading' }, { kind: 'loading' }];
    const list: Row[] = (data ?? []).map((ingredient) => ({ kind: 'ingredient', ingredient }));
    const exact = (data ?? []).some((i) => i.name.toLowerCase() === trimmed.toLowerCase());
    if (trimmed.length >= 2 && !exact) list.push({ kind: 'custom', query: trimmed });
    return list;
  }, [data, isLoading, trimmed]);

  const addCustom = useCallback(
    (name: string) => {
      const existing = Object.values(custom).find(
        (i) => i.name.toLowerCase() === name.toLowerCase(),
      );
      if (existing) {
        addIngredient(existing.id);
      } else {
        const id = createId('custom');
        addIngredient(id, {
          id,
          name,
          aliases: [name.toLowerCase()],
          category: 'other',
          icon: 'flask',
          isCustom: true,
        });
      }
      setQuery('');
    },
    [addIngredient, custom],
  );

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.kind === 'loading')
        return <Skeleton height={rs(68)} radius={16} style={styles.rowGap} />;
      if (item.kind === 'custom') {
        return (
          <OptionCard
            label={t('ingredients.addCustom', { query: item.query })}
            description={t('ingredients.addCustomHint')}
            icon="plus"
            selected={false}
            onPress={() => addCustom(item.query)}
            role="checkbox"
            density="compact"
            style={styles.rowGap}
          />
        );
      }
      const isSelected = selected.includes(item.ingredient.id);
      return (
        <OptionCard
          label={item.ingredient.name}
          icon={item.ingredient.icon as never}
          selected={isSelected}
          onPress={() =>
            isSelected ? removeIngredient(item.ingredient.id) : addIngredient(item.ingredient.id)
          }
          role="checkbox"
          density="compact"
          style={styles.rowGap}
          testID={`ingredient-${item.ingredient.id}`}
        />
      );
    },
    [addCustom, addIngredient, removeIngredient, selected, t],
  );

  const header = (
    <View style={styles.header}>
      <View style={styles.search}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('ingredients.searchPlaceholder')}
          clearLabel={t('a11y.clearSearch')}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (trimmed.length >= 2 && rows.some((r) => r.kind === 'custom') && rows.length === 1)
              addCustom(trimmed);
          }}
        />
      </View>
      {selected.length > 0 ? (
        <View
          style={styles.chips}
          accessibilityLabel={t('ingredients.selectedCount', { count: selected.length })}
        >
          {selected.map((id) => {
            const ingredient = resolve(id);
            if (!ingredient) return null;
            return (
              <Chip
                key={id}
                label={ingredient.name}
                onRemove={() => removeIngredient(id)}
                removeLabel={t('ingredients.removeChip', { name: ingredient.name })}
                testID={`chip-${id}`}
              />
            );
          })}
        </View>
      ) : null}
      <Text variant="sectionLabel" color="textMuted" style={styles.sectionLabel}>
        {trimmed ? t('ingredients.results') : t('ingredients.suggested')}
      </Text>
      {isError ? (
        <Text variant="body" color="danger">
          {t('states.errorBody')}
        </Text>
      ) : null}
    </View>
  );

  return (
    <OnboardingScreen
      route="ingredients"
      title={copy('ingredients.title')}
      scroll={false}
      keyboardAvoiding
      bleed
      footer={(nav) => (
        <Button
          title={t('common.continue')}
          onPress={nav.goNext}
          disabled={selected.length === 0}
          haptic="medium"
        />
      )}
    >
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.kind === 'ingredient' ? item.ingredient.id : `${item.kind}-${index}`
        }
        ListHeaderComponent={header}
        ListEmptyComponent={
          trimmed ? (
            <Text variant="body" color="textMuted" style={styles.empty}>
              {t('ingredients.noResults', { query: trimmed })}
            </Text>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: rs(layout.screenPaddingH), paddingBottom: spacing.xl },
  header: { paddingBottom: spacing.xs },
  search: { marginTop: rv(spacing.xl) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.sm), marginTop: rs(spacing.md) },
  sectionLabel: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.sm) },
  rowGap: { marginBottom: rs(spacing.sm) },
  empty: { paddingVertical: spacing.md },
});
