import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Avatar,
  Button,
  Card,
  ChartCard,
  Checkbox,
  Chip,
  confirm,
  Divider,
  EmptyState,
  ErrorState,
  Icon,
  ICONS,
  IconChip,
  LargeTitleHeader,
  ListRow,
  NavHeader,
  OfflineBanner,
  OptionCard,
  ProgressHeader,
  RadioCheck,
  Ring,
  ScanFrame,
  SearchInput,
  SectionHeader,
  SegmentedControl,
  SettingsRow,
  SettingsSection,
  Sheet,
  showToast,
  Skeleton,
  Spinner,
  Stars,
  StatCard,
  Text,
  useSheetRef,
  WheelPicker,
  WorksForYouBadge,
  type IconName,
} from '@/components/ui';
import { VerdictCard } from '@/components/app/VerdictCard';
import { queryClient } from '@/services/queryClient';
import { INGREDIENTS } from '@/mocks/ingredients';
import { getServices, mockConfig } from '@/services';
import { useAppStore } from '@/store/appStore';
import { useDevStore } from '@/store/devStore';
import { useProfileStore } from '@/store/profileStore';
import { colors, spacing, type ColorToken } from '@/theme/tokens';
import { typography, type TypographyToken } from '@/theme/typography';
import type { VerdictKind } from '@/types';

const VERDICTS: VerdictKind[] = ['safe', 'caution', 'unsafe', 'unknown'];
const WEEKS = [
  { key: 'this', label: 'This wk' },
  { key: 'last', label: 'Last wk' },
  { key: 'two', label: '2 wk ago' },
  { key: 'three', label: '3 wk ago' },
] as const;

const avatar1 = require('@/assets/images/avatar-1.png');

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="sectionTitle" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Hidden gallery: every component in every state. Route: allergyapp://dev/components */
export default function ComponentsGallery() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sheetRef = useSheetRef();
  const [single, setSingle] = useState<string>('b');
  const [multi, setMulti] = useState<string[]>(['a']);
  const [checked, setChecked] = useState(true);
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(0.3);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [year, setYear] = useState(2001);
  const [showOffline, setShowOffline] = useState(false);
  const [week, setWeek] = useState<(typeof WEEKS)[number]['key']>('this');
  const [ringValue, setRingValue] = useState(0.62);
  const [reminders, setReminders] = useState(true);
  const showGuides = useDevStore((state) => state.showGuides);
  const setShowGuides = useDevStore((state) => state.setShowGuides);
  const mockDataset = useDevStore((state) => state.mockDataset);
  const forceUpdateRequired = useDevStore((state) => state.forceUpdateRequired);
  const setForceUpdateRequired = useDevStore((state) => state.setForceUpdateRequired);
  const [unreadableNext, setUnreadableNext] = useState(mockConfig.unreadableNext);
  const setMockDataset = useDevStore((state) => state.setMockDataset);

  const toggleMulti = (value: string) =>
    setMulti((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );

  return (
    <View style={styles.root}>
      {showOffline ? (
        <OfflineBanner message="You're offline. Results use your saved library." force />
      ) : null}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.huge },
        ]}
      >
        <View style={styles.headerRow}>
          <Text variant="titleLg">Components</Text>
          <Button title="Close" variant="text" onPress={() => router.back()} />
        </View>

        <Section title="Developer toggles">
          <SettingsSection>
            <SettingsRow
              label="Show padding guides"
              description="Draws page padding, header and tab bar bounds on every screen"
              icon="target"
              toggle={{ value: showGuides, onChange: setShowGuides }}
            />
            <SettingsRow
              label="Next photo is unreadable"
              description="The next camera or gallery scan opens the unreadable photo screen"
              icon="eyeOff"
              toggle={{
                value: unreadableNext,
                onChange: (value) => {
                  mockConfig.unreadableNext = value;
                  setUnreadableNext(value);
                },
              }}
            />
            <SettingsRow
              label="Mock data: active user"
              description="Off serves the new-user data set (empty states)"
              icon="database"
              toggle={{
                value: mockDataset === 'active',
                onChange: (value) => {
                  setMockDataset(value ? 'active' : 'new');
                  void queryClient.invalidateQueries();
                },
              }}
            />
          </SettingsSection>
          <SettingsRow
            label="Update required on next launch"
            description="Preview the forced update screen (relaunch the app)"
            icon="download"
            toggle={{ value: forceUpdateRequired, onChange: setForceUpdateRequired }}
          />
          <Button
            title="Expire the session"
            size="md"
            variant="secondary"
            onPress={() => {
              const { session, setSession } = useAppStore.getState();
              if (!session) {
                showToast({ message: 'No session to expire (sign in first)' });
                return;
              }
              setSession({ ...session, expiresAt: new Date(Date.now() - 1000).toISOString() });
              showToast({ message: 'Session expired: relaunch the app' });
            }}
          />
          <Button
            title="Sample restrictions: peanuts + milk"
            size="md"
            variant="secondary"
            onPress={() => {
              const { profiles, activeProfileId, updateProfile } = useProfileStore.getState();
              const active = profiles.find((p) => p.id === activeProfileId) ?? profiles[0];
              if (!active) return;
              const pick = (name: string) => INGREDIENTS.find((i) => i.name === name);
              const peanuts = pick('Peanuts');
              const milk = pick('Milk');
              updateProfile(active.id, {
                restrictions: [
                  ...(peanuts
                    ? [
                        {
                          ingredientId: peanuts.id,
                          name: peanuts.name,
                          severity: 'severe' as const,
                        },
                      ]
                    : []),
                  ...(milk
                    ? [{ ingredientId: milk.id, name: milk.name, severity: 'moderate' as const }]
                    : []),
                ],
              });
              // Seeded scans were judged with the old profile: clear them so they are re-seeded.
              void getServices()
                .history.clearForProfile(active.id)
                .then(() => queryClient.invalidateQueries());
              showToast({ message: 'Active profile now avoids peanuts and milk', icon: 'person' });
            }}
          />
        </Section>

        <Section title="Headers">
          <NavHeader
            title="Notifications"
            rightIcon="filter"
            rightLabel="More"
            onRightPress={() => undefined}
          />
          <NavHeader
            title="Over a photo"
            onDark
            rightIcon="bookmark"
            rightLabel="Save"
            onRightPress={() => undefined}
            style={styles.darkHeader}
          />
          <LargeTitleHeader
            title="Insights"
            right={<Avatar name="Jane Doe" size={40} bordered={false} />}
          />
          <SectionHeader
            title="Recently scanned"
            actionLabel="See all"
            onAction={() => undefined}
          />
          <SectionHeader
            title="Discover groups"
            actionLabel="Private group"
            actionIcon="plus"
            onAction={() => undefined}
          />
          <SectionHeader
            title="Widgets"
            variant="label"
            actionLabel="How to add?"
            onAction={() => undefined}
          />
        </Section>

        <Section title="Settings rows">
          <SettingsSection title="Account">
            <SettingsRow label="Personal details" icon="person" onPress={() => undefined} />
            <SettingsRow label="Language" icon="globe" value="English" onPress={() => undefined} />
            <SettingsRow
              label="Sync data"
              icon="refresh"
              value="Last synced 4:10 PM"
              chevron={false}
              onPress={() => undefined}
            />
            <SettingsRow
              label="Scan reminders"
              icon="bell"
              toggle={{ value: reminders, onChange: setReminders }}
            />
            <SettingsRow label="Disabled row" icon="lock" disabled onPress={() => undefined} />
          </SettingsSection>
          <SettingsSection title="Account actions">
            <SettingsRow label="Logout" icon="logout" onPress={() => undefined} />
            <SettingsRow
              label="Delete account"
              icon="trash"
              destructive
              onPress={() => undefined}
            />
          </SettingsSection>
        </Section>

        <Section title="Stat cards and rings">
          <StatCard
            layout="hero"
            value={12}
            label="Foods checked today"
            caption="Tap to switch to safe rate"
            ring={{ progress: ringValue, color: 'success', icon: 'shieldCheck' }}
            onPress={() => setRingValue((v) => (v >= 1 ? 0.1 : Math.min(1, v + 0.3)))}
          />
          <View style={styles.row}>
            <StatCard
              value={9}
              label="Safe"
              ring={{ progress: 0.75, color: 'success', icon: 'checkCircle' }}
              style={styles.third}
            />
            <StatCard
              value={2}
              label="Caution"
              ring={{ progress: 0.17, color: 'warning', icon: 'warning' }}
              style={styles.third}
            />
            <StatCard
              value={1}
              label="Not safe"
              ring={{ progress: 0.08, color: 'danger', icon: 'closeCircle' }}
              style={styles.third}
            />
          </View>
          <View style={styles.row}>
            <StatCard
              layout="square"
              value={5}
              label="Day streak"
              art={<Icon name="shieldCheck" size={44} color="success" />}
              style={styles.half}
            />
            <StatCard
              layout="square"
              value={0}
              label="Badges earned"
              art={<Icon name="star" size={44} color="gold" outline />}
              style={styles.half}
            />
          </View>
          <View style={styles.row}>
            <Ring size={40} thickness={4} progress={0} dashed />
            <Ring size={40} thickness={4} progress={1} color="success" />
            <Ring size={40} thickness={4} progress={1} color="warning" />
            <Ring size={40} thickness={4} progress={1} color="danger" />
            <Ring size={56} thickness={6} progress={0.4} color="info">
              <Text variant="statSm">40%</Text>
            </Ring>
          </View>
        </Section>

        <Section title="Chart cards and segmented control">
          <ChartCard
            title="Flagged foods over time"
            badge={{
              label: '82% safe',
              icon: 'shieldCheck',
              color: 'success',
              tint: 'successTint',
            }}
            legend={[
              { label: 'Safe', color: 'success' },
              { label: 'Caution', color: 'warning' },
              { label: 'Not safe', color: 'danger' },
            ]}
            footer={<SegmentedControl options={WEEKS} value={week} onChange={setWeek} />}
          >
            <Skeleton height={120} radius={12} />
          </ChartCard>
          <ChartCard
            title="Most flagged ingredients"
            onHelp={() => undefined}
            helpLabel="What is this?"
            locked={{ message: 'Unlocks after 7 days of scans' }}
          >
            <Skeleton height={80} radius={12} />
          </ChartCard>
          <SegmentedControl
            variant="chips"
            options={[
              { key: '90d', label: '90D' },
              { key: '6m', label: '6M' },
              { key: '1y', label: '1Y' },
              { key: 'all', label: 'ALL' },
            ]}
            value="90d"
            onChange={() => undefined}
          />
        </Section>

        <Section title="Verdict cards">
          <View style={styles.stack}>
            {VERDICTS.map((kind) => (
              <VerdictCard
                key={kind}
                kind={kind}
                reason={kind === 'unsafe' ? 'Contains peanuts' : undefined}
              />
            ))}
            <VerdictCard kind="safe" floating reason="No flagged ingredients" />
          </View>
        </Section>

        <Section title="Toast and confirm dialog">
          <View style={styles.row}>
            <Button
              title="Toast"
              size="md"
              variant="secondary"
              style={styles.half}
              onPress={() => showToast({ message: 'Saved to your foods', icon: 'bookmark' })}
            />
            <Button
              title="Toast with undo"
              size="md"
              variant="secondary"
              style={styles.half}
              onPress={() =>
                showToast({
                  message: 'Scan deleted',
                  icon: 'trash',
                  action: { label: 'Undo', onPress: () => showToast({ message: 'Restored' }) },
                })
              }
            />
          </View>
          <View style={styles.row}>
            <Button
              title="Confirm"
              size="md"
              variant="secondary"
              style={styles.half}
              onPress={() =>
                void confirm({
                  title: 'Log out?',
                  message: 'You can sign back in at any time.',
                  confirmLabel: 'Log out',
                  cancelLabel: 'Cancel',
                  icon: 'logout',
                }).then((ok) => showToast({ message: ok ? 'Confirmed' : 'Cancelled' }))
              }
            />
            <Button
              title="Destructive"
              size="md"
              variant="secondary"
              style={styles.half}
              onPress={() =>
                void confirm({
                  title: 'Delete this scan?',
                  message: 'This cannot be undone.',
                  confirmLabel: 'Delete',
                  cancelLabel: 'Cancel',
                  destructive: true,
                  icon: 'trash',
                }).then((ok) => showToast({ message: ok ? 'Deleted' : 'Kept' }))
              }
            />
          </View>
        </Section>

        <Section title="Typography">
          {(Object.keys(typography) as TypographyToken[]).map((variant) => (
            <Text key={variant} variant={variant} numberOfLines={1}>
              {variant} {typography[variant].fontSize}/{typography[variant].lineHeight}
            </Text>
          ))}
        </Section>

        <Section title="Colours">
          <View style={styles.swatches}>
            {(Object.keys(colors) as ColorToken[]).map((token) => (
              <View key={token} style={styles.swatch}>
                <View style={[styles.swatchColor, { backgroundColor: colors[token] }]} />
                <Text variant="small" color="textMuted">
                  {token}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Buttons">
          <View style={styles.stack}>
            <Button title="Continue" onPress={() => undefined} />
            <Button title="Continue (disabled)" disabled />
            <Button title="Continue (loading)" loading />
            <Button
              title="Sign in with Apple"
              variant="apple"
              size="auth"
              leading={<Icon name="apple" size={24} color="onPrimary" />}
            />
            <Button
              title="Continue with email"
              variant="secondary"
              size="auth"
              leading={<Icon name="mail" size={24} color="text" outline />}
            />
            <Button title="Medium button" size="md" />
            <Button title="Delete account" variant="danger" size="md" />
            <Button title="No" variant="text" />
          </View>
        </Section>

        <Section title="Option cards (single)">
          <View style={styles.stack}>
            {[
              { value: 'a', label: 'Myself', icon: 'person' as IconName },
              { value: 'b', label: 'My child', icon: 'people' as IconName },
              { value: 'c', label: 'Someone I care for', icon: 'heart' as IconName },
            ].map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                icon={option.icon}
                selected={single === option.value}
                onPress={() => setSingle(option.value)}
              />
            ))}
            <OptionCard
              label="Disabled option"
              icon="ban"
              selected={false}
              onPress={() => undefined}
              disabled
            />
            <OptionCard
              label="With description"
              description="Second line of helper copy"
              icon="warning"
              selected={false}
              onPress={() => undefined}
            />
          </View>
        </Section>

        <Section title="Option cards (multi, compact)">
          <View style={styles.stackCompact}>
            {[
              { value: 'a', label: 'Halal', icon: 'moon' as IconName },
              { value: 'b', label: 'Vegetarian', icon: 'leaf' as IconName },
              { value: 'c', label: 'Gluten-free', icon: 'wheat' as IconName },
              { value: 'd', label: 'Keto', icon: 'avocado' as IconName },
            ].map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                icon={option.icon}
                density="compact"
                role="checkbox"
                selected={multi.includes(option.value)}
                onPress={() => toggleMulti(option.value)}
              />
            ))}
          </View>
        </Section>

        <Section title="Indicators">
          <View style={styles.row}>
            <RadioCheck selected={false} />
            <RadioCheck selected />
            <Checkbox
              checked={checked}
              onChange={setChecked}
              label="I agree to the Terms and Privacy Policy"
            />
          </View>
          <View style={styles.row}>
            <Checkbox checked={false} onChange={() => undefined} label="Unchecked" />
          </View>
        </Section>

        <Section title="Progress header">
          <ProgressHeader
            progress={progress}
            onBack={() => setProgress((p) => Math.max(0, p - 0.1))}
            backLabel="Go back"
            progressLabel="Progress"
          />
          <View style={[styles.row, { marginTop: spacing.md }]}>
            <Button
              title="+10%"
              size="md"
              onPress={() => setProgress((p) => Math.min(1, p + 0.1))}
              style={styles.half}
            />
            <Button
              title="Reset"
              size="md"
              variant="secondary"
              onPress={() => setProgress(0.3)}
              style={styles.half}
            />
          </View>
        </Section>

        <Section title="Chips">
          <View style={styles.wrap}>
            <Chip label="Peanuts" onRemove={() => undefined} removeLabel="Remove Peanuts" />
            <Chip label="Milk" onRemove={() => undefined} removeLabel="Remove Milk" />
            <Chip label="All" selected onPress={() => undefined} />
            <Chip label="Works" onPress={() => undefined} />
            <Chip label="Not safe" onPress={() => undefined} />
          </View>
        </Section>

        <Section title="Search input">
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search ingredients"
            clearLabel="Clear search"
          />
          <View style={{ height: spacing.sm }} />
          <SearchInput
            value="Peanuts"
            onChangeText={() => undefined}
            placeholder="Search ingredients"
          />
        </Section>

        <Section title="Sheet">
          <Button
            title="Open sheet"
            size="md"
            variant="secondary"
            onPress={() => sheetRef.current?.present()}
          />
          <Sheet ref={sheetRef} title="Select Language" closeLabel="Close">
            <View style={{ paddingBottom: spacing.lg }}>
              {['English', 'Español', 'Français'].map((language, index) => (
                <View key={language}>
                  <ListRow
                    label={language}
                    leading={<Text variant="sectionTitle">🇺🇸</Text>}
                    trailing={<RadioCheck selected={index === 0} />}
                  />
                  <Divider />
                </View>
              ))}
            </View>
          </Sheet>
        </Section>

        <Section title="Badge, scan frame, stars, avatars">
          <View style={styles.hero}>
            <ScanFrame style={styles.frame} />
            <WorksForYouBadge label="Works for you" style={styles.badge} />
          </View>
          <View style={[styles.row, { marginTop: spacing.lg }]}>
            <Stars accessibilityLabel="5 out of 5 stars" />
            <Avatar source={avatar1} accessibilityLabel="Reviewer" />
            <Avatar name="Jane Doe" color={colors.successBright} />
          </View>
        </Section>

        <Section title="Cards and rows">
          <Card title="Your profile">
            <ListRow label="Avoid:" value="Peanuts, Milk" icon="ban" iconColor="danger" />
            <ListRow
              label="Diet:"
              value="Halal"
              icon="moon"
              iconColor="successBright"
              iconOutline={false}
            />
          </Card>
          <View style={{ height: spacing.md }} />
          <Card title="Setting up" variant="outlined">
            <ListRow
              label="Ingredient watchlist"
              icon="document"
              trailing={<RadioCheck selected />}
            />
            <Divider />
            <ListRow label="Scan profile" icon="barcode" trailing={<Spinner />} />
          </Card>
          <View style={{ height: spacing.md }} />
          <ListRow
            label="Language"
            value="English"
            icon="globe"
            chevron
            onPress={() => undefined}
          />
          <Divider />
          <ListRow label="Delete account" icon="trash" destructive onPress={() => undefined} />
        </Section>

        <Section title="Icon chips">
          <View style={styles.wrap}>
            {(Object.keys(ICONS) as IconName[]).map((name) => (
              <IconChip key={name} icon={name} size={44} iconSize={22} />
            ))}
          </View>
        </Section>

        <Section title="Loading, empty, error, offline">
          <View style={styles.stack}>
            <Skeleton height={92} radius={16} />
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </View>
          <EmptyState
            icon="history"
            title="Your library is empty"
            body="Everything you check ends up here, so next time is instant."
            actionLabel="Scan food"
            onAction={() => undefined}
            compact
          />
          <ErrorState
            title="Something went wrong"
            body="We couldn't load this. Check your connection and try again."
            actionLabel="Try again"
            onAction={() => undefined}
            compact
          />
          <Button
            title={showOffline ? 'Hide offline banner' : 'Show offline banner'}
            size="md"
            variant="secondary"
            onPress={() => setShowOffline((v) => !v)}
          />
        </Section>

        <Section title="Wheel picker">
          <WheelPicker
            columns={[
              {
                accessibilityLabel: 'Month',
                align: 'left',
                flex: 1.6,
                value: month,
                onChange: setMonth,
                items: [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ].map((label, i) => ({ value: i + 1, label })),
              },
              {
                accessibilityLabel: 'Day',
                flex: 0.9,
                value: day,
                onChange: setDay,
                items: Array.from({ length: 31 }, (_, i) => ({
                  value: i + 1,
                  label: String(i + 1),
                })),
              },
              {
                accessibilityLabel: 'Year',
                flex: 1.2,
                value: year,
                onChange: setYear,
                items: Array.from({ length: 100 }, (_, i) => ({
                  value: 2026 - i,
                  label: String(2026 - i),
                })),
              },
            ]}
          />
          <Text variant="small" color="textMuted" align="center">
            {month}/{day}/{year}
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { marginTop: spacing.xxxl, gap: spacing.sm },
  sectionTitle: { marginBottom: spacing.xs },
  stack: { gap: spacing.md },
  stackCompact: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  half: { flex: 1 },
  third: { flex: 1 },
  darkHeader: { backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 8 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 96, gap: 4 },
  swatchColor: { height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  hero: { height: 240, borderRadius: 28, backgroundColor: colors.surfaceTint, overflow: 'visible' },
  frame: { margin: 36 },
  badge: { position: 'absolute', right: 40, top: 70 },
});
