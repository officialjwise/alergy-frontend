import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Text } from './Text';
import { borders, colors, radii, sizes, spacing } from '@/theme/tokens';
import { maxFontMultiplier, rf, rs } from '@/theme/responsive';
import { fontFamily } from '@/theme/typography';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helper?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

/** Labelled text input in the search-field style: 60pt, 16pt radius, hairline border, error state. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, helper, error, style, multiline, editable = true, ...rest },
  ref,
) {
  return (
    <View style={style}>
      {label ? (
        <Text variant="label" color="text" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        {...rest}
        multiline={multiline}
        editable={editable}
        placeholderTextColor={colors.textPlaceholder}
        maxFontSizeMultiplier={maxFontMultiplier.body}
        accessibilityLabel={rest.accessibilityLabel ?? label}
        style={[
          styles.input,
          multiline ? styles.multiline : null,
          error ? styles.error : null,
          !editable ? styles.disabled : null,
        ]}
      />
      {error ? (
        <Text variant="small" color="danger" style={styles.helper}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="small" color="textMuted" style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: rs(spacing.xs) },
  input: {
    minHeight: rs(sizes.input),
    paddingHorizontal: rs(spacing.md),
    paddingVertical: rs(spacing.sm),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
    fontFamily: fontFamily.regular,
    fontSize: rf(18),
    lineHeight: rf(24),
    color: colors.text,
  },
  multiline: { minHeight: rs(120), textAlignVertical: 'top' },
  error: { borderColor: colors.danger },
  disabled: { backgroundColor: colors.surface, color: colors.textMuted },
  helper: { marginTop: rs(6) },
});
