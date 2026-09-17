import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, NavHeader, Screen, showToast, Text, TextField } from '@/components/ui';
import { delay } from '@/utils/delay';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const CATEGORIES = ['scanning', 'profiles', 'groups', 'other'] as const;

/** Feature request form; the mock accepts every request. */
export default function RequestFeatureScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number] | null>(null);
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    await delay(600);
    setSending(false);
    showToast({ message: t('settingsScreens.requestFeature.sent'), icon: 'megaphone' });
    router.back();
  };

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.requestFeature.title')} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('settingsScreens.requestFeature.send')}
          onPress={() => void send()}
          disabled={!category || !summary.trim()}
          loading={sending}
          haptic="medium"
          testID="feature-send"
        />
      }
      testID="settings-request-feature"
    >
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('settingsScreens.requestFeature.subtitle')}
      </Text>
      <Text variant="label" color="text" style={styles.label} accessibilityRole="header">
        {t('settingsScreens.requestFeature.category')}
      </Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {CATEGORIES.map((item) => (
          <Chip
            key={item}
            label={t(`settingsScreens.requestFeature.cat_${item}`)}
            selected={category === item}
            onPress={() => setCategory(item)}
          />
        ))}
      </View>
      <TextField
        label={t('settingsScreens.requestFeature.summary')}
        value={summary}
        onChangeText={setSummary}
        placeholder={t('settingsScreens.requestFeature.summaryPlaceholder')}
        style={styles.field}
        testID="feature-summary"
      />
      <TextField
        label={t('settingsScreens.requestFeature.details')}
        value={details}
        onChangeText={setDetails}
        placeholder={t('settingsScreens.requestFeature.detailsPlaceholder')}
        multiline
        style={styles.field}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: rv(layout.titleTop / 2) },
  label: { marginTop: rv(spacing.xl), marginBottom: rs(spacing.xs) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  field: { marginTop: rv(spacing.lg) },
});
