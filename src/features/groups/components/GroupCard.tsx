import { Image } from 'expo-image';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, PressableScale, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Group } from '@/types';

export interface GroupCardProps {
  group: Group;
  onPress: (group: Group) => void;
  onToggleJoin: (group: Group) => void;
  joining?: boolean;
}

/** Discover row: round artwork, name, member count, two-line description and the Join pill. */
function GroupCardComponent({ group, onPress, onToggleJoin, joining = false }: GroupCardProps) {
  const { t } = useTranslation();
  return (
    <PressableScale
      onPress={() => onPress(group)}
      haptic="light"
      pressedScale={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${group.name}, ${t('groups.members', { count: group.memberCount })}`}
      style={styles.card}
      testID={`group-${group.id}`}
    >
      <GroupArtwork group={group} size={64} />
      <View style={styles.text}>
        <Text variant="label" color="text" numberOfLines={2}>
          {group.name}
        </Text>
        <Text variant="small" color="textMuted">
          {t('groups.members', { count: group.memberCount })}
        </Text>
        <Text variant="small" color="textMuted" numberOfLines={2}>
          {group.description}
        </Text>
      </View>
      {group.kind === 'community' ? (
        <Button
          title={group.joined ? t('groups.joined') : t('groups.join')}
          size="sm"
          variant={group.joined ? 'secondary' : 'primary'}
          onPress={() => onToggleJoin(group)}
          loading={joining}
          accessibilityLabel={`${group.joined ? t('groups.joined') : t('groups.join')} ${group.name}`}
          style={styles.join}
          testID={`join-${group.id}`}
        />
      ) : null}
    </PressableScale>
  );
}

export const GroupCard = memo(GroupCardComponent);

export function GroupArtwork({ group, size }: { group: Group; size: number }) {
  return (
    <View
      style={[styles.artwork, { width: rs(size), height: rs(size), borderRadius: rs(size) / 2 }]}
    >
      <Image
        source={group.imageUri ? { uri: group.imageUri } : { blurhash: group.blurhash }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    padding: rs(spacing.md),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  artwork: { overflow: 'hidden', backgroundColor: colors.surfaceStrong },
  text: { flex: 1, gap: 2 },
  join: { paddingHorizontal: rs(spacing.md), minWidth: rs(84) },
});
