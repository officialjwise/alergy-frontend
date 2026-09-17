import { forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Sheet, WheelPicker, type SheetRef } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { addDays } from '@/utils/date';

export interface DateTimeSheetProps {
  value: Date;
  onChange: (value: Date) => void;
}

const DAYS_BACK = 30;
const MINUTE_STEP = 5;

/** Date and time wheels (last 30 days) in the onboarding wheel style; no native picker needed. */
export const DateTimeSheet = forwardRef<SheetRef, DateTimeSheetProps>(function DateTimeSheet(
  { value, onChange },
  ref,
) {
  const { t, i18n } = useTranslation();
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const [dayOffset, setDayOffset] = useState(() =>
    Math.min(
      DAYS_BACK,
      Math.max(0, Math.round((today.getTime() - startOfDay(value).getTime()) / 86_400_000)),
    ),
  );
  const [hour, setHour] = useState(value.getHours());
  const [minute, setMinute] = useState(
    (Math.round(value.getMinutes() / MINUTE_STEP) * MINUTE_STEP) % 60,
  );

  const dayItems = useMemo(
    () =>
      Array.from({ length: DAYS_BACK + 1 }, (_, offset) => ({
        value: offset,
        label:
          offset === 0
            ? t('history.today')
            : offset === 1
              ? t('history.yesterday')
              : addDays(today, -offset).toLocaleDateString(i18n.language, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                }),
      })),
    [i18n.language, t, today],
  );
  const hourItems = useMemo(
    () => Array.from({ length: 24 }, (_, h) => ({ value: h, label: String(h).padStart(2, '0') })),
    [],
  );
  const minuteItems = useMemo(
    () =>
      Array.from({ length: 60 / MINUTE_STEP }, (_, i) => ({
        value: i * MINUTE_STEP,
        label: String(i * MINUTE_STEP).padStart(2, '0'),
      })),
    [],
  );

  const done = () => {
    const next = addDays(today, -dayOffset);
    next.setHours(hour, minute, 0, 0);
    onChange(next);
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
  };

  return (
    <Sheet ref={ref} title={t('reactions.dateTime')} closeLabel={t('common.close')}>
      <WheelPicker
        visibleRows={5}
        columns={[
          {
            accessibilityLabel: t('reactions.day'),
            align: 'left',
            flex: 2,
            value: dayOffset,
            onChange: setDayOffset,
            items: dayItems,
          },
          {
            accessibilityLabel: t('reactions.hour'),
            flex: 0.8,
            value: hour,
            onChange: setHour,
            items: hourItems,
          },
          {
            accessibilityLabel: t('reactions.minute'),
            flex: 0.8,
            value: minute,
            onChange: setMinute,
            items: minuteItems,
          },
        ]}
      />
      <View style={styles.actions}>
        <Button title={t('reactions.done')} size="md" onPress={done} testID="datetime-done" />
      </View>
    </Sheet>
  );
});

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const styles = StyleSheet.create({
  actions: { marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
});
