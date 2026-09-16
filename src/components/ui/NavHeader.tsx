import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { colors, layout, sizes } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface NavHeaderProps {
  title?: string;
  /** Icon for the left button; `back` is the default. `none` hides it. */
  leftIcon?: IconName | 'none';
  leftLabel?: string;
  onLeftPress?: () => void;
  /** Optional right-side control (an icon button or any node). */
  rightIcon?: IconName;
  rightLabel?: string;
  onRightPress?: () => void;
  right?: ReactNode;
  /** Draw the buttons on dark translucent circles (over photos). */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Stack screen header: 46pt circle button on the left, centred title, optional
 * control on the right. Same height on every screen so titles line up.
 */
export function NavHeader({
  title,
  leftIcon = 'arrowBack',
  leftLabel,
  onLeftPress,
  rightIcon,
  rightLabel,
  onRightPress,
  right,
  onDark = false,
  style,
  testID,
}: NavHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View style={[styles.row, style]} testID={testID}>
      <View style={styles.side}>
        {leftIcon !== 'none' ? (
          <HeaderButton
            icon={leftIcon}
            label={leftLabel ?? t('common.back')}
            onPress={onLeftPress ?? goBack}
            onDark={onDark}
          />
        ) : null}
      </View>
      {title ? (
        <Text
          variant="cardTitle"
          color={onDark ? 'textOnDark' : 'text'}
          numberOfLines={1}
          style={styles.title}
          accessibilityRole="header"
        >
          {title}
        </Text>
      ) : (
        <View style={styles.title} />
      )}
      <View style={[styles.side, styles.right]}>
        {right ??
          (rightIcon && onRightPress ? (
            <HeaderButton
              icon={rightIcon}
              label={rightLabel ?? ''}
              onPress={onRightPress}
              onDark={onDark}
            />
          ) : null)}
      </View>
    </View>
  );
}

export function HeaderButton({
  icon,
  label,
  onPress,
  onDark = false,
  testID,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  onDark?: boolean;
  testID?: string;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      pressedScale={0.92}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={[styles.button, onDark ? styles.buttonDark : null]}
      testID={testID}
    >
      <Icon name={icon} size={rs(22)} color={onDark ? 'textOnDark' : 'text'} />
    </PressableScale>
  );
}

const size = rs(sizes.backButton);

const styles = StyleSheet.create({
  row: {
    height: rs(layout.headerHeight),
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: { width: size, alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center', paddingHorizontal: 8 },
  button: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDark: { backgroundColor: 'rgba(15, 13, 20, 0.45)' },
});
