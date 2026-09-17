import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, PressableScale, SearchInput, Text, type IconName } from '@/components/ui';
import { MAX_TYPED_FOODS } from '@/features/questionnaire/definition';
import { resolveTypedFood } from '@/features/questionnaire/rules';
import { ingredientById } from '@/mocks/ingredients';
import { borders, colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { TypedFood, TypedFoodResolution } from '@/types';

export interface TypedFoodsProps {
  foods: readonly TypedFood[];
  onAdd: (text: string, resolution: TypedFoodResolution) => void;
  onRemove: (index: number) => void;
}

/**
 * Question 4: the user types each food on its own (up to 10). Known names
 * become the allergen and the user is told; unknown names are kept as typed
 * and checked by name only; words on every label are refused.
 */
export function TypedFoods({ foods, onAdd, onRemove }: TypedFoodsProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [refused, setRefused] = useState<string | null>(null);
  const trimmed = text.trim();
  const full = foods.length >= MAX_TYPED_FOODS;

  const add = () => {
    if (!trimmed || full) return;
    const resolution = resolveTypedFood(trimmed);
    if (resolution.kind === 'refused') {
      setRefused(trimmed);
      return;
    }
    const duplicate = foods.some(
      (food) =>
        food.text.toLowerCase() === trimmed.toLowerCase() ||
        (resolution.kind === 'known' &&
          food.resolution.kind === 'known' &&
          food.resolution.allergenId === resolution.allergenId),
    );
    if (!duplicate) onAdd(trimmed, resolution);
    setRefused(null);
    setText('');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.inputRow}>
        <View style={styles.input}>
          <SearchInput
            icon="search"
            value={text}
            onChangeText={(value) => {
              setText(value);
              if (refused) setRefused(null);
            }}
            placeholder={t('q4.placeholder')}
            clearLabel={t('common.clear')}
            returnKeyType="done"
            onSubmitEditing={add}
            editable={!full}
            autoCapitalize="none"
            autoCorrect={false}
            testID="typed-food-input"
          />
        </View>
        <Button
          title={t('common.add')}
          size="md"
          onPress={add}
          disabled={!trimmed || full}
          style={styles.addButton}
          testID="typed-food-add"
        />
      </View>
      {refused ? (
        <Text variant="small" color="danger" accessibilityLiveRegion="polite">
          {t('q4.refused', { text: refused })}
        </Text>
      ) : null}
      <Text variant="small" color="textMuted">
        {full ? t('q4.full', { count: MAX_TYPED_FOODS }) : t('q4.count', { count: foods.length, max: MAX_TYPED_FOODS })}
      </Text>
      <View style={styles.list}>
        {foods.map((food, index) => {
          const info = describe(food, t);
          return (
            <View key={`${food.text}-${index}`} style={styles.row}>
              <Icon name={info.icon} size={rs(20)} color={info.color} />
              <View style={styles.rowText}>
                <Text variant="label" color="text">
                  {food.text}
                </Text>
                <Text variant="small" color="textMuted">
                  {info.detail}
                </Text>
              </View>
              <PressableScale
                onPress={() => onRemove(index)}
                haptic="light"
                accessibilityRole="button"
                accessibilityLabel={t('a11y.removeChip', { label: food.text })}
                hitSlop={8}
                style={styles.remove}
              >
                <Icon name="close" size={rs(18)} color="textMuted" />
              </PressableScale>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function describe(
  food: TypedFood,
  t: (key: string, values?: Record<string, unknown>) => string,
): { icon: IconName; color: ColorToken; detail: string } {
  if (food.resolution.kind === 'known') {
    const name = ingredientById(food.resolution.allergenId)?.name ?? food.text;
    return { icon: 'checkCircle', color: 'success', detail: t('q4.known', { name }) };
  }
  return { icon: 'label', color: 'textBody', detail: t('q4.byName') };
}

const styles = StyleSheet.create({
  wrap: { gap: rs(spacing.sm) },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
  input: { flex: 1 },
  addButton: { paddingHorizontal: rs(spacing.md), minWidth: rs(80) },
  list: { gap: rs(spacing.xs) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    minHeight: rs(60),
    paddingHorizontal: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowText: { flex: 1, gap: 2 },
  remove: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
