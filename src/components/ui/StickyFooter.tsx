import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface StickyFooterProps {
  children: ReactNode;
  /** Draw a hairline above the footer when content scrolls behind it. */
  divider?: boolean;
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pinned bottom area for buttons: same padding above the home indicator on every screen. */
export function StickyFooter({
  children,
  divider = false,
  transparent = false,
  style,
}: StickyFooterProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.footer,
        divider ? styles.divider : null,
        transparent ? styles.transparent : null,
        { paddingBottom: Math.max(insets.bottom, spacing.md) + rs(layout.buttonBottom) },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: rs(layout.screenPaddingH),
    paddingTop: rs(spacing.sm),
    backgroundColor: colors.background,
    gap: rs(spacing.sm),
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  transparent: { backgroundColor: 'transparent' },
});
