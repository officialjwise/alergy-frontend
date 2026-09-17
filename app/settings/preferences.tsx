import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, NavHeader, PressableScale, Screen, SettingsRow, SettingsSection, Text, type IconName } from '@/components/ui';
import { useAppStore, type Preferences } from '@/store/appStore';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const APPEARANCES: { key: Preferences['appearance']; icon: IconName }[] = [
  { key: 'system', icon: 'phoneSettings' },
  { key: 'light', icon: 'sun' },
  { key: 'dark', icon: 'moon' },
];

const TOGGLES: { key: keyof Pick<Preferences, 'badgeCelebrations' | 'liveActivity' | 'addBurnedCalories' | 'rolloverCalories' | 'autoAdjustMacros'> }[] = [
  { key: 'badgeCelebrations' },
  { key: 'liveActivity' },
  { key: 'addBurnedCalories' },
  { key: 'rolloverCalories' },
  { key: 'autoAdjustMacros' },
];

/** Preferences: appearance tiles and the tracking toggles, plus marketing emails. */
export default function PreferencesScreen() {
  const { t } = useTranslation();
  const preferences = useAppStore((state) => state.preferences);
  const setPreferences = useAppStore((state) => state.setPreferences);
  const marketing = useAppStore((state) => state.marketingOptIn);
  const setMarketing = useAppStore((state) => state.setMarketingOptIn);

  return (
    <Screen header={<NavHeader title={t('settingsScreens.preferences.title')} />} testID="settings-preferences">
      <View style={styles.appearance}>
        <Text variant="label" color="text">
          {t('settingsScreens.preferences.appearance')}
        </Text>
        <Text variant="small" color="textMuted">
          {t('settingsScreens.preferences.appearanceHint')}
        </Text>
        <View style={styles.tiles} accessibilityRole="radiogroup">
          {APPEARANCES.map((item) => {
            const selected = preferences.appearance === item.key;
            const dark = item.key === 'dark';
            return (
              <PressableScale
                key={item.key}
                onPress={() => setPreferences({ appearance: item.key })}
                haptic="selection"
                pressedScale={0.97}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t(`settingsScreens.preferences.appearance_${item.key}`)}
                style={[styles.tile, selected ? styles.tileSelected : null]}
                testID={`pref-appearance-${item.key}`}
              >
                <View style={[styles.preview, dark ? styles.previewDark : null]}>
                  <View style={[styles.previewBar, dark ? styles.previewBarDark : null]} />
                  <View style={styles.previewRow}>
                    {(['protein', 'carbs', 'fat'] as const).map((token) => (
                      <View key={token} style={[styles.previewDot, { borderColor: colors[token] }]} />
                    ))}
                  </View>
                  {item.key === 'system' ? <View style={styles.previewHalf} /> : null}
                </View>
                <View style={styles.tileLabel}>
                  <Icon name={item.icon} size={rs(14)} color="text" outline />
                  <Text variant="small" color="text">
                    {t(`settingsScreens.preferences.appearance_${item.key}`)}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>
        {preferences.appearance !== 'light' ? (
          <Text variant="small" color="textMuted">
            {t('settingsScreens.preferences.appearanceNote')}
          </Text>
        ) : null}
      </View>

      <SettingsSection>
        {TOGGLES.map((item) => (
          <SettingsRow
            key={item.key}
            label={t(`settingsScreens.preferences.${item.key}`)}
            description={t(`settingsScreens.preferences.${item.key}Hint`)}
            toggle={{ value: preferences[item.key], onChange: (value) => setPreferences({ [item.key]: value }) }}
            testID={`pref-${item.key}`}
          />
        ))}
        <SettingsRow
          label={t('settingsScreens.preferences.marketingEmails')}
          description={t('settingsScreens.preferences.marketingEmailsHint', { app: t('home.appName') })}
          toggle={{ value: marketing, onChange: setMarketing }}
          testID="pref-marketing"
        />
      </SettingsSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  appearance: {
    marginTop: rs(spacing.md),
    marginBottom: rs(spacing.lg),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    gap: rs(4),
  },
  tiles: { flexDirection: 'row', gap: rs(spacing.xs), marginTop: rs(spacing.sm) },
  tile: { flex: 1, borderRadius: radii.sm, borderWidth: borders.selected, borderColor: 'transparent', padding: 4, gap: 6 },
  tileSelected: { borderColor: colors.primary },
  preview: { height: rs(64), borderRadius: radii.xs, backgroundColor: colors.surface, padding: 6, gap: 6, overflow: 'hidden' },
  previewDark: { backgroundColor: colors.primary },
  previewBar: { height: 8, borderRadius: 4, backgroundColor: colors.background, width: '70%' },
  previewBarDark: { backgroundColor: colors.textBody },
  previewRow: { flexDirection: 'row', gap: 4 },
  previewDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  previewHalf: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', backgroundColor: colors.primary, opacity: 0.85 },
  tileLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
});
