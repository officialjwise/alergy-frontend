import { Image } from 'expo-image';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { VerdictBadge } from '@/components/app/VerdictBadge';
import { Avatar, Icon, PressableScale, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Post } from '@/types';
import { formatRelativeDay, formatTime } from '@/utils/date';

export interface PostCardProps {
  post: Post;
  onPress?: (post: Post) => void;
  onReact: (post: Post, emoji: string) => void;
  onAuthorPress?: (post: Post) => void;
  /** Full layout on the post detail screen (no truncation). */
  expanded?: boolean;
}

/** Feed post: author, text, photo, food with a verdict per member, reactions and comment count. */
function PostCardComponent({
  post,
  onPress,
  onReact,
  onAuthorPress,
  expanded = false,
}: PostCardProps) {
  const { t, i18n } = useTranslation();
  const when = `${formatRelativeDay(post.createdAt, i18n.language, {
    today: t('history.today'),
    yesterday: t('history.yesterday'),
  })} · ${formatTime(post.createdAt, i18n.language)}`;
  const body = (
    <>
      <PressableScale
        onPress={() => onAuthorPress?.(post)}
        disabled={!onAuthorPress}
        haptic="light"
        pressedScale={0.99}
        accessibilityRole="button"
        accessibilityLabel={`${post.author.name}, ${when}`}
        style={styles.author}
      >
        <Avatar name={post.author.name} color={post.author.color} size={36} bordered={false} />
        <View style={styles.authorText}>
          <Text variant="label" color="text" numberOfLines={1}>
            {post.author.isMe ? t('groups.youLabel') : post.author.name}
          </Text>
          <Text variant="small" color="textMuted">
            {when}
          </Text>
        </View>
        {post.author.isOwner ? <Icon name="crown" size={rs(16)} color="gold" /> : null}
      </PressableScale>
      <Text variant="body" color="textBody" numberOfLines={expanded ? undefined : 4}>
        {post.text}
      </Text>
      {post.imageUri || post.blurhash ? (
        <Image
          source={post.imageUri ? { uri: post.imageUri } : { blurhash: post.blurhash ?? '' }}
          style={styles.image}
          contentFit="cover"
          accessibilityLabel={post.foodName ?? ''}
        />
      ) : null}
      {post.foodName ? (
        <View style={styles.food}>
          <Text variant="label" color="text" numberOfLines={1}>
            {post.foodName}
          </Text>
          <View style={styles.verdicts}>
            {post.verdicts.map((verdict) => (
              <VerdictBadge
                key={verdict.memberId}
                kind={verdict.kind}
                name={post.verdicts.length > 1 ? verdict.name : undefined}
              />
            ))}
          </View>
        </View>
      ) : null}
      <View style={styles.footer}>
        {post.reactions.map((reaction) => (
          <PressableScale
            key={reaction.emoji}
            onPress={() => onReact(post, reaction.emoji)}
            haptic="selection"
            pressedScale={0.9}
            accessibilityRole="button"
            accessibilityLabel={t('groups.reactionsA11y', {
              emoji: reaction.emoji,
              count: reaction.count,
            })}
            accessibilityState={{ selected: reaction.reacted }}
            style={[styles.reaction, reaction.reacted ? styles.reacted : null]}
          >
            <Text variant="small">{reaction.emoji}</Text>
            <Text variant="small" color={reaction.reacted ? 'text' : 'textMuted'}>
              {reaction.count}
            </Text>
          </PressableScale>
        ))}
        <View style={styles.comments}>
          <Icon name="chat" size={rs(16)} color="textMuted" outline />
          <Text variant="small" color="textMuted">
            {post.commentCount}
          </Text>
        </View>
      </View>
    </>
  );
  if (onPress) {
    return (
      <PressableScale
        onPress={() => onPress(post)}
        haptic="light"
        pressedScale={0.99}
        accessibilityRole="button"
        accessibilityLabel={`${post.author.name}: ${post.text}`}
        style={styles.card}
        testID={`post-${post.id}`}
      >
        {body}
      </PressableScale>
    );
  }
  return (
    <View style={styles.card} testID={`post-${post.id}`}>
      {body}
    </View>
  );
}

export const PostCard = memo(PostCardComponent);

const styles = StyleSheet.create({
  card: {
    gap: rs(spacing.sm),
    padding: rs(spacing.md),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  author: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  authorText: { flex: 1 },
  image: { height: rs(180), borderRadius: radii.card, backgroundColor: colors.surfaceStrong },
  food: { gap: rs(6) },
  verdicts: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(6) },
  footer: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs), marginTop: rs(2) },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: rs(spacing.xs),
    minHeight: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reacted: { backgroundColor: colors.surfaceStrong, borderColor: colors.primary },
  comments: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
});
