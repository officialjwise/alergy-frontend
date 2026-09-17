import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { colors, layout, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface HomePagerProps {
  pages: ReactNode[];
  a11yLabel: (current: number, total: number) => string;
  onPageChange?: (index: number) => void;
  testID?: string;
}

/**
 * The dashboard pager: each page holds the hero card plus its small cards, so
 * swiping any card moves the whole block, with page dots underneath.
 */
export function HomePager({ pages, a11yLabel, onPageChange, testID }: HomePagerProps) {
  const { width } = useWindowDimensions();
  const pageWidth = width - rs(layout.screenPaddingH) * 2;
  const [index, setIndex] = useState(0);
  return (
    <View testID={testID}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
          setIndex(next);
          onPageChange?.(next);
        }}
        style={{ width: pageWidth }}
        accessibilityLabel={a11yLabel(index + 1, pages.length)}
      >
        {pages.map((page, pageIndex) => (
          <View key={pageIndex} style={[styles.page, { width: pageWidth }]}>
            {page}
          </View>
        ))}
      </ScrollView>
      {pages.length > 1 ? (
        <View style={styles.dots} accessibilityElementsHidden>
          {pages.map((_, dot) => (
            <View key={dot} style={[styles.dot, dot === index ? styles.dotActive : null]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: rs(spacing.sm), paddingBottom: rs(spacing.xs) },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(6),
    marginTop: rs(spacing.xs),
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ring },
  dotActive: { backgroundColor: colors.primary },
});
