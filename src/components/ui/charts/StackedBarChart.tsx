import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { Text } from '../Text';
import { colors, type ColorToken } from '@/theme/tokens';

export interface StackedBar {
  label: string;
  segments: { value: number; color: ColorToken }[];
  accessibilityLabel?: string;
}

export interface StackedBarChartProps {
  bars: StackedBar[];
  height?: number;
  /** Fixed scale top; defaults to the tallest bar (at least 4). */
  maxValue?: number;
  /** `grouped` draws each segment as its own bar side by side (burned next to consumed). */
  mode?: 'stacked' | 'grouped';
  accessibilityLabel: string;
}

const PAD_TOP = 8;
const PAD_BOTTOM = 22;
const AXIS_WIDTH = 36;
const TICKS = 4;

/** Vertical stacked bars with dashed grid lines and a small y axis (daily scans, weekly overview). */
export function StackedBarChart({
  bars,
  height = 180,
  maxValue,
  mode = 'stacked',
  accessibilityLabel,
}: StackedBarChartProps) {
  const [width, setWidth] = useState(0);
  const grouped = mode === 'grouped';
  const tallest = Math.max(
    ...bars.map((bar) =>
      grouped
        ? Math.max(...bar.segments.map((s) => s.value), 0)
        : bar.segments.reduce((sum, s) => sum + s.value, 0),
    ),
    0,
  );
  const max = Math.max(4, maxValue ?? Math.ceil(tallest / TICKS) * TICKS);
  const plotHeight = height - PAD_TOP - PAD_BOTTOM;
  const plotWidth = Math.max(0, width - AXIS_WIDTH);
  const slot = bars.length ? plotWidth / bars.length : 0;
  const groupSize = Math.max(1, ...bars.map((bar) => bar.segments.length));
  const barWidth = grouped ? Math.min(14, (slot * 0.6) / groupSize) : Math.min(28, slot * 0.5);

  return (
    <View
      style={{ height }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          {Array.from({ length: TICKS + 1 }, (_, index) => {
            const y = PAD_TOP + (index / TICKS) * plotHeight;
            return (
              <Line
                key={index}
                x1={AXIS_WIDTH}
                x2={width}
                y1={y}
                y2={y}
                stroke={colors.track}
                strokeWidth={1}
                strokeDasharray={index === TICKS ? undefined : [3, 4]}
              />
            );
          })}
          {bars.map((bar, index) => {
            if (grouped) {
              const groupWidth = barWidth * bar.segments.length + 3 * (bar.segments.length - 1);
              const start = AXIS_WIDTH + index * slot + (slot - groupWidth) / 2;
              return bar.segments.map((segment, segmentIndex) => {
                const h = (segment.value / max) * plotHeight;
                return h > 0 ? (
                  <Rect
                    key={`${index}-${segmentIndex}`}
                    x={start + segmentIndex * (barWidth + 3)}
                    y={PAD_TOP + plotHeight - h}
                    width={barWidth}
                    height={h}
                    rx={4}
                    fill={colors[segment.color]}
                  />
                ) : null;
              });
            }
            const x = AXIS_WIDTH + index * slot + (slot - barWidth) / 2;
            let cursor = PAD_TOP + plotHeight;
            return bar.segments.map((segment, segmentIndex) => {
              const h = (segment.value / max) * plotHeight;
              cursor -= h;
              const isTop =
                segmentIndex === bar.segments.length - 1 ||
                bar.segments.slice(segmentIndex + 1).every((s) => s.value === 0);
              return h > 0 ? (
                <Rect
                  key={`${index}-${segmentIndex}`}
                  x={x}
                  y={cursor}
                  width={barWidth}
                  height={h}
                  rx={isTop ? 4 : 0}
                  fill={colors[segment.color]}
                />
              ) : null;
            });
          })}
        </Svg>
      ) : null}
      <View style={[styles.yAxis, { height: plotHeight, top: PAD_TOP }]} pointerEvents="none">
        {Array.from({ length: TICKS + 1 }, (_, index) => (
          <Text key={index} variant="small" color="textMuted" style={styles.tick}>
            {Math.round(max - (index / TICKS) * max)}
          </Text>
        ))}
      </View>
      <View style={[styles.xAxis, { left: AXIS_WIDTH }]} pointerEvents="none">
        {bars.map((bar, index) => (
          <Text
            key={`${bar.label}-${index}`}
            variant="small"
            color="textMuted"
            style={{ width: slot }}
            align="center"
          >
            {bar.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  yAxis: { position: 'absolute', left: 0, width: AXIS_WIDTH - 6, justifyContent: 'space-between' },
  tick: { textAlign: 'right', marginTop: -8 },
  xAxis: { position: 'absolute', right: 0, bottom: 0, flexDirection: 'row' },
});
