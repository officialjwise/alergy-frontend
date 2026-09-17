import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, StyleSheet, View } from 'react-native';

import {
  Button,
  Chip,
  confirm,
  Icon,
  NavHeader,
  OptionCard,
  PressableScale,
  Screen,
  SettingsRow,
  SettingsSection,
  showToast,
  Text,
  TextField,
  useSheetRef,
} from '@/components/ui';
import { pickDocumentPhoto } from '@/features/actionPlan/useActionPlan';
import { useScan } from '@/features/history/useHistory';
import { DateTimeSheet } from '@/features/reactions/components/DateTimeSheet';
import { FoodPickerSheet } from '@/features/reactions/components/FoodPickerSheet';
import { useAddReaction } from '@/features/reactions/useReactions';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ReactionSeverity, Symptom } from '@/types';
import { formatShortDate, formatTime } from '@/utils/date';

const SYMPTOMS: Symptom[] = [
  'hives',
  'itching',
  'swelling',
  'stomach',
  'nausea',
  'vomiting',
  'diarrhea',
  'breathing',
  'dizziness',
  'other',
];
const SEVERITIES: ReactionSeverity[] = ['mild', 'moderate', 'severe'];

/** Log a reaction: when, which food, symptoms, severity, notes and an optional photo. */
export default function LogReactionScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ scanId?: string }>();
  const profile = useProfileStore(selectActiveProfile);
  const linkedScan = useScan(params.scanId);
  const add = useAddReaction();
  const dateRef = useSheetRef();
  const foodRef = useSheetRef();

  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const [foodName, setFoodName] = useState('');
  const [scanId, setScanId] = useState<string | undefined>(params.scanId);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [severity, setSeverity] = useState<ReactionSeverity | null>(null);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [prefilled, setPrefilled] = useState(false);

  // Prefill the food from a linked scan once it loads (derived, not effect-driven state).
  if (!prefilled && linkedScan.data && !foodName) {
    setFoodName(linkedScan.data.product.name);
    setPrefilled(true);
  }

  const dirty =
    foodName.trim().length > 0 ||
    symptoms.length > 0 ||
    severity !== null ||
    notes.trim().length > 0 ||
    !!photoUri;
  const valid = foodName.trim().length > 0 && symptoms.length > 0 && severity !== null;

  const leave = useCallback(async () => {
    if (!dirty) {
      router.back();
      return;
    }
    const discard = await confirm({
      title: t('reactions.discardTitle'),
      message: t('reactions.discardBody'),
      confirmLabel: t('fix.discard'),
      cancelLabel: t('fix.keepEditing'),
      destructive: true,
      icon: 'trash',
    });
    if (discard) router.back();
  }, [dirty, router, t]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      void leave();
      return true;
    });
    return () => sub.remove();
  }, [leave]);

  const toggleSymptom = (symptom: Symptom) =>
    setSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom],
    );

  const addPhoto = async () => {
    const uri = await pickDocumentPhoto();
    if (uri === 'denied') {
      showToast({ message: t('progressPhotos.permissionDenied'), icon: 'alert' });
      return;
    }
    if (uri) setPhotoUri(uri);
  };

  const save = () => {
    if (!profile || !valid || !severity) return;
    add.mutate(
      {
        profileId: profile.id,
        occurredAt: occurredAt.toISOString(),
        foodName: foodName.trim(),
        scanId,
        symptoms,
        severity,
        notes: notes.trim() || undefined,
        photoUri,
      },
      {
        onSuccess: () => {
          showToast({ message: t('reactions.saved'), icon: 'checkCircle' });
          router.back();
        },
        onError: () => showToast({ message: t('states.errorTitle'), icon: 'alert' }),
      },
    );
  };

  const whenLabel = useMemo(
    () =>
      `${formatShortDate(occurredAt.toISOString(), i18n.language)} · ${formatTime(occurredAt.toISOString(), i18n.language)}`,
    [i18n.language, occurredAt],
  );

  return (
    <Screen
      header={<NavHeader title={t('reactions.newTitle')} onLeftPress={() => void leave()} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('reactions.save')}
          onPress={save}
          disabled={!valid}
          loading={add.isPending}
          haptic="medium"
          testID="reaction-save"
        />
      }
      testID="reaction-new"
    >
      <View style={styles.notice} accessibilityRole="text">
        <Icon name="alert" size={rs(20)} color="danger" />
        <Text variant="small" color="textBody" style={styles.noticeText}>
          {t('reactions.emergency')}
        </Text>
      </View>

      <SettingsSection style={styles.section}>
        <SettingsRow
          label={t('reactions.when')}
          icon="clock"
          value={whenLabel}
          onPress={() => dateRef.current?.present()}
          testID="reaction-when"
        />
      </SettingsSection>

      <TextField
        label={t('reactions.food')}
        value={foodName}
        onChangeText={(value) => {
          setFoodName(value);
          setScanId(undefined);
        }}
        placeholder={t('reactions.foodPlaceholder')}
        autoCapitalize="sentences"
        returnKeyType="done"
        testID="reaction-food"
      />
      <Button
        title={t('reactions.pickFromHistory')}
        variant="text"
        onPress={() => foodRef.current?.present()}
        style={styles.pick}
      />

      <Text variant="label" color="text" style={styles.label} accessibilityRole="header">
        {t('reactions.symptoms')}
      </Text>
      <View style={styles.chips}>
        {SYMPTOMS.map((symptom) => (
          <Chip
            key={symptom}
            label={t(`reactions.symptom_${symptom}`)}
            selected={symptoms.includes(symptom)}
            onPress={() => toggleSymptom(symptom)}
            testID={`symptom-${symptom}`}
          />
        ))}
      </View>

      <Text variant="label" color="text" style={styles.label} accessibilityRole="header">
        {t('reactions.severity')}
      </Text>
      <View style={styles.options}>
        {SEVERITIES.map((level) => (
          <OptionCard
            key={level}
            label={t(`reactions.severity_${level}`)}
            description={t(`reactions.severityHint_${level}`)}
            icon={level === 'severe' ? 'alert' : level === 'moderate' ? 'warning' : 'info'}
            density="compact"
            selected={severity === level}
            onPress={() => setSeverity(level)}
            testID={`severity-${level}`}
          />
        ))}
      </View>

      <TextField
        label={t('reactions.notes')}
        value={notes}
        onChangeText={setNotes}
        placeholder={t('reactions.notesPlaceholder')}
        multiline
        style={styles.notes}
        testID="reaction-notes"
      />

      <Text variant="label" color="text" style={styles.label}>
        {t('reactions.photo')}
      </Text>
      {photoUri ? (
        <View style={styles.photoRow}>
          <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
          <PressableScale
            onPress={() => setPhotoUri(undefined)}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={t('reactions.removePhoto')}
            style={styles.removePhoto}
          >
            <Icon name="close" size={rs(18)} color="text" />
          </PressableScale>
        </View>
      ) : (
        <Button
          title={t('reactions.addPhoto')}
          variant="secondary"
          size="md"
          leading={<Icon name="image" size={rs(20)} color="text" outline />}
          onPress={() => void addPhoto()}
          style={styles.addPhoto}
        />
      )}

      <DateTimeSheet ref={dateRef} value={occurredAt} onChange={setOccurredAt} />
      <FoodPickerSheet
        ref={foodRef}
        profileId={profile?.id ?? null}
        onPick={(scan) => {
          setFoodName(scan.product.name);
          setScanId(scan.id);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(spacing.sm),
    marginTop: rs(spacing.md),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    backgroundColor: colors.dangerTint,
  },
  noticeText: { flex: 1 },
  section: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.md) },
  pick: { alignSelf: 'flex-start' },
  label: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.xs) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  options: { gap: rs(spacing.xs) },
  notes: { marginTop: rs(spacing.lg) },
  photoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: rs(spacing.sm) },
  photo: {
    width: rs(120),
    height: rs(120),
    borderRadius: radii.card,
    backgroundColor: colors.surfaceStrong,
  },
  removePhoto: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: { alignSelf: 'flex-start', paddingHorizontal: rs(spacing.lg) },
});
