import Svg, { Path, Rect } from 'react-native-svg';

import { colors, type ColorToken } from '@/theme/tokens';

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: ColorToken;
  /** Faded look for rows that are not ready yet. */
  muted?: boolean;
}

/** Tiny area line for table rows (scan changes). */
export function Sparkline({
  values,
  width = 40,
  height = 18,
  color = 'info',
  muted = false,
}: SparklineProps) {
  const max = Math.max(1, ...values);
  const stroke = colors[muted ? 'ring' : color];
  if (values.length < 2) {
    return (
      <Svg width={width} height={height}>
        <Rect x={0} y={height - 4} width={width} height={4} rx={2} fill={stroke} opacity={0.5} />
      </Svg>
    );
  }
  const step = width / (values.length - 1);
  const points = values.map((value, index) => ({
    x: index * step,
    y: 2 + (1 - value / max) * (height - 4),
  }));
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  return (
    <Svg width={width} height={height}>
      <Path d={area} fill={stroke} opacity={0.18} />
      <Path d={line} stroke={stroke} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}
