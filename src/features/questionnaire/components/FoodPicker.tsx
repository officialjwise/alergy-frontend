import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, OptionCard, SearchInput, Text, type IconName } from '@/components/ui';
import { ICONS } from '@/components/ui/iconNames';
import { INGREDIENTS, MAJOR_ALLERGEN_IDS, ingredientById } from '@/mocks/ingredients';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Ingredient } from '@/types';
import { normalize } from '@/utils/text';

export interface FoodPickerProps {
  selected: readonly string[];
  onToggle: (id: string) => void;
}

const iconFor = (ingredient: Ingredient): IconName =>
  ingredient.icon in ICONS ? (ingredient.icon as IconName) : 'flask';

/**
 * Question 3: the 14 allergens labels must highlight come first; "show more"
 * reveals the more specific items with a search field.
 */
export function FoodPicker({ selected, onToggle }: FoodPickerProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [query, setQuery] = useState('');
  const majors = useMemo(
    () => MAJOR_ALLERGEN_IDS.map(ingredientById).filter((item): item is Ingredient => !!item),
    [],
  );
  const more = useMemo(() => {
    const q = normalize(query);
    return INGREDIENTS.filter((item) => !item.major)
      .filter(
        (item) =>
          !q ||
          normalize(item.name).includes(q) ||
          item.aliases.some((alias) => normalize(alias).includes(q)),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  const card = (item: Ingredient) => (
    <OptionCard
      key={item.id}
      label={item.example ? `${item.name} (${item.example})` : item.name}
      icon={iconFor(item)}
      selected={selected.includes(item.id)}
      onPress={() => onToggle(item.id)}
      role="checkbox"
      density="compact"
      testID={`food-${item.id}`}
    />
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.list}>{majors.map(card)}</View>
      {showMore ? (
        <View style={styles.more}>
          <Text variant="sectionLabel" color="textMuted">
            {t('q3.moreTitle')}
          </Text>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('q3.searchPlaceholder')}
            clearLabel={t('a11y.clearSearch')}
          />
          <View style={styles.list}>{more.map(card)}</View>
          {more.length === 0 ? (
            <Text variant="body" color="textMuted">
              {t('q3.noResults', { query })}
            </Text>
          ) : null}
        </View>
      ) : (
        <Button
          title={t('q3.showMore')}
          variant="text"
          onPress={() => setShowMore(true)}
          testID="food-show-more"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: rs(spacing.sm) },
  list: { gap: rs(spacing.sm) },
  more: { gap: rs(spacing.sm), marginTop: rs(spacing.xs) },
});
