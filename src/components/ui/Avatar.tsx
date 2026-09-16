import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { colors, sizes } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { initials } from '@/utils/text';

export interface AvatarProps {
  source?: ImageSource | number;
  name?: string;
  color?: string;
  size?: number;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Circular avatar with a 3pt white border (social proof) or an initial on a colour (profiles). */
export function Avatar({
  source,
  name,
  color = colors.primary,
  size = sizes.avatar,
  bordered = true,
  style,
  accessibilityLabel,
}: AvatarProps) {
  const dimension = rs(size);
  const border = bordered ? sizes.avatarBorder : 0;
  return (
    <View
      style={[
        styles.wrap,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          borderWidth: border,
          backgroundColor: source ? colors.surface : color,
        },
        style,
      ]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <Text
          variant="button"
          color="onPrimary"
          style={{ fontSize: dimension * 0.4, lineHeight: dimension * 0.5 }}
        >
          {initials(name ?? '')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
