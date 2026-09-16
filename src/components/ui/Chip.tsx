import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { colors, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ChipProps {
  label: string;
  /** Renders the x button and makes the chip removable. */
  onRemove?: () => void;
  /** Filter-chip mode: tap toggles, selected chips turn near-black. */
  onPress?: () => void;
  selected?: boolean;
  removeLabel?: string;
  testID?: string;
}

/** Removable ingredient chip (50pt pill, light gray) from the ingredients screen; also used as a filter chip. */
function ChipComponent({
  label,
  onRemove,
  onPress,
  selected = false,
  removeLabel,
  testID,
}: ChipProps) {
  const content = (
    <>
      <Text variant="label" color={selected ? 'onPrimary' : 'textBody'} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <PressableScale
          onPress={onRemove}
          haptic="light"
          hitSlop={10}
          pressedScale={0.9}
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? label}
          style={styles.remove}
        >
          <Icon name="close" size={rs(16)} color={selected ? 'onPrimary' : 'textBody'} />
        </PressableScale>
      ) : null}
    </>
  );
  const chipStyle = [
    styles.chip,
    selected ? styles.selected : null,
    onRemove ? styles.withRemove : null,
  ];
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="selection"
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        style={chipStyle}
        testID={testID}
      >
        {content}
      </PressableScale>
    );
  }
  return (
    <View style={chipStyle} testID={testID} accessible accessibilityLabel={label}>
      {content}
    </View>
  );
}

export const Chip = memo(ChipComponent);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: rs(sizes.chip),
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: rs(22),
  },
  withRemove: { paddingRight: rs(spacing.md) },
  selected: { backgroundColor: colors.primary },
  remove: {
    marginLeft: rs(spacing.lg),
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
