import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { borders, colors, radii, sizes, spacing } from '@/theme/tokens';
import { rf, rs } from '@/theme/responsive';
import { fontFamily } from '@/theme/typography';

export interface SearchInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (value: string) => void;
  clearLabel?: string;
  /** Leading icon; defaults to the magnifier. */
  icon?: 'search' | 'mail' | 'barcode' | 'person';
}

/** 60pt search field with 16pt radius, 1pt border and a magnifier, from the ingredients screen. */
export const SearchInput = forwardRef<TextInput, SearchInputProps>(function SearchInput(
  { value, onChangeText, clearLabel, icon = 'search', ...rest },
  ref,
) {
  return (
    <View style={styles.field}>
      <Icon name={icon} size={rs(22)} color="textBody" outline />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textPlaceholder}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
        maxFontSizeMultiplier={1.3}
        style={styles.input}
        {...rest}
      />
      {value.length > 0 ? (
        <PressableScale
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={clearLabel ?? 'Clear'}
          style={styles.clear}
        >
          <Icon name="closeCircle" size={rs(20)} color="textPlaceholder" />
        </PressableScale>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: rs(sizes.input),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: rs(spacing.lg),
    gap: rs(spacing.md),
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: rf(18),
    color: colors.text,
    paddingVertical: 0,
    height: '100%',
  },
  clear: { minWidth: 28, minHeight: 28, alignItems: 'center', justifyContent: 'center' },
});
