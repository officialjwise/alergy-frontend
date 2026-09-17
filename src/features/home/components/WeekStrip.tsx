import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';

import { PressableScale, Ring, Text } from '@/components/ui';
import { useDayNutrition } from '@/features/tracking/useTracking';
import { colors, layout, radii, shadows, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { DayNutrition, RingStatus } from '@/types';
import { addDays, dayKey, fromDayKey } from '@/utils/date';

const DAYS = 7;
/** Days after today shown at the end of the current page (faded). */
const FUTURE_DAYS = 1;
/** How many past weeks can be scrolled to. */
const WEEKS_BACK = 12;

/** Ring colours from "Ring Colors Explained": green, yellow, red, and a dotted ring for no logs. */
export const STATUS_COLOR: Record<RingStatus, ColorToken> = {
  none: 'ring',
  green: 'success',
  yellow: 'warning',
  red: 'danger',
};

export interface WeekStripProps {
  profileId: string | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

/**
 * Seven-day streak calendar with a ring per day coloured by how close the day
 * came to its calorie goal; swipe right to left to see past weeks. Today sits
 * in a white tile, future days are faded and not tappable.
 */
export function WeekStrip({ profileId, selectedDate, onSelectDate }: WeekStripProps) {
  const { width } = useWindowDimensions();
  const pageWidth = width - rs(layout.screenPaddingH) * 2;
  const pages = useMemo(() => Array.from({ length: WEEKS_BACK + 1 }, (_, index) => index), []);
  return (
    <FlatList
      horizontal
      inverted
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      data={pages}
      keyExtractor={(page) => String(page)}
      renderItem={({ item }) => (
        <WeekPage
          page={item}
          width={pageWidth}
          profileId={profileId}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      )}
      getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
      initialNumToRender={1}
      windowSize={3}
      style={{ width: pageWidth }}
      testID="home-week-strip"
    />
  );
}

interface WeekPageProps {
  page: number;
  width: number;
  profileId: string | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WeekPage = memo(function WeekPage({
  page,
  width,
  profileId,
  selectedDate,
  onSelectDate,
}: WeekPageProps) {
  const { i18n } = useTranslation();
  const today = dayKey(new Date());
  const days = useMemo(() => {
    const last = addDays(fromDayKey(today), FUTURE_DAYS - page * DAYS);
    const first = addDays(last, -(DAYS - 1));
    return Array.from({ length: DAYS }, (_, index) => {
      const date = addDays(first, index);
      return { key: dayKey(date), date };
    });
  }, [page, today]);
  const first = days[0]?.key ?? today;
  const last = days[DAYS - 1]?.key ?? today;
  const summaries = useDayNutrition(profileId, first, last);

  return (
    <View style={[styles.page, { width }]}>
      {days.map(({ key, date }) => (
        <DayTile
          key={key}
          dayKey={key}
          date={date}
          locale={i18n.language}
          summary={summaries.data?.find((day) => day.date === key)}
          isToday={key === today}
          isFuture={key > today}
          selected={key === selectedDate}
          onPress={() => onSelectDate(key)}
        />
      ))}
    </View>
  );
});

interface DayTileProps {
  dayKey: string;
  date: Date;
  locale: string;
  summary: DayNutrition | undefined;
  isToday: boolean;
  isFuture: boolean;
  selected: boolean;
  onPress: () => void;
}

function DayTile({ date, locale, summary, isToday, isFuture, selected, onPress }: DayTileProps) {
  const { t } = useTranslation();
  const status: RingStatus = summary?.status ?? 'none';
  const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
  const label = t('home.dayA11y', {
    weekday: date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' }),
    status: t(`home.dayStatus_${status}`, { count: summary?.mealsLogged ?? 0 }),
  });
  return (
    <PressableScale
      onPress={onPress}
      disabled={isFuture}
      haptic="selection"
      pressedScale={0.94}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled: isFuture }}
      style={[
        styles.tile,
        isToday ? styles.today : null,
        selected && !isToday ? styles.selected : null,
        isFuture ? styles.future : null,
      ]}
      testID={`day-${date.getDate()}`}
    >
      <Text variant="small" color={isToday ? 'text' : 'textMuted'} numberOfLines={1}>
        {weekday}
      </Text>
      <Ring
        size={rs(38)}
        thickness={3.5}
        progress={status === 'none' ? 0 : 1}
        color={STATUS_COLOR[status]}
        trackColor="ring"
        dashed={status === 'none'}
      >
        <Text variant="statSm" color={selected || isToday ? 'text' : 'textBody'}>
          {date.getDate()}
        </Text>
      </Ring>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  page: { flexDirection: 'row', justifyContent: 'space-between' },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    width: rs(46),
    height: rs(72),
    borderRadius: radii.sm,
  },
  today: { backgroundColor: colors.background, ...shadows.badge },
  selected: { backgroundColor: colors.surfaceStrong },
  future: { opacity: 0.4 },
});
