import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { Text } from '../Text';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface LinePoint {
  value: number;
  /** Short axis label (shown for the first, middle and last points). */
  label: string;
  /** Tooltip text when the point is pressed. */
  tooltip: string;
}

export interface LineChartProps {
  points: LinePoint[];
  height?: number;
  color?: ColorToken;
  /** Accessible summary of the whole chart. */
  accessibilityLabel: string;
  emptyLabel?: string;
}

const PAD_TOP = 12;
const PAD_BOTTOM = 22;
const PAD_X = 6;

/** Smooth line with a soft area fill; press or drag to read a point. */
export function LineChart({
  points,
  height = 160,
  color = 'success',
  accessibilityLabel,
  emptyLabel,
}: LineChartProps) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((point) => point.value));

  const coords = useMemo(() => {
    if (!width || points.length === 0) return [];
    const step = points.length > 1 ? (width - PAD_X * 2) / (points.length - 1) : 0;
    return points.map((point, index) => ({
      x: PAD_X + index * step,
      y: PAD_TOP + (1 - point.value / max) * (height - PAD_TOP - PAD_BOTTOM),
    }));
  }, [height, max, points, width]);

  const path = useMemo(() => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M${coords[0]!.x} ${coords[0]!.y}`;
    return coords
      .map((point, index) => {
        if (index === 0) return `M${point.x} ${point.y}`;
        const prev = coords[index - 1]!;
        const cx = (prev.x + point.x) / 2;
        return `C${cx} ${prev.y} ${cx} ${point.y} ${point.x} ${point.y}`;
      })
      .join(' ');
  }, [coords]);

  const area =
    coords.length > 1
      ? `${path} L${coords[coords.length - 1]!.x} ${height - PAD_BOTTOM} L${coords[0]!.x} ${height - PAD_BOTTOM} Z`
      : '';

  const pick = (x: number) => {
    if (!coords.length) return;
    let best = 0;
    coords.forEach((point, index) => {
      if (Math.abs(point.x - x) < Math.abs(coords[best]!.x - x)) best = index;
    });
    setSelected(best);
  };

  const labelIndexes = [0, Math.floor((points.length - 1) / 2), points.length - 1];
  const hasData = points.some((point) => point.value > 0);
  const stroke = colors[color];

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
          <Defs>
            <LinearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.22} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {[0.25, 0.5, 0.75].map((fraction) => {
            const y = PAD_TOP + fraction * (height - PAD_TOP - PAD_BOTTOM);
            return (
              <Line
                key={fraction}
                x1={PAD_X}
                x2={width - PAD_X}
                y1={y}
                y2={y}
                stroke={colors.track}
                strokeWidth={1}
                strokeDasharray={[3, 4]}
              />
            );
          })}
          {area ? <Path d={area} fill="url(#lineArea)" /> : null}
          {path ? (
            <Path d={path} stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          ) : null}
          {selected !== null && coords[selected] ? (
            <>
              <Line
                x1={coords[selected].x}
                x2={coords[selected].x}
                y1={PAD_TOP}
                y2={height - PAD_BOTTOM}
                stroke={colors.textMuted}
                strokeWidth={1}
              />
              <Circle
                cx={coords[selected].x}
                cy={coords[selected].y}
                r={6}
                fill={stroke}
                stroke={colors.background}
                strokeWidth={2}
              />
            </>
          ) : null}
        </Svg>
      ) : null}
      <View style={styles.axis} pointerEvents="none">
        {labelIndexes.map((index, position) => (
          <Text key={`${index}-${position}`} variant="small" color="textMuted">
            {points[index]?.label ?? ''}
          </Text>
        ))}
      </View>
      {!hasData && emptyLabel ? (
        <View style={styles.empty} pointerEvents="none">
          <Text variant="small" color="textMuted">
            {emptyLabel}
          </Text>
        </View>
      ) : null}
      {selected !== null && points[selected] && coords[selected] ? (
        <View
          style={[
            styles.tooltip,
            { left: Math.min(Math.max(coords[selected].x - 70, 0), Math.max(0, width - 140)) },
          ]}
          pointerEvents="none"
        >
          <Text variant="small" color="onPrimary" align="center">
            {points[selected].tooltip}
          </Text>
        </View>
      ) : null}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={(event) => pick(event.nativeEvent.locationX)}
        onTouchMove={(event) => pick(event.nativeEvent.locationX)}
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  axis: {
    position: 'absolute',
    left: PAD_X,
    right: PAD_X,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empty: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: PAD_BOTTOM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    width: 140,
    paddingHorizontal: rs(spacing.xs),
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
});
