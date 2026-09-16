import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ScreenProps {
  children: ReactNode;
  /** Header row rendered above the scrolling content (ProgressHeader). */
  header?: ReactNode;
  /** Pinned above the home indicator; the content scrolls behind it. */
  footer?: ReactNode;
  /** Disable the ScrollView when the content manages its own list (FlashList). */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Removes the horizontal padding for full-bleed content. */
  bleed?: boolean;
  keyboardAvoiding?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'children'>;
  backgroundColor?: string;
  testID?: string;
}

/**
 * Safe-area aware screen: header row at the top, scrollable content, and a
 * footer pinned above the home indicator. Never hard-codes status bar or
 * home indicator heights.
 */
export function Screen({
  children,
  header,
  footer,
  scroll = true,
  contentStyle,
  bleed = false,
  keyboardAvoiding = false,
  scrollProps,
  backgroundColor = colors.background,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const horizontal = bleed ? 0 : rs(layout.screenPaddingH);

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      {...scrollProps}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: horizontal },
        contentStyle,
        scrollProps?.contentContainerStyle,
      ]}
      style={styles.flex}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, { paddingHorizontal: horizontal }, contentStyle]}>{children}</View>
  );

  const content = (
    <View style={[styles.flex, { backgroundColor }]} testID={testID}>
      <View
        style={{
          paddingTop: insets.top + rs(layout.headerTop),
          paddingHorizontal: rs(layout.screenPaddingH),
        }}
      >
        {header}
      </View>
      {body}
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, spacing.md) + rs(layout.buttonBottom),
              backgroundColor,
            },
          ]}
        >
          {footer}
        </View>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </View>
  );

  if (!keyboardAvoiding) return content;
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xl },
  footer: {
    paddingHorizontal: rs(layout.screenPaddingH),
    paddingTop: spacing.sm,
  },
});
