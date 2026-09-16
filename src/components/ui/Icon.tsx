import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';

import { ICONS, type IconName } from './iconNames';
import { colors, type ColorToken } from '@/theme/tokens';

export interface IconProps {
  name: IconName;
  size?: number;
  /** Colour token or raw colour string. */
  color?: ColorToken | (string & {});
  /** Use the thin outline variant (feature circles, checklist rows). */
  outline?: boolean;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

const isToken = (value: string): value is ColorToken => value in colors;

export function resolveColor(color: ColorToken | (string & {})): string {
  return isToken(color) ? colors[color] : color;
}

export function Icon({
  name,
  size = 24,
  color = 'text',
  outline = false,
  style,
  accessibilityLabel,
}: IconProps) {
  const glyph = ICONS[name];
  const resolved = resolveColor(color);
  const a11y = accessibilityLabel
    ? { accessibilityLabel, accessibilityRole: 'image' as const }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no' as const };

  if (glyph.family === 'mci') {
    const outlineName = `${glyph.name}-outline`;
    const finalName = (
      outline && outlineName in MaterialCommunityIcons.glyphMap ? outlineName : glyph.name
    ) as keyof typeof MaterialCommunityIcons.glyphMap;
    return (
      <MaterialCommunityIcons
        name={finalName}
        size={size}
        color={resolved}
        style={style}
        {...a11y}
      />
    );
  }
  const outlineName = `${glyph.name}-outline`;
  const finalName = (
    outline && outlineName in Ionicons.glyphMap ? outlineName : glyph.name
  ) as keyof typeof Ionicons.glyphMap;
  return <Ionicons name={finalName} size={size} color={resolved} style={style} {...a11y} />;
}
