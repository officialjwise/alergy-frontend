import { forwardRef } from 'react';
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { colors, type ColorToken } from '@/theme/tokens';
import { rf, maxFontMultiplier } from '@/theme/responsive';
import { typography, type TypographyToken } from '@/theme/typography';

export interface TextProps extends RNTextProps {
  variant?: TypographyToken;
  color?: ColorToken;
  align?: TextStyle['textAlign'];
}

const TITLE_VARIANTS: readonly TypographyToken[] = [
  'display',
  'titleLg',
  'title',
  'loading',
  'rating',
  'statement',
];
const CONTROL_VARIANTS: readonly TypographyToken[] = ['button', 'badge', 'textButton', 'wheel'];

/** Pre-scaled styles: font sizes follow the screen width helper once, at module load. */
const scaled = Object.fromEntries(
  (Object.keys(typography) as TypographyToken[]).map((key) => {
    const base = typography[key];
    return [
      key,
      {
        ...base,
        fontSize: rf(base.fontSize ?? 16),
        lineHeight: rf(base.lineHeight ?? 22),
      },
    ];
  }),
) as Record<TypographyToken, TextStyle>;

const styles = StyleSheet.create(scaled);

export const Text = forwardRef<RNText, TextProps>(function Text(
  { variant = 'body', color = 'text', align, style, maxFontSizeMultiplier, ...rest },
  ref,
) {
  const cap =
    maxFontSizeMultiplier ??
    (TITLE_VARIANTS.includes(variant)
      ? maxFontMultiplier.title
      : CONTROL_VARIANTS.includes(variant)
        ? maxFontMultiplier.control
        : maxFontMultiplier.body);
  return (
    <RNText
      ref={ref}
      {...rest}
      maxFontSizeMultiplier={cap}
      style={[
        styles[variant],
        { color: colors[color] },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
});
