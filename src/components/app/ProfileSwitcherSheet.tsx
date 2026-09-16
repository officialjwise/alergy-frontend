import { useRouter, type Href } from 'expo-router';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Avatar,
  Divider,
  Icon,
  PressableScale,
  RadioCheck,
  Sheet,
  Text,
  type SheetRef,
} from '@/components/ui';
import { useProfileStore } from '@/store/profileStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Switch the active profile (families set up several people). */
export const ProfileSwitcherSheet = forwardRef<SheetRef>(function ProfileSwitcherSheet(_, ref) {
  const { t } = useTranslation();
  const router = useRouter();
  const profiles = useProfileStore((state) => state.profiles);
  const activeId = useProfileStore((state) => state.activeProfileId);
  const setActive = useProfileStore((state) => state.setActiveProfile);

  const close = () => {
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
  };

  return (
    <Sheet ref={ref} title={t('home.switchProfile')} closeLabel={t('a11y.closeSheet')}>
      <View style={styles.list}>
        {profiles.map((profile, index) => {
          const selected = profile.id === activeId;
          return (
            <View key={profile.id}>
              <PressableScale
                onPress={() => {
                  setActive(profile.id);
                  close();
                }}
                haptic="selection"
                pressedScale={0.99}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${profile.name}, ${t(`profile.for_${profile.profileFor}`)}`}
                style={styles.row}
              >
                <Avatar name={profile.name} color={profile.color} size={44} bordered={false} />
                <View style={styles.text}>
                  <Text variant="label" color="text">
                    {profile.name}
                  </Text>
                  <Text variant="small" color="textMuted">
                    {t(`profile.for_${profile.profileFor}`)} ·{' '}
                    {t('profile.restrictionCount', { count: profile.restrictions.length })}
                  </Text>
                </View>
                <RadioCheck selected={selected} />
              </PressableScale>
              {index < profiles.length - 1 ? <Divider /> : null}
            </View>
          );
        })}
        <Divider />
        <PressableScale
          onPress={() => {
            close();
            router.push('/profiles' as Href);
          }}
          haptic="light"
          pressedScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={t('profile.manageProfiles')}
          style={styles.row}
        >
          <View style={styles.manageIcon}>
            <Icon name="people" size={rs(22)} color="text" outline />
          </View>
          <Text variant="label" color="text" style={styles.text}>
            {t('profile.manageProfiles')}
          </Text>
          <Icon name="chevronRight" size={rs(20)} color="textPlaceholder" />
        </PressableScale>
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: rs(72), gap: rs(spacing.md) },
  text: { flex: 1 },
  manageIcon: { width: rs(44), alignItems: 'center' },
});
