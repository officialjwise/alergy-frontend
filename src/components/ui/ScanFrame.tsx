import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, sizes } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ScanFrameProps {
  /** Corner arm length. */
  arm?: number;
  thickness?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** The four bracket corners drawn around the hero bowl and the camera viewfinder. */
export function ScanFrame({
  arm = sizes.scanCornerArm,
  thickness = sizes.scanCornerThickness,
  color = colors.primary,
  style,
}: ScanFrameProps) {
  const size = rs(arm);
  const base: ViewStyle = { position: 'absolute', width: size, height: size, borderColor: color };
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <View
        style={[
          base,
          {
            top: 0,
            left: 0,
            borderTopWidth: thickness,
            borderLeftWidth: thickness,
            borderTopLeftRadius: radii.xs,
          },
        ]}
      />
      <View
        style={[
          base,
          {
            top: 0,
            right: 0,
            borderTopWidth: thickness,
            borderRightWidth: thickness,
            borderTopRightRadius: radii.xs,
          },
        ]}
      />
      <View
        style={[
          base,
          {
            bottom: 0,
            left: 0,
            borderBottomWidth: thickness,
            borderLeftWidth: thickness,
            borderBottomLeftRadius: radii.xs,
          },
        ]}
      />
      <View
        style={[
          base,
          {
            bottom: 0,
            right: 0,
            borderBottomWidth: thickness,
            borderRightWidth: thickness,
            borderBottomRightRadius: radii.xs,
          },
        ]}
      />
    </View>
  );
}
