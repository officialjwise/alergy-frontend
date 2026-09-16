import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { StatCard, type StatCardProps } from '@/components/ui';
import { colors, layout, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface StatPagerProps {
  /** Each page is a row of stat cards; cards in a row share the same width and height. */
  pages: (StatCardProps & { key: string })[][];
  testID?: string;
}

/** Swipeable rows of stat cards with page dots underneath. */
export function StatPager({ pages, testID }: StatPagerProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const pageWidth = width - rs(layout.screenPaddingH) * 2;
  const [index, setIndex] = useState(0);
  return (
    <View testID={testID}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth))
        }
        style={{ width: pageWidth }}
        accessibilityLabel={t('home.statsA11y', { current: index + 1, total: pages.length })}
      >
        {pages.map((cards, pageIndex) => (
          <View key={pageIndex} style={[styles.page, { width: pageWidth }]}>
            {cards.map(({ key, style, ...card }) => (
              <View key={key} style={styles.slot}>
                <StatCard {...card} style={[styles.card, style]} />
              </View>
            ))}
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
  page: { flexDirection: 'row', gap: rs(spacing.sm) },
  // A row-direction slot stretches the card to the tallest card in the page.
  slot: { flex: 1, flexDirection: 'row' },
  card: { flex: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(6),
    marginTop: rs(spacing.sm),
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ring },
  dotActive: { backgroundColor: colors.primary },
});
