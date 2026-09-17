import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Chip, NavHeader, Screen, SettingsRow, SettingsSection, Text } from '@/components/ui';
import { SCAN_MODES } from '@/features/scan/modes';
import { useAppStore } from '@/store/appStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Haptics, appearance and the default scanner mode. */
export default function PreferencesScreen() {
  const { t } = useTranslation();
  const preferences = useAppStore((state) => state.preferences);
  const setPreferences = useAppStore((state) => state.setPreferences);

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.preferences.title')} />}
      testID="settings-preferences"
    >
      <SettingsSection style={styles.section}>
        <SettingsRow
          label={t('settingsScreens.preferences.haptics')}
          description={t('settingsScreens.preferences.hapticsHint')}
          icon="phone"
          toggle={{
            value: preferences.haptics,
            onChange: (value) => setPreferences({ haptics: value }),
          }}
          testID="pref-haptics"
        />
      </SettingsSection>
      <SettingsSection title={t('settingsScreens.preferences.appearance')}>
        <SettingsRow
          label={t('settingsScreens.preferences.appearanceLight')}
          icon="bulb"
          trailing={
            <Text variant="small" color="textMuted">
              {t('settingsScreens.preferences.appearanceNote')}
            </Text>
          }
          chevron={false}
        />
      </SettingsSection>
      <Text
        variant="sectionLabel"
        color="textMuted"
        style={styles.label}
        accessibilityRole="header"
      >
        {t('settingsScreens.preferences.defaultMode')}
      </Text>
      <Text variant="small" color="textMuted" style={styles.hint}>
        {t('settingsScreens.preferences.defaultModeHint')}
      </Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {SCAN_MODES.map((mode) => (
          <Chip
            key={mode.key}
            label={t(mode.labelKey)}
            selected={preferences.defaultScanMode === mode.key}
            onPress={() => setPreferences({ defaultScanMode: mode.key })}
            testID={`pref-mode-${mode.key}`}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: rs(spacing.md) },
  label: { marginBottom: rs(4) },
  hint: { marginBottom: rs(spacing.sm) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
});
