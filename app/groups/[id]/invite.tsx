import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { Button, Card, Icon, NavHeader, Screen, Skeleton, Text } from '@/components/ui';
import { useGroup, useInvite } from '@/features/groups/useGroups';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Invite link and code with share buttons and a QR placeholder drawn from the code. */
export default function InviteScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useGroup(id);
  const invite = useInvite(id);
  const name = group.data?.name ?? '';

  const share = (mode: 'link' | 'code') => {
    if (!invite.data) return;
    void Share.share({
      message:
        mode === 'link'
          ? t('groups.shareMessage', { name, link: invite.data.link, code: invite.data.code })
          : `${name}: ${invite.data.code}`,
    });
  };

  return (
    <Screen
      header={<NavHeader title={t('groups.invite')} />}
      footer={
        <View style={styles.actions}>
          <Button
            title={t('groups.shareLink')}
            leading={<Icon name="share" size={rs(20)} color="onPrimary" />}
            onPress={() => share('link')}
            disabled={!invite.data}
            haptic="medium"
            testID="invite-share-link"
          />
          <Button
            title={t('groups.shareCode')}
            variant="secondary"
            onPress={() => share('code')}
            disabled={!invite.data}
            testID="invite-share-code"
          />
        </View>
      }
      testID="group-invite"
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('groups.inviteTitle', { name })}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('groups.inviteBody')}
      </Text>
      {invite.data ? (
        <>
          <Card variant="outlined" padding={spacing.lg} style={styles.card}>
            <Text variant="small" color="textMuted">
              {t('groups.inviteLink')}
            </Text>
            <Text variant="label" color="text" selectable>
              {invite.data.link}
            </Text>
            <Text variant="small" color="textMuted" style={styles.codeLabel}>
              {t('groups.inviteCode')}
            </Text>
            <Text variant="statLg" color="text" selectable>
              {invite.data.code}
            </Text>
          </Card>
          <View style={styles.qrWrap} accessible accessibilityLabel={t('groups.qrHint')}>
            <QrPlaceholder seed={invite.data.code} />
            <Text variant="small" color="textMuted" align="center">
              {t('groups.qrHint')}
            </Text>
          </View>
        </>
      ) : (
        <Skeleton height={rs(160)} radius={radii.lg} style={styles.card} />
      )}
    </Screen>
  );
}

/** Deterministic module pattern from the code; replaced by a real QR when the backend issues links. */
function QrPlaceholder({ seed }: { seed: string }) {
  const size = 21;
  const cell = 7;
  let hash = 7;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i += 1) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    cells.push(((hash >>> 16) & 1) === 1);
  }
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  const inFinderRing = (x: number, y: number) => {
    const fx = x < 7 ? x : x - (size - 7);
    const fy = y < 7 ? y : y - (size - 7);
    return (
      fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4)
    );
  };
  return (
    <View style={styles.qr}>
      <Svg width={size * cell} height={size * cell}>
        {cells.map((on, index) => {
          const x = index % size;
          const y = Math.floor(index / size);
          const filled = finder(x, y) ? inFinderRing(x, y) : on;
          return filled ? (
            <Rect
              key={index}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={colors.text}
            />
          ) : null;
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rs(spacing.xl) },
  subtitle: { marginTop: rs(spacing.sm) },
  card: { marginTop: rs(spacing.xl), gap: rs(4) },
  codeLabel: { marginTop: rs(spacing.md) },
  qrWrap: { alignItems: 'center', gap: rs(spacing.sm), marginTop: rs(spacing.xl) },
  qr: {
    padding: rs(spacing.md),
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: { gap: rs(spacing.sm) },
});
