import { mockHistoryService } from './historyService';
import { mockInsightsService } from './insightsService';
import { simulate } from './support';
import { evaluateProduct } from '../verdictEngine';
import { ServiceError, type GroupService } from '../types';
import { PRODUCTS } from '@/mocks/products';
import { useDevStore } from '@/store/devStore';
import { useProfileStore } from '@/store/profileStore';
import { storage, storageKeys } from '@/store/storage';
import type { Group, GroupMember, Post, PostComment, PostReaction, UserProfile } from '@/types';
import { createId } from '@/utils/id';
import { dayKey } from '@/utils/date';

/** Everything the user does in groups is kept on the device until the backend exists. */
interface GroupState {
  joined: string[];
  left: string[];
  created: Group[];
  posts: Post[];
  comments: Record<string, PostComment[]>;
  myReactions: Record<string, string[]>;
  blocked: string[];
}

const FAMILY_GROUP_ID = 'g-family';
const ME_ID = 'm-me';
const EMOJIS = ['👍', '❤️', '🙏'];

const hoursAgo = (hours: number): string => new Date(Date.now() - hours * 3_600_000).toISOString();

function load(): GroupState {
  const raw = storage.getString(storageKeys.groups);
  const empty: GroupState = {
    joined: [],
    left: [],
    created: [],
    posts: [],
    comments: {},
    myReactions: {},
    blocked: [],
  };
  if (!raw) return empty;
  try {
    return { ...empty, ...(JSON.parse(raw) as Partial<GroupState>) };
  } catch {
    return empty;
  }
}

function save(state: GroupState): void {
  storage.set(storageKeys.groups, JSON.stringify(state));
}

/** Community members are invented names, never real people. */
const COMMUNITY_MEMBERS: GroupMember[] = [
  { id: 'm-priya', name: 'Priya', color: '#3B9FD8', streak: 12, isOwner: true, isMe: false },
  { id: 'm-marcus', name: 'Marcus', color: '#1C9750', streak: 4, isOwner: false, isMe: false },
  { id: 'm-elena', name: 'Elena', color: '#E8A317', streak: 21, isOwner: false, isMe: false },
  { id: 'm-sam', name: 'Sam', color: '#F5433A', streak: 0, isOwner: false, isMe: false },
  { id: 'm-noor', name: 'Noor', color: '#7B61FF', streak: 7, isOwner: false, isMe: false },
];

const COMMUNITY_GROUPS: Omit<Group, 'joined' | 'owner'>[] = [
  {
    id: 'g-peanut-parents',
    name: 'Peanut allergy parents',
    description: 'Lunchbox ideas, school forms and what actually helps at parties.',
    kind: 'community',
    memberCount: 28861,
    blurhash: 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH',
    createdAt: hoursAgo(24 * 400),
  },
  {
    id: 'g-celiac',
    name: 'Celiac and gluten free',
    description: 'Label reading, safe brands and cross-contact questions.',
    kind: 'community',
    memberCount: 39140,
    blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    createdAt: hoursAgo(24 * 380),
  },
  {
    id: 'g-halal',
    name: 'Halal eating',
    description: 'Hidden gelatin, alcohol in flavourings and restaurant tips.',
    kind: 'community',
    memberCount: 2202,
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
    createdAt: hoursAgo(24 * 300),
  },
  {
    id: 'g-dairy-free',
    name: 'Dairy free living',
    description: 'Swaps that work, whey in disguise and eating out.',
    kind: 'community',
    memberCount: 22234,
    blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
    createdAt: hoursAgo(24 * 250),
  },
  {
    id: 'g-new',
    name: 'New to food allergies',
    description: 'Beginner questions, first wins and how to read a label.',
    kind: 'community',
    memberCount: 31606,
    blurhash: 'L8H2nEhy00~qo#of00of00ay00WB',
    createdAt: hoursAgo(24 * 200),
  },
  {
    id: 'g-eating-out',
    name: 'Eating out safely',
    description: 'Restaurants that get it, allergy cards and questions to ask.',
    kind: 'community',
    memberCount: 9512,
    blurhash: 'LHF5?xYk^6#M@-5c,1J5@[or[Q6.',
    createdAt: hoursAgo(24 * 150),
  },
];

interface SeedPost {
  id: string;
  groupId: string;
  authorId: string;
  hours: number;
  text: string;
  productId?: string;
  reactions: number[];
  comments: { authorId: string; text: string; hours: number }[];
}

const SEED_POSTS: SeedPost[] = [
  {
    id: 'p-1',
    groupId: 'g-peanut-parents',
    authorId: 'm-priya',
    hours: 3,
    text: 'These rice cakes are the first snack in weeks with a clean label. Checked twice, works for both kids.',
    productId: 'p-rice-cakes',
    reactions: [14, 6, 2],
    comments: [
      { authorId: 'm-marcus', text: 'Same here, they are in every lunchbox now.', hours: 2 },
      {
        authorId: 'm-elena',
        text: 'Do you know if the unsalted ones are made on the same line?',
        hours: 1,
      },
    ],
  },
  {
    id: 'p-2',
    groupId: 'g-peanut-parents',
    authorId: 'm-elena',
    hours: 28,
    text: 'The granola bar from the school vending machine flagged peanuts. Sent the label to the office.',
    productId: 'p-granola-bar',
    reactions: [9, 3, 11],
    comments: [{ authorId: 'm-priya', text: 'Thank you for flagging this.', hours: 20 }],
  },
  {
    id: 'p-3',
    groupId: 'g-peanut-parents',
    authorId: 'm-sam',
    hours: 70,
    text: 'Party this weekend. Any cupcake brands that people trust?',
    reactions: [2, 0, 1],
    comments: [],
  },
  {
    id: 'p-4',
    groupId: 'g-celiac',
    authorId: 'm-marcus',
    hours: 5,
    text: 'Sourdough loaf came back not safe because of wheat flour, in case anyone assumed sourdough was fine.',
    productId: 'p-sourdough',
    reactions: [21, 4, 8],
    comments: [{ authorId: 'm-noor', text: 'Common mistake, thanks for the reminder.', hours: 4 }],
  },
  {
    id: 'p-5',
    groupId: 'g-halal',
    authorId: 'm-noor',
    hours: 9,
    text: 'Gummy bears with beef gelatin again. The app caught it from the label photo.',
    productId: 'p-gummy-bears',
    reactions: [7, 2, 0],
    comments: [],
  },
  {
    id: 'p-6',
    groupId: 'g-dairy-free',
    authorId: 'm-elena',
    hours: 12,
    text: 'Oat milk works for you, dark chocolate did not. Whey hides in the strangest places.',
    productId: 'p-oat-milk',
    reactions: [11, 5, 3],
    comments: [],
  },
  {
    id: 'p-7',
    groupId: 'g-new',
    authorId: 'm-priya',
    hours: 30,
    text: 'Tip for new folks: scan the barcode first, then photograph the label if nothing comes up.',
    reactions: [30, 12, 6],
    comments: [{ authorId: 'm-sam', text: 'This saved me at the shop yesterday.', hours: 26 }],
  },
  {
    id: 'p-8',
    groupId: 'g-eating-out',
    authorId: 'm-marcus',
    hours: 48,
    text: 'Showed the allergy card in three languages on holiday. Kitchen staff loved it.',
    reactions: [18, 9, 4],
    comments: [],
  },
];

/** Family posts by the current user, only for the active mock data set. */
const FAMILY_POSTS: { id: string; hours: number; text: string; productId: string }[] = [
  {
    id: 'p-fam-1',
    hours: 6,
    text: 'Checked this for everyone before the picnic.',
    productId: 'p-hummus',
  },
  {
    id: 'p-fam-2',
    hours: 50,
    text: 'Not for the kids, sadly. Keeping it for the grown-ups.',
    productId: 'p-dark-chocolate',
  },
];

function currentProfiles(): UserProfile[] {
  return useProfileStore.getState().profiles;
}

function meMember(): GroupMember {
  const profiles = currentProfiles();
  const me = profiles.find((p) => p.profileFor === 'myself') ?? profiles[0];
  return {
    id: ME_ID,
    name: me?.name ?? 'You',
    color: me?.color ?? '#1C1A20',
    streak: 0,
    isOwner: true,
    profileId: me?.id,
    isMe: true,
  };
}

async function familyMembers(): Promise<GroupMember[]> {
  const profiles = currentProfiles();
  const today = dayKey(new Date());
  const me = meMember();
  return Promise.all(
    profiles.map(async (profile) => {
      const summary = await mockInsightsService.homeDashboard(profile.id, today);
      const isMe = profile.id === me.profileId;
      return {
        id: isMe ? ME_ID : `m-family-${profile.id}`,
        name: profile.name,
        color: profile.color,
        streak: summary.streak,
        isOwner: isMe,
        profileId: profile.id,
        isMe,
      };
    }),
  );
}

function familyGroup(): Group {
  const profiles = currentProfiles();
  return {
    id: FAMILY_GROUP_ID,
    name: 'My family',
    description: 'Your family profiles and the foods you check for them.',
    kind: 'private',
    memberCount: Math.max(1, profiles.length),
    blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
    joined: true,
    owner: true,
    code: 'FAM-2026',
    createdAt: profiles[0]?.createdAt ?? new Date().toISOString(),
  };
}

function communityGroups(state: GroupState): Group[] {
  const defaultJoined = useDevStore.getState().mockDataset === 'active' ? ['g-peanut-parents'] : [];
  return COMMUNITY_GROUPS.map((group) => ({
    ...group,
    owner: false,
    joined:
      (state.joined.includes(group.id) || defaultJoined.includes(group.id)) &&
      !state.left.includes(group.id),
  }));
}

function allGroups(state: GroupState): Group[] {
  return [familyGroup(), ...state.created, ...communityGroups(state)];
}

function memberById(id: string, family: GroupMember[]): GroupMember {
  return (
    family.find((m) => m.id === id) ??
    COMMUNITY_MEMBERS.find((m) => m.id === id) ??
    (id === ME_ID
      ? meMember()
      : { id, name: 'Member', color: '#85858A', streak: 0, isOwner: false, isMe: false })
  );
}

function reactionsFor(base: number[], mine: string[]): PostReaction[] {
  return EMOJIS.map((emoji, index) => ({
    emoji,
    count: (base[index] ?? 0) + (mine.includes(emoji) ? 1 : 0),
    reacted: mine.includes(emoji),
  }));
}

async function buildSeedPosts(state: GroupState, family: GroupMember[]): Promise<Post[]> {
  const community = SEED_POSTS.map<Post>((seed) => {
    const product = seed.productId ? PRODUCTS.find((p) => p.id === seed.productId) : undefined;
    const author = memberById(seed.authorId, family);
    const kind = product
      ? evaluateProduct(product, currentProfiles()[0] ?? sampleProfile()).kind
      : 'safe';
    return {
      id: seed.id,
      groupId: seed.groupId,
      author,
      createdAt: hoursAgo(seed.hours),
      text: seed.text,
      foodName: product?.name,
      blurhash: product?.blurhash,
      verdicts: product ? [{ memberId: author.id, name: author.name, kind }] : [],
      reactions: reactionsFor(seed.reactions, state.myReactions[seed.id] ?? []),
      commentCount: seed.comments.length + (state.comments[seed.id]?.length ?? 0),
    };
  });
  if (useDevStore.getState().mockDataset !== 'active') return community;
  const me = family.find((m) => m.isMe) ?? meMember();
  const familyPosts = FAMILY_POSTS.map<Post>((seed) => {
    const product = PRODUCTS.find((p) => p.id === seed.productId);
    return {
      id: seed.id,
      groupId: FAMILY_GROUP_ID,
      author: me,
      createdAt: hoursAgo(seed.hours),
      text: seed.text,
      foodName: product?.name,
      blurhash: product?.blurhash,
      verdicts: product
        ? currentProfiles().map((profile) => ({
            memberId: family.find((m) => m.profileId === profile.id)?.id ?? profile.id,
            name: profile.name,
            kind: evaluateProduct(product, profile).kind,
          }))
        : [],
      reactions: reactionsFor([2, 1, 0], state.myReactions[seed.id] ?? []),
      commentCount: state.comments[seed.id]?.length ?? 0,
    };
  });
  return [...familyPosts, ...community];
}

function sampleProfile(): UserProfile {
  return {
    id: 'sample',
    name: 'Sample',
    profileFor: 'myself',
    birthDate: null,
    restrictions: [{ ingredientId: 'peanuts', name: 'Peanuts', severity: 'severe' }],
    customIngredients: {},
    reasons: [],
    cautionLevel: 'may_contain',
    diet: 'none',
    goal: null,
    rememberFoods: true,
    color: '#1C1A20',
    createdAt: hoursAgo(24 * 30),
    updatedAt: hoursAgo(24 * 30),
  };
}

async function allPosts(state: GroupState): Promise<Post[]> {
  const family = await familyMembers();
  const seeded = await buildSeedPosts(state, family);
  const mine = state.posts.map((post) => ({
    ...post,
    reactions: reactionsFor(
      post.reactions.map((r) => r.count - (r.reacted ? 1 : 0)),
      state.myReactions[post.id] ?? [],
    ),
    commentCount: state.comments[post.id]?.length ?? 0,
  }));
  return [...mine, ...seeded]
    .filter((post) => !state.blocked.includes(post.author.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const mockGroupService: GroupService = {
  async list() {
    await simulate(0.5);
    return allGroups(load());
  },
  async get(id) {
    await simulate(0.3);
    return allGroups(load()).find((group) => group.id === id) ?? null;
  },
  async join(id) {
    await simulate(0.4);
    const state = load();
    state.joined = [...new Set([...state.joined, id])];
    state.left = state.left.filter((item) => item !== id);
    save(state);
    const group = allGroups(state).find((item) => item.id === id);
    if (!group) throw new ServiceError('Group not found', 'not_found');
    return group;
  },
  async leave(id) {
    await simulate(0.4);
    const state = load();
    state.joined = state.joined.filter((item) => item !== id);
    state.left = [...new Set([...state.left, id])];
    state.created = state.created.filter((group) => group.id !== id);
    save(state);
  },
  async create(input) {
    await simulate(0.6);
    const state = load();
    const group: Group = {
      id: createId('g'),
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      kind: 'private',
      memberCount: 1,
      blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
      imageUri: input.imageUri,
      joined: true,
      owner: true,
      code:
        createId('')
          .replace(/[^A-Z0-9]/gi, '')
          .slice(0, 6)
          .toUpperCase() || 'JOIN01',
      createdAt: new Date().toISOString(),
    };
    state.created = [group, ...state.created];
    save(state);
    return group;
  },
  async members(groupId) {
    await simulate(0.3);
    const state = load();
    if (groupId === FAMILY_GROUP_ID) return familyMembers();
    if (state.created.some((group) => group.id === groupId)) return [meMember()];
    const me = meMember();
    return [
      ...COMMUNITY_MEMBERS.filter((member) => !state.blocked.includes(member.id)),
      { ...me, isOwner: false },
    ];
  },
  async member(id) {
    await simulate(0.2);
    const family = await familyMembers();
    return memberById(id, family);
  },
  async posts(groupId, filter = 'all') {
    await simulate(0.5);
    const posts = (await allPosts(load())).filter((post) => post.groupId === groupId);
    return filter === 'all'
      ? posts
      : posts.filter((post) => post.verdicts.some((verdict) => verdict.kind === filter));
  },
  async post(id) {
    await simulate(0.3);
    return (await allPosts(load())).find((post) => post.id === id) ?? null;
  },
  async createPost(input) {
    await simulate(0.6);
    const state = load();
    const family = await familyMembers();
    const me = family.find((member) => member.isMe) ?? meMember();
    const scan = input.scanId ? await mockHistoryService.get(input.scanId) : null;
    const product = scan?.product;
    const verdicts = product
      ? input.groupId === FAMILY_GROUP_ID
        ? currentProfiles().map((profile) => ({
            memberId: family.find((m) => m.profileId === profile.id)?.id ?? profile.id,
            name: profile.name,
            kind: evaluateProduct(product, profile).kind,
          }))
        : [{ memberId: me.id, name: me.name, kind: scan?.verdict.kind ?? 'unknown' }]
      : [];
    const post: Post = {
      id: createId('post'),
      groupId: input.groupId,
      author: me,
      createdAt: new Date().toISOString(),
      text: input.text.trim(),
      foodName: input.foodName ?? product?.name,
      scanId: input.scanId,
      imageUri: input.imageUri ?? product?.imageUri,
      blurhash: product?.blurhash,
      verdicts,
      reactions: reactionsFor([0, 0, 0], []),
      commentCount: 0,
    };
    state.posts = [post, ...state.posts];
    save(state);
    return post;
  },
  async react(postId, emoji) {
    await simulate(0.2);
    const state = load();
    const mine = state.myReactions[postId] ?? [];
    state.myReactions[postId] = mine.includes(emoji)
      ? mine.filter((item) => item !== emoji)
      : [...mine, emoji];
    save(state);
    const post = (await allPosts(state)).find((item) => item.id === postId);
    if (!post) throw new ServiceError('Post not found', 'not_found');
    return post;
  },
  async comments(postId) {
    await simulate(0.3);
    const state = load();
    const family = await familyMembers();
    const seeded = (SEED_POSTS.find((post) => post.id === postId)?.comments ?? []).map<PostComment>(
      (comment, index) => ({
        id: `${postId}-c${index}`,
        postId,
        author: memberById(comment.authorId, family),
        createdAt: hoursAgo(comment.hours),
        text: comment.text,
      }),
    );
    return [...seeded, ...(state.comments[postId] ?? [])]
      .filter((comment) => !state.blocked.includes(comment.author.id))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async addComment(postId, text) {
    await simulate(0.4);
    const state = load();
    const family = await familyMembers();
    const comment: PostComment = {
      id: createId('comment'),
      postId,
      author: family.find((member) => member.isMe) ?? meMember(),
      createdAt: new Date().toISOString(),
      text: text.trim(),
    };
    state.comments[postId] = [...(state.comments[postId] ?? []), comment];
    save(state);
    return comment;
  },
  async reportPost() {
    await simulate(0.6);
  },
  async blockMember(memberId) {
    await simulate(0.3);
    const state = load();
    state.blocked = [...new Set([...state.blocked, memberId])];
    save(state);
  },
  async invite(groupId) {
    await simulate(0.2);
    const group = allGroups(load()).find((item) => item.id === groupId);
    const code = group?.code ?? 'JOIN01';
    return { link: `https://allergyapp.example/join/${code}`, code };
  },
};

export { FAMILY_GROUP_ID, ME_ID };
