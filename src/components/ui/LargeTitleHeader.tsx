import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { layout } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface LargeTitleHeaderProps {
  title: string;
  /** Control on the right, vertically centred with the title (bell button, avatar). */
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Large left-aligned title for tab screens (Insights, Groups, Profile). Same offset everywhere. */
export function LargeTitleHeader({ title, right, style, testID }: LargeTitleHeaderProps) {
  return (
    <View style={[styles.row, style]} testID={testID}>
      <Text variant="largeTitle" color="text" style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: rs(layout.headerHeight),
    marginBottom: rs(layout.largeTitleBottom),
  },
  title: { flex: 1 },
  right: { marginLeft: rs(12) },
});
