import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export interface ReTextProps {
  text: SharedValue<string>;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

/**
 * Renders a shared string on the UI thread without React re-renders
 * (the animated "78%" counter). Uses the TextInput `text` prop trick.
 */
export function ReText({ text, style, accessibilityLabel }: ReTextProps) {
  const animatedProps = useAnimatedProps(() => ({ text: text.value, defaultValue: text.value }));
  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      style={[styles.input, style]}
      accessibilityLabel={accessibilityLabel}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({ input: { padding: 0, margin: 0 } });
