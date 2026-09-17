import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { VerdictCard } from '@/components/app/VerdictCard';
import { Button, NavHeader, Screen, Text } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { VerdictKind } from '@/types';

const KINDS: VerdictKind[] = ['safe', 'caution', 'unsafe', 'unknown'];

/** What each of the four verdicts means and how the caution level changes them. */
export default function VerdictColorsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.verdictColors.title')} />}
      footer={
        <Button
          title={t('settingsScreens.verdictColors.cautionLink')}
          variant="secondary"
          onPress={() => router.push('/settings/caution')}
        />
      }
      testID="settings-verdict-colors"
    >
      <Text variant="subtitle" color="textMuted" style={styles.intro}>
        {t('settingsScreens.verdictColors.intro')}
      </Text>
      <View style={styles.list}>
        {KINDS.map((kind) => (
          <VerdictCard
            key={kind}
            kind={kind}
            reason={t(`settingsScreens.verdictColors.${kind}Body`)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: rs(spacing.md) },
  list: { gap: rs(spacing.sm), marginTop: rs(spacing.xl) },
});
