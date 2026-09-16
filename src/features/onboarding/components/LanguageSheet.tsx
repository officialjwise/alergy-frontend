import { forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Divider, PressableScale, RadioCheck, Sheet, Text, type SheetRef } from '@/components/ui';
import { setLanguage as applyLanguage } from '@/i18n';
import { LANGUAGES } from '@/i18n/languages';
import { useAppStore } from '@/store/appStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { LanguageCode } from '@/types';

export interface LanguageSheetProps {
  /** Called after a language row was tapped (the sheet dismisses itself). */
  onSelect?: (code: LanguageCode) => void;
  onDismiss?: () => void;
}

/**
 * "Select Language" sheet: 8 rows with emoji flags, native names and the
 * 32pt radio/check, exactly in the PDF's order.
 */
export const LanguageSheet = forwardRef<SheetRef, LanguageSheetProps>(function LanguageSheet(
  { onSelect, onDismiss },
  ref,
) {
  const { t, i18n } = useTranslation();
  const setLanguage = useAppStore((state) => state.setLanguage);
  const current = (useAppStore((state) => state.language) ?? i18n.language) as LanguageCode;

  const select = useCallback(
    (code: LanguageCode) => {
      setLanguage(code);
      applyLanguage(code);
      onSelect?.(code);
      if (ref && typeof ref !== 'function') ref.current?.dismiss();
    },
    [onSelect, ref, setLanguage],
  );

  return (
    <Sheet
      ref={ref}
      title={t('language.title')}
      closeLabel={t('a11y.closeSheet')}
      onDismiss={onDismiss}
    >
      <View style={styles.list}>
        {LANGUAGES.map((language, index) => {
          const selected = language.code === current;
          return (
            <View key={language.code}>
              <PressableScale
                onPress={() => select(language.code)}
                haptic="selection"
                pressedScale={0.99}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t('language.a11yRow', {
                  language: language.nativeName,
                  state: selected ? t('common.selectedState') : t('common.notSelectedState'),
                })}
                style={styles.row}
              >
                <Text
                  style={styles.flag}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                >
                  {language.flag}
                </Text>
                <Text variant="body" color="textBody" style={styles.label}>
                  {language.nativeName}
                </Text>
                <RadioCheck selected={selected} />
              </PressableScale>
              {index < LANGUAGES.length - 1 ? <Divider /> : null}
            </View>
          );
        })}
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', height: rs(72), gap: rs(spacing.md) },
  flag: { fontSize: rs(28), lineHeight: rs(34), width: rs(44), textAlign: 'center' },
  label: { flex: 1 },
});
