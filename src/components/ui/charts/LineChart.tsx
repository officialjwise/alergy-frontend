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

export interface LineAxis {
  min: number;
  max: number;
  /** Number of labelled grid lines, 5 by default. */
  ticks?: number;
  format?: (value: number) => string;
}

export interface LineChartProps {
  points: LinePoint[];
  height?: number;
  color?: ColorToken;
  /** Labelled y axis with fixed bounds (weight chart). Without it the scale starts at zero. */
  axis?: LineAxis;
  /** Soft fill under the line, on by default. */
  area?: boolean;
  /** Accessible summary of the whole chart. */
  accessibilityLabel: string;
  emptyLabel?: string;
}

const PAD_TOP = 12;
const PAD_BOTTOM = 22;
const PAD_X = 6;
const AXIS_WIDTH = 34;

/**
 * Smooth line with an optional soft area fill; press or drag to read a point.
 * A single point draws as a flat line across the chart.
 */
export function LineChart({
  points,
  height = 160,
  color = 'success',
  axis,
  area = true,
  accessibilityLabel,
  emptyLabel,
}: LineChartProps) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const left = PAD_X + (axis ? AXIS_WIDTH : 0);
  const min = axis ? axis.min : 0;
  const max = axis ? axis.max : Math.max(1, ...points.map((point) => point.value));
  const span = Math.max(1e-6, max - min);
  const plotHeight = height - PAD_TOP - PAD_BOTTOM;
  const ticks = axis?.ticks ?? 5;

  const coords = useMemo(() => {
    if (!width || points.length === 0) return [];
    const plotWidth = width - left - PAD_X;
    const yFor = (value: number) => PAD_TOP + (1 - (value - min) / span) * plotHeight;
    if (points.length === 1) {
      const y = yFor(points[0]!.value);
      return [
        { x: left, y },
        { x: left + plotWidth, y },
      ];
    }
    const step = plotWidth / (points.length - 1);
    return points.map((point, index) => ({ x: left + index * step, y: yFor(point.value) }));
  }, [left, min, plotHeight, points, span, width]);

  const path = useMemo(() => {
    if (coords.length === 0) return '';
    return coords
      .map((point, index) => {
        if (index === 0) return `M${point.x} ${point.y}`;
        const prev = coords[index - 1]!;
        const cx = (prev.x + point.x) / 2;
        return `C${cx} ${prev.y} ${cx} ${point.y} ${point.x} ${point.y}`;
      })
      .join(' ');
  }, [coords]);

  const areaPath =
    area && coords.length > 1
      ? `${path} L${coords[coords.length - 1]!.x} ${height - PAD_BOTTOM} L${coords[0]!.x} ${height - PAD_BOTTOM} Z`
      : '';

  const pick = (x: number) => {
    if (!coords.length || points.length < 2) return;
    let best = 0;
    coords.forEach((point, index) => {
      if (Math.abs(point.x - x) < Math.abs(coords[best]!.x - x)) best = index;
    });
    setSelected(best);
  };

  const labelIndexes =
    points.length === 1 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1];
  const hasData = points.length > 0 && points.some((point) => point.value > 0);
  const stroke = colors[color];
  const gridFractions = axis
    ? Array.from({ length: ticks }, (_, index) => index / (ticks - 1))
    : [0.25, 0.5, 0.75];

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
          {gridFractions.map((fraction) => {
            const y = PAD_TOP + fraction * plotHeight;
            return (
              <Line
                key={fraction}
                x1={left}
                x2={width - PAD_X}
                y1={y}
                y2={y}
                stroke={colors.track}
                strokeWidth={1}
                strokeDasharray={[3, 4]}
              />
            );
          })}
          {areaPath ? <Path d={areaPath} fill="url(#lineArea)" /> : null}
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
      {axis ? (
        <View style={[styles.yAxis, { top: PAD_TOP, height: plotHeight }]} pointerEvents="none">
          {Array.from({ length: ticks }, (_, index) => {
            const value = max - (index / (ticks - 1)) * span;
            return (
              <Text key={index} variant="small" color="textMuted" style={styles.tick}>
                {axis.format ? axis.format(value) : String(Math.round(value))}
              </Text>
            );
          })}
        </View>
      ) : null}
      <View
        style={[
          styles.axis,
          { left, justifyContent: points.length === 1 ? 'center' : 'space-between' },
        ]}
        pointerEvents="none"
      >
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
    right: PAD_X,
    bottom: 0,
    flexDirection: 'row',
  },
  yAxis: { position: 'absolute', left: 0, width: AXIS_WIDTH, justifyContent: 'space-between' },
  tick: { marginTop: -8 },
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
