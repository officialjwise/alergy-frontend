import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Card,
  Divider,
  ListRow,
  NavHeader,
  RadioCheck,
  Screen,
  showToast,
  Text,
} from '@/components/ui';
import { setLanguage } from '@/i18n';
import { LANGUAGES } from '@/i18n/languages';
import { useAppStore } from '@/store/appStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { LanguageCode } from '@/types';

/** Pick the app language (same list as the welcome sheet). */
export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const current = useAppStore((state) => state.language) ?? (i18n.language as LanguageCode);
  const store = useAppStore((state) => state.setLanguage);

  const choose = (code: LanguageCode) => {
    store(code);
    void setLanguage(code);
    showToast({ message: t('settingsScreens.language.changed'), icon: 'globe' });
  };

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.language.title')} />}
      testID="settings-language"
    >
      <Card variant="outlined" padding={spacing.xs} style={styles.card}>
        {LANGUAGES.map((language, index) => (
          <View key={language.code}>
            <ListRow
              label={language.nativeName}
              leading={<Text variant="sectionTitle">{language.flag}</Text>}
              trailing={<RadioCheck selected={current === language.code} />}
              onPress={() => choose(language.code)}
              accessibilityLabel={language.nativeName}
              style={styles.row}
              testID={`language-${language.code}`}
            />
            {index < LANGUAGES.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: rs(spacing.md) },
  row: { paddingHorizontal: rs(spacing.sm) },
});
