import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Avatar,
  Button,
  confirm,
  Divider,
  ErrorState,
  ListRow,
  NavHeader,
  Screen,
  Sheet,
  showToast,
  Skeleton,
  Text,
  TextField,
  useSheetRef,
} from '@/components/ui';
import { PostCard } from '@/features/groups/components/PostCard';
import {
  useAddComment,
  useBlockMember,
  useComments,
  usePost,
  useReact,
} from '@/features/groups/useGroups';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { formatRelativeDay, formatTime } from '@/utils/date';

/** Post detail with comments and a composer; more menu for report and block. */
export default function PostDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = usePost(id);
  const comments = useComments(id);
  const react = useReact();
  const addComment = useAddComment();
  const block = useBlockMember();
  const moreRef = useSheetRef();
  const [text, setText] = useState('');

  const send = useCallback(() => {
    if (!id || !text.trim()) return;
    addComment.mutate(
      { postId: id, text },
      {
        onSuccess: () => {
          setText('');
          showToast({ message: t('groups.commentSent'), icon: 'chat' });
        },
      },
    );
  }, [addComment, id, t, text]);

  const blockAuthor = useCallback(async () => {
    if (!post.data) return;
    const name = post.data.author.name;
    const ok = await confirm({
      title: t('groups.blockTitle', { name }),
      message: t('groups.blockBody'),
      confirmLabel: t('groups.block', { name }),
      cancelLabel: t('common.cancel'),
      destructive: true,
      icon: 'block',
    });
    if (!ok) return;
    block.mutate(post.data.author.id, {
      onSuccess: () => {
        showToast({ message: t('groups.blocked', { name }), icon: 'block' });
        router.back();
      },
    });
  }, [block, post.data, router, t]);

  if (post.isLoading || (!post.data && !post.isError)) {
    return (
      <Screen header={<NavHeader />}>
        <Skeleton height={rs(220)} radius={radii.lg} style={styles.gap} />
      </Screen>
    );
  }
  if (post.isError || !post.data) {
    return (
      <Screen header={<NavHeader />}>
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void post.refetch()}
        />
      </Screen>
    );
  }

  const item = post.data;
  return (
    <Screen
      header={
        <NavHeader
          rightIcon="more"
          rightLabel={t('groups.more')}
          onRightPress={() => moreRef.current?.present()}
        />
      }
      keyboardAvoiding
      footer={
        <View style={styles.composer}>
          <TextField
            value={text}
            onChangeText={setText}
            placeholder={t('groups.commentPlaceholder')}
            returnKeyType="send"
            onSubmitEditing={send}
            style={styles.input}
            testID="comment-input"
          />
          <Button
            title={t('groups.send')}
            size="md"
            onPress={send}
            disabled={!text.trim()}
            loading={addComment.isPending}
            style={styles.send}
            testID="comment-send"
          />
        </View>
      }
      testID="post-detail"
    >
      <View style={styles.post}>
        <PostCard
          post={item}
          expanded
          onReact={(current, emoji) => react.mutate({ postId: current.id, emoji })}
          onAuthorPress={(current) =>
            router.push({ pathname: '/members/[id]', params: { id: current.author.id } })
          }
        />
      </View>
      <Text variant="label" color="text" style={styles.commentsTitle} accessibilityRole="header">
        {t('groups.comments', { count: comments.data?.length ?? item.commentCount })}
      </Text>
      {comments.isLoading && !comments.data ? (
        <Skeleton height={rs(64)} radius={radii.card} />
      ) : (comments.data ?? []).length === 0 ? (
        <Text variant="body" color="textMuted">
          {t('groups.noComments')}
        </Text>
      ) : (
        <View style={styles.comments}>
          {(comments.data ?? []).map((comment, index) => (
            <View key={comment.id}>
              <View style={styles.comment}>
                <Avatar
                  name={comment.author.name}
                  color={comment.author.color}
                  size={32}
                  bordered={false}
                />
                <View style={styles.commentText}>
                  <View style={styles.commentMeta}>
                    <Text variant="label" color="text">
                      {comment.author.isMe ? t('groups.youLabel') : comment.author.name}
                    </Text>
                    <Text variant="small" color="textMuted">
                      {formatRelativeDay(comment.createdAt, i18n.language, {
                        today: t('history.today'),
                        yesterday: t('history.yesterday'),
                      })}{' '}
                      · {formatTime(comment.createdAt, i18n.language)}
                    </Text>
                  </View>
                  <Text variant="body" color="textBody">
                    {comment.text}
                  </Text>
                </View>
              </View>
              {index < (comments.data?.length ?? 0) - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      )}
      <Sheet ref={moreRef} title={t('groups.more')} closeLabel={t('common.close')}>
        <View style={styles.sheet}>
          <ListRow
            label={t('groups.report')}
            icon="flag"
            chevron
            onPress={() => {
              moreRef.current?.dismiss();
              router.push({ pathname: '/groups/posts/[id]/report', params: { id: item.id } });
            }}
          />
          {!item.author.isMe ? (
            <>
              <Divider />
              <ListRow
                label={t('groups.block', { name: item.author.name })}
                icon="block"
                destructive
                chevron
                onPress={() => {
                  moreRef.current?.dismiss();
                  void blockAuthor();
                }}
              />
            </>
          ) : null}
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  post: { marginTop: rs(spacing.sm) },
  commentsTitle: { marginTop: rs(spacing.xl), marginBottom: rs(spacing.sm) },
  comments: { gap: rs(spacing.xs) },
  comment: { flexDirection: 'row', gap: rs(spacing.sm), paddingVertical: rs(spacing.sm) },
  commentText: { flex: 1, gap: 2 },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: rs(spacing.xs),
    flexWrap: 'wrap',
  },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: rs(spacing.xs) },
  input: { flex: 1 },
  send: { paddingHorizontal: rs(spacing.md), backgroundColor: colors.primary },
  sheet: { paddingBottom: rs(spacing.sm) },
});
