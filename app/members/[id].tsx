import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Avatar,
  Button,
  confirm,
  ErrorState,
  Icon,
  NavHeader,
  Screen,
  SettingsRow,
  SettingsSection,
  showToast,
  Skeleton,
  Text,
} from '@/components/ui';
import { useBlockMember, useMember } from '@/features/groups/useGroups';
import { useProfileStore } from '@/store/profileStore';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** A group member: family members expose their profile actions, community members can be blocked. */
export default function MemberScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const member = useMember(id);
  const block = useBlockMember();
  const profiles = useProfileStore((state) => state.profiles);
  const activeProfileId = useProfileStore((state) => state.activeProfileId);
  const setActiveProfile = useProfileStore((state) => state.setActiveProfile);
  const removeProfile = useProfileStore((state) => state.removeProfile);

  const profile = member.data?.profileId
    ? (profiles.find((item) => item.id === member.data?.profileId) ?? null)
    : null;

  const remove = useCallback(async () => {
    if (!profile) return;
    const ok = await confirm({
      title: t('groups.removeTitle', { name: profile.name }),
      message: t('groups.removeBody'),
      confirmLabel: t('common.remove'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      icon: 'trash',
    });
    if (!ok) return;
    removeProfile(profile.id);
    showToast({ message: t('groups.removed', { name: profile.name }), icon: 'trash' });
    router.back();
  }, [profile, removeProfile, router, t]);

  const blockMember = useCallback(async () => {
    if (!member.data) return;
    const name = member.data.name;
    const ok = await confirm({
      title: t('groups.blockTitle', { name }),
      message: t('groups.blockBody'),
      confirmLabel: t('groups.block', { name }),
      cancelLabel: t('common.cancel'),
      destructive: true,
      icon: 'block',
    });
    if (!ok) return;
    block.mutate(member.data.id, {
      onSuccess: () => {
        showToast({ message: t('groups.blocked', { name }), icon: 'block' });
        router.back();
      },
    });
  }, [block, member.data, router, t]);

  if (member.isLoading || (!member.data && !member.isError)) {
    return (
      <Screen header={<NavHeader title={t('groups.memberTitle')} />}>
        <Skeleton height={rs(200)} radius={radii.lg} style={styles.gap} />
      </Screen>
    );
  }
  if (member.isError || !member.data) {
    return (
      <Screen header={<NavHeader title={t('groups.memberTitle')} />}>
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void member.refetch()}
        />
      </Screen>
    );
  }

  const item = member.data;
  const isFamily = !!profile;
  return (
    <Screen
      header={<NavHeader title={t('groups.memberTitle')} />}
      footer={
        isFamily ? (
          <Button
            title={t('groups.addFamily')}
            variant="secondary"
            leading={<Icon name="plus" size={rs(20)} color="text" />}
            onPress={() => router.push('/(onboarding)/who')}
            testID="member-add-family"
          />
        ) : !item.isMe ? (
          <Button
            title={t('groups.block', { name: item.name })}
            variant="danger"
            size="md"
            onPress={() => void blockMember()}
            loading={block.isPending}
            testID="member-block"
          />
        ) : undefined
      }
      testID="member-detail"
    >
      <View style={styles.hero}>
        <Avatar name={item.name} color={item.color} size={96} bordered={false} />
        <Text variant="title" color="text" align="center" accessibilityRole="header">
          {item.isMe ? t('groups.youLabel') : item.name}
        </Text>
        <View style={styles.meta}>
          {item.isOwner ? (
            <View style={styles.metaItem}>
              <Icon name="crown" size={rs(16)} color="gold" />
              <Text variant="small" color="textMuted">
                {t('groups.owner')}
              </Text>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <Icon name="shieldCheck" size={rs(16)} color="success" />
            <Text variant="small" color="textMuted">
              {t('groups.streak', { count: item.streak })}
            </Text>
          </View>
          {isFamily ? (
            <Text variant="small" color="textMuted">
              {t('groups.restrictions', { count: profile.restrictions.length })}
            </Text>
          ) : null}
        </View>
      </View>
      {isFamily ? (
        <SettingsSection title={t('groups.familyMember')} style={styles.section}>
          <SettingsRow
            label={t('groups.switchTo', { name: profile.name })}
            icon="swap"
            disabled={profile.id === activeProfileId}
            onPress={() => {
              setActiveProfile(profile.id);
              showToast({ message: t('groups.switchTo', { name: profile.name }), icon: 'person' });
            }}
          />
          <SettingsRow
            label={t('groups.editRestrictions')}
            icon="edit"
            onPress={() =>
              router.push({
                pathname: '/profiles/edit/[section]',
                params: { section: 'restrictions', profileId: profile.id },
              })
            }
          />
          <SettingsRow
            label={t('groups.removeMember')}
            icon="trash"
            destructive
            disabled={profiles.length <= 1}
            onPress={() => void remove()}
          />
        </SettingsSection>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  hero: { alignItems: 'center', gap: rs(spacing.sm), marginTop: rs(spacing.xl) },
  meta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: rs(spacing.md) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  section: { marginTop: rs(spacing.xl) },
});
