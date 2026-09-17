import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  confirm,
  Icon,
  IconChip,
  NavHeader,
  Screen,
  showToast,
  Text,
  TextField,
} from '@/components/ui';
import { getServices } from '@/services';
import { queryClient } from '@/services/queryClient';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { clearAllStorage } from '@/store/storage';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const WARNINGS = ['w1', 'w2', 'w3', 'w4'] as const;

/** Three steps: warning, type DELETE, final confirmation; then everything is wiped. */
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const clearApp = useAppStore((state) => state.clear);
  const clearProfiles = useProfileStore((state) => state.clear);
  const resetOnboarding = useOnboardingStore((state) => state.reset);

  const finish = async () => {
    const ok = await confirm({
      title: t('settingsScreens.deleteAccount.finalTitle'),
      message: t('settingsScreens.deleteAccount.finalBody'),
      confirmLabel: t('settingsScreens.deleteAccount.finalConfirm'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      icon: 'trash',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await getServices().auth.deleteAccount();
    } finally {
      queryClient.clear();
      clearProfiles();
      clearApp();
      resetOnboarding();
      clearAllStorage();
      setBusy(false);
      showToast({ message: t('settingsScreens.deleteAccount.deleted'), icon: 'trash' });
      router.replace('/(onboarding)/welcome');
    }
  };

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.deleteAccount.title')} />}
      keyboardAvoiding
      footer={
        step === 'warning' ? (
          <Button
            title={t('settingsScreens.deleteAccount.continue')}
            variant="danger"
            onPress={() => setStep('confirm')}
            testID="delete-continue"
          />
        ) : (
          <Button
            title={t('settingsScreens.deleteAccount.confirm')}
            variant="danger"
            onPress={() => void finish()}
            disabled={typed.trim().toUpperCase() !== 'DELETE'}
            loading={busy}
            haptic="warning"
            testID="delete-confirm"
          />
        )
      }
      testID="settings-delete-account"
    >
      <View style={styles.hero}>
        <IconChip
          icon="trash"
          size={72}
          iconSize={32}
          background="dangerTint"
          color="danger"
          outline
        />
        <Text variant="title" color="text" align="center" accessibilityRole="header">
          {step === 'warning'
            ? t('settingsScreens.deleteAccount.warningTitle')
            : t('settingsScreens.deleteAccount.typeTitle')}
        </Text>
      </View>
      {step === 'warning' ? (
        <View style={styles.list}>
          {WARNINGS.map((key) => (
            <View key={key} style={styles.row}>
              <Icon name="closeCircle" size={rs(22)} color="danger" />
              <Text variant="body" color="textBody" style={styles.rowText}>
                {t(`settingsScreens.deleteAccount.${key}`)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <TextField
          value={typed}
          onChangeText={setTyped}
          placeholder={t('settingsScreens.deleteAccount.typePlaceholder')}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          style={styles.field}
          testID="delete-input"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: rs(spacing.md), marginTop: rv(layout.titleTop) },
  list: { gap: rs(spacing.sm), marginTop: rv(spacing.xl) },
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  rowText: { flex: 1 },
  field: { marginTop: rv(spacing.xl) },
});
