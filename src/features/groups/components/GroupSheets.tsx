import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { GroupArtwork } from './GroupCard';
import { Chip, Divider, ListRow, RadioCheck, Sheet, type SheetRef } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Group, PostFilter } from '@/types';

/** Switch between the groups the user belongs to. */
export const GroupSwitcherSheet = forwardRef<
  SheetRef,
  { groups: Group[]; currentId: string; onSelect: (group: Group) => void }
>(function GroupSwitcherSheet({ groups, currentId, onSelect }, ref) {
  const { t } = useTranslation();
  const close = () => {
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
  };
  return (
    <Sheet ref={ref} title={t('groups.switch')} closeLabel={t('common.close')}>
      <View style={styles.list}>
        {groups.map((group, index) => (
          <View key={group.id}>
            <ListRow
              label={group.name}
              description={t('groups.members', { count: group.memberCount })}
              leading={<GroupArtwork group={group} size={40} />}
              trailing={<RadioCheck selected={group.id === currentId} />}
              onPress={() => {
                close();
                onSelect(group);
              }}
              accessibilityLabel={group.name}
            />
            {index < groups.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </View>
    </Sheet>
  );
});

const FILTERS: PostFilter[] = ['all', 'safe', 'caution', 'unsafe', 'unknown'];

/** Filter the feed by the verdict shown on posts. */
export const FeedFilterSheet = forwardRef<
  SheetRef,
  { value: PostFilter; onChange: (value: PostFilter) => void }
>(function FeedFilterSheet({ value, onChange }, ref) {
  const { t } = useTranslation();
  const label = (filter: PostFilter) =>
    filter === 'all' ? t('groups.filterAll') : t(`verdict.${filter}`);
  return (
    <Sheet ref={ref} title={t('groups.filter')} closeLabel={t('common.close')}>
      <View style={styles.chips}>
        {FILTERS.map((filter) => (
          <Chip
            key={filter}
            label={label(filter)}
            selected={value === filter}
            onPress={() => {
              onChange(filter);
              if (ref && typeof ref !== 'function') ref.current?.dismiss();
            }}
          />
        ))}
      </View>
    </Sheet>
  );
});

/** Invite and leave actions for a group. */
export const GroupMoreSheet = forwardRef<
  SheetRef,
  { group: Group; onInvite: () => void; onLeave: () => void }
>(function GroupMoreSheet({ group, onInvite, onLeave }, ref) {
  const { t } = useTranslation();
  const run = (action: () => void) => () => {
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
    action();
  };
  return (
    <Sheet ref={ref} title={group.name} closeLabel={t('common.close')}>
      <View style={styles.list}>
        {group.kind === 'private' ? (
          <>
            <ListRow label={t('groups.invite')} icon="link" onPress={run(onInvite)} chevron />
            <Divider />
          </>
        ) : null}
        {group.id !== 'g-family' ? (
          <ListRow
            label={t('groups.leave')}
            icon="exit"
            destructive
            onPress={run(onLeave)}
            chevron
          />
        ) : null}
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  list: { paddingBottom: rs(spacing.sm) },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(spacing.xs),
    paddingBottom: rs(spacing.lg),
  },
});
