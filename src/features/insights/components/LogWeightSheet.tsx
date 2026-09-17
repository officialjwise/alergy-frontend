import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, PressableScale, Sheet, showToast, Text, type SheetRef } from '@/components/ui';
import { pickDocumentPhoto } from '@/features/actionPlan/useActionPlan';
import { borders, colors, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { typography } from '@/theme/typography';

export interface LogWeightSheetProps {
  /** Pre-filled with the current weight. */
  initialLbs: number | null;
  saving: boolean;
  onSave: (weightLbs: number, photoUri?: string) => void;
}

/** Weight in pounds with an optional progress photo. */
export const LogWeightSheet = forwardRef<SheetRef, LogWeightSheetProps>(function LogWeightSheet(
  { initialLbs, saving, onSave },
  ref,
) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialLbs === null ? '' : String(initialLbs));
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  useEffect(() => setValue(initialLbs === null ? '' : String(initialLbs)), [initialLbs]);
  const parsed = Number(value.replace(',', '.'));
  const valid = Number.isFinite(parsed) && parsed > 20 && parsed < 1500;

  const addPhoto = async () => {
    const uri = await pickDocumentPhoto();
    if (uri === 'denied') {
      showToast({ message: t('progressPhotos.permissionDenied'), icon: 'alert' });
      return;
    }
    if (uri) setPhoto(uri);
  };

  return (
    <Sheet ref={ref} title={t('weight.sheetTitle')} closeLabel={t('common.close')}>
      <View style={styles.wrap}>
        <Text variant="label" color="text">
          {t('weight.weightLabel')}
        </Text>
        <View style={styles.inputRow}>
          <BottomSheetTextInput
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            accessibilityLabel={t('weight.weightLabel')}
            testID="weight-input"
          />
          <Text variant="label" color="textMuted">
            lbs
          </Text>
        </View>
        <PressableScale
          onPress={() => void addPhoto()}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={t('weight.addPhoto')}
          style={styles.photo}
        >
          <Icon name={photo ? 'checkCircle' : 'camera'} size={rs(20)} color={photo ? 'success' : 'textBody'} outline={!photo} />
          <Text variant="label" color="textBody">
            {photo ? t('weight.photoAdded') : t('weight.addPhoto')}
          </Text>
        </PressableScale>
        <Button
          title={t('common.save')}
          onPress={() => onSave(Math.round(parsed * 10) / 10, photo)}
          disabled={!valid}
          loading={saving}
          haptic="medium"
          style={styles.save}
        />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: rs(spacing.sm), paddingTop: rs(spacing.xs) },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    height: rs(sizes.input),
    paddingHorizontal: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  input: { flex: 1, ...typography.stat, color: colors.text, paddingVertical: 0 },
  photo: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs), minHeight: 44 },
  save: { marginTop: rs(spacing.xs) },
});
