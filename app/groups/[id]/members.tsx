import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Avatar,
  Card,
  Divider,
  ErrorState,
  Icon,
  ListRow,
  NavHeader,
  Screen,
  Skeleton,
} from '@/components/ui';
import { useGroup, useGroupMembers } from '@/features/groups/useGroups';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Everyone in a group with their streak; the owner is marked. */
export default function GroupMembersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useGroup(id);
  const members = useGroupMembers(id);

  return (
    <Screen
      header={<NavHeader title={group.data?.name ?? t('groups.members_title')} />}
      testID="group-members"
    >
      {members.isLoading && !members.data ? (
        <Skeleton height={rs(240)} radius={radii.lg} style={styles.gap} />
      ) : members.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void members.refetch()}
        />
      ) : (
        <Card variant="outlined" padding={spacing.xs} style={styles.gap}>
          {(members.data ?? []).map((member, index) => (
            <View key={member.id}>
              <ListRow
                label={member.isMe ? t('groups.youLabel') : member.name}
                description={
                  member.isOwner
                    ? t('groups.owner')
                    : member.profileId
                      ? t('groups.familyMember')
                      : undefined
                }
                value={t('groups.streak', { count: member.streak })}
                leading={
                  <Avatar name={member.name} color={member.color} size={40} bordered={false} />
                }
                trailing={
                  member.isOwner ? <Icon name="crown" size={rs(16)} color="gold" /> : undefined
                }
                chevron
                onPress={() =>
                  router.push({ pathname: '/members/[id]', params: { id: member.id } })
                }
                style={styles.row}
              />
              {index < (members.data?.length ?? 0) - 1 ? <Divider inset={rs(64)} /> : null}
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  row: { paddingHorizontal: rs(spacing.sm) },
});
