import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors } from '@/theme/tokens';

/** Developer helper: logs where synthetic taps land so simulator automation can be calibrated. */
export default function TapTarget() {
  return (
    <Pressable
      style={styles.root}
      onPress={(event) => {
        const { pageX, pageY } = event.nativeEvent;
        console.log(`TAP ${Math.round(pageX)} ${Math.round(pageY)}`);
      }}
    >
      <View style={styles.center}>
        <Text variant="body" color="textMuted">
          tap target
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
