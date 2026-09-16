import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BackButton, Screen, Text } from '@/components/ui';
import { LEGAL_DOCS, type LegalDocKey } from '@/mocks/legal';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import { formatLongDate } from '@/utils/date';

/** Terms of Service / Privacy Policy viewer. */
export default function LegalScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const key: LegalDocKey = doc === 'privacy' ? 'privacy' : 'terms';
  const document = LEGAL_DOCS[key];

  return (
    <Screen header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}>
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t(document.titleKey)}
      </Text>
      <Text variant="small" color="textMuted" style={styles.updated}>
        {t('legal.lastUpdated', { date: formatLongDate(document.updated, i18n.language) })}
      </Text>
      {document.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text variant="sectionTitle" color="text" accessibilityRole="header">
            {section.heading}
          </Text>
          <Text variant="body" color="textBody" style={styles.body}>
            {section.body}
          </Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  updated: { marginTop: rs(spacing.xs) },
  section: { marginTop: rv(spacing.xl) },
  body: { marginTop: rs(spacing.xs) },
});
