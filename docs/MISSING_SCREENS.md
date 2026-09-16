# Missing screens, taps and states

Built from every screen in the onboarding PDF, both screenshot sets and the
Phase 2 brief. Part 1 lists where every tap goes. Part 2 lists the screens
that none of the sources show but the taps need. Part 3 lists the states each
screen must handle. Everything here is built; nothing stays a placeholder
without approval (the two placeholders the brief itself allows are marked).

## Part 1. Where every tap goes

### Onboarding PDF (Phase 1, all destinations exist)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Welcome | Get Started (first time) | Language sheet, then `/(onboarding)/who` |
| Language sheet | language row | selects, closes |
| Every survey step | back | previous step, selections kept |
| Every survey step | Continue (disabled until valid) | next step |
| Ingredients | search, suggested row, chip x, "Add" custom | in place |
| Camera explainer | Allow camera | native prompt; denied -> `/(onboarding)/camera-permission` (Open Settings) |
| Save your profile | Apple / Google | mock sign in -> `/(onboarding)/notifications` |
| Save your profile | Email | `/(auth)/email` -> `/(auth)/verify` |
| Save your profile | Terms / Privacy links | `/legal/terms`, `/legal/privacy` |
| Notifications prompt | Allow / Not now | `/(tabs)/home` (stack replaced) |

### Main shell and Home (set-b/01, set-b/010, spec)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Tab bar | Home, Insights, Groups, Profile | that tab |
| Tab bar | + | PlusMenu overlay; + becomes X |
| PlusMenu | Log reaction | `/reactions/new` |
| PlusMenu | Saved foods | `/saved` |
| PlusMenu | Food search | `/search` |
| PlusMenu | Scan food | `/scan` |
| PlusMenu | X or dimmed area | closes |
| Home | streak pill | `/(tabs)/insights` |
| Home | profile switcher | ProfileSwitcherSheet |
| Home | week strip day | loads that day |
| Home | hero chevron | toggles Foods checked / Safe rate |
| Home | hero ring | `/scan` |
| Home | stat cards (swipe) | pages; Safe/Caution/Not safe cards open `/history?verdict=` |
| Home | "Top flagged ingredient" card | `/ingredients/[id]` |
| Home | "Saved foods" card | `/saved` |
| Home | "See all" | `/history` |
| Home | recently scanned row | `/scan/result/[id]?from=home` |
| Home | empty placeholder card | `/scan` |
| FeatureIntroSheet | Turn on alerts | notification permission, toast |
| FeatureIntroSheet | Not now | closes, remembered |

### Scanner and results (set-a/3, set-b/011, set-b/09, spec)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Scanner | close, swipe down | screen that opened it |
| Scanner | help | ScannerHelpSheet |
| Scanner | zoom pills, modes, flash | in place |
| Scanner | shutter, gallery | `/scan/analyzing` -> `/scan/result/[id]` |
| Scanner (Barcode) | auto detect | `/scan/analyzing` -> result or `/scan/not-found` |
| Scanner | denied state: Open Settings | system settings |
| Analyzing | (none, auto) | result, `/scan/unreadable` on a bad photo |
| Result | back | previous screen |
| Result | share | system share sheet |
| Result | more | Save, Compare, Share, Report a problem, Log a reaction |
| Result | bookmark | saves, toast |
| Result | Contains / May contain / Checked against tiles | scrolls to ingredients |
| Result | ingredient row | `/ingredients/[id]` |
| Result | "Add more" | `/scan/fix/[id]` |
| Result | family member row | `/members/[id]` |
| Result | safety notice link | `/settings/verdict-colors` |
| Result | Fix results | `/scan/fix/[id]` |
| Result | Done | `?from=` origin |
| Fix results | remove, mark unsure | in place |
| Fix results | add ingredient | inline search |
| Fix results | Save | recalculated result |
| Fix results | back with edits | ConfirmDialog discard |
| Not found | Scan label instead | `/scan?mode=label` |
| Not found | Add manually | `/scan/manual` |
| Unreadable | Retake | `/scan` |
| Unreadable | Type instead | `/scan/manual` |
| Report a problem | Send | toast, back |

### Foods (spec, set-a compare description)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Food search | recent search | fills query |
| Food search | result row | `/product/[id]` |
| Food search | no results: Add manually | `/scan/manual` |
| Product detail | same as result; Done -> back | |
| Saved foods | filter chips | in place |
| Saved foods | row | `/product/[id]` |
| Saved foods | swipe delete | toast with Undo |
| Saved foods | empty: Scan food | `/scan` |
| Scan history | filter chips, search | in place |
| Scan history | row | `/scan/result/[id]?from=history` |
| Scan history | swipe delete | toast with Undo |
| Scan history | Compare (more) | `/compare` |
| Compare | product card | selects it |
| Compare | Only show differences | in place |
| Compare | thumbnail | replaces the selected product |
| Compare | Share | system share sheet |
| Ingredient detail | scan row | `/scan/result/[id]` |

### Reactions (spec)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Log reaction | food field | FoodPickerSheet (history) or typed |
| Log reaction | date and time | native picker |
| Log reaction | symptom chips, severity | in place |
| Log reaction | add photo | image picker |
| Log reaction | Save | toast, back |
| Log reaction | back with edits | ConfirmDialog discard |
| Reaction history | row | `/reactions/[id]` |
| Reaction history | empty: Log reaction | `/reactions/new` |
| Reaction detail | food | `/scan/result/[id]` when linked |
| Reaction detail | Delete | ConfirmDialog, back |

### Insights (set-b/03, 04, 016, 017, 018, spec)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Insights | Day streak card | StreakSheet (how the streak works, calendar) |
| Insights | Badges earned card | `/badges` |
| Insights | Reactions card | `/reactions` |
| Insights | Log reaction pill | `/reactions/new` |
| Insights | chart point (press) | tooltip |
| Insights | range selector, week selectors | in place |
| Insights | scan changes row | `/history?range=` |
| Insights | Allergy action plan: Upload a photo | image picker, then `/action-plan` |
| Insights | Allergy action plan card | `/action-plan` |
| Insights | Most flagged ingredient row | `/ingredients/[id]` |
| Insights | Most flagged locked card | (not tappable, explains what unlocks it) |
| Insights | Caution level card | `/settings/caution` |
| Insights | Caution level help icon | `/settings/verdict-colors` |
| Badges | badge tile | `/badges/[id]` |
| Action plan | photo | `/action-plan/[id]` viewer |
| Action plan | add | image picker |
| Action plan viewer | delete | ConfirmDialog |

### Groups (set-b/05, spec)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Groups | bell | `/notifications` |
| Groups | + Private group | `/groups/new` |
| Groups | My groups row item | `/groups/[id]` |
| Groups | Join / Joined | toggles, toast |
| Groups | group card | `/groups/[id]` |
| Group detail | title dropdown | GroupSwitcherSheet |
| Group detail | filter | FeedFilterSheet |
| Group detail | member avatar | `/members/[id]` |
| Group detail | see all members | `/groups/[id]/members` |
| Group detail | post | `/groups/posts/[id]` |
| Group detail | new post | `/groups/posts/new?groupId=` |
| Group detail | more | Invite, Leave group (ConfirmDialog) |
| Post detail | react, comment | in place |
| Post detail | more | Report post, Block user (ConfirmDialog) |
| Create private group | Create | `/groups/[id]/invite` |
| Invite | Share link, Copy code | share sheet, toast |
| Member (family) | Edit restrictions | `/profiles/edit/[section]` |
| Member (family) | Remove | ConfirmDialog |
| Member (family) | Add family member | `/(onboarding)/who?mode=add` |

### Profile (set-b/07, 08, 012, 013, spec)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Profile | header card | `/settings/name` |
| Profile | Invite friends | `/settings/invite` |
| Profile | Personal details | `/settings/personal` |
| Profile | Preferences | `/settings/preferences` |
| Profile | Language | `/settings/language` |
| Profile | Upgrade to Family plan | `/settings/family-plan` (placeholder allowed) |
| Profile | My allergens and ingredients | `/settings/restrictions` |
| Profile | Caution level | `/settings/caution` |
| Profile | Diet | `/settings/diet` |
| Profile | Other answers | `/settings/survey` |
| Profile | Scan reminders | `/settings/reminders` |
| Profile | Reaction history | `/reactions` |
| Profile | Verdict colors explained | `/settings/verdict-colors` |
| Profile | Allergy card | `/settings/allergy-card` |
| Profile | Widgets: How to add? | WidgetsHowToSheet |
| Profile | Widget preview: Scan food pill | `/scan` |
| Profile | Request a feature | `/settings/request-feature` |
| Profile | Support email | mail app |
| Profile | Export summary report | `/settings/export` |
| Profile | Sync data | runs sync, updates "Last synced", toast |
| Profile | Terms / Privacy | `/legal/terms`, `/legal/privacy` |
| Profile | Instagram / TikTok / X | opens link from config |
| Profile | Logout | ConfirmDialog -> `/(onboarding)/welcome` |
| Profile | Delete account | `/settings/delete-account` |
| Personal details | Change email | `/settings/change-email` -> `/(auth)/verify` |
| Allergy card | Share, language, full screen | share sheet, in place |
| Export report | Share | share sheet |

### Notifications (set-b/06, spec)

| Screen | Tap | Goes to |
| --- | --- | --- |
| Notifications | back | previous screen |
| Notifications | more | Mark all as read, `/notifications/settings` |
| Notifications | product alert | `/product/[id]` |
| Notifications | group reply | `/groups/posts/[id]` |
| Notifications | reaction reminder | `/reactions/[id]` |

## Part 2. Screens the sources do not show

| Missing screen | Purpose | Reached from |
| --- | --- | --- |
| Plus menu overlay | 2x2 actions | + button |
| Feature intro sheet | product alerts opt in | Home, after first saved food |
| Scanner help sheet | explains modes and photo tips | Scanner help button |
| Analyzing | progress between capture and result | Scanner |
| Fix results | edit name and ingredients | Result |
| Barcode not found | recovery | Scanner (Barcode) |
| Unreadable photo | recovery | Analyzing |
| Report a problem | feedback on a wrong result | Result more menu |
| Food search | find a product without scanning | Plus menu, Home |
| Saved foods | bookmarked products | Plus menu, Home stat card |
| Scan history | all scans grouped by day | Home "See all" |
| Compare products | two products side by side | Result, History |
| Ingredient detail | which scans flagged an ingredient | Result, Home, Insights |
| Log reaction, Reaction history, Reaction detail | personal reaction log | Plus menu, Insights, Profile |
| Food picker sheet | choose a food from history for a reaction | Log reaction |
| Streak sheet | how the streak works | Insights streak card |
| Badges, Badge detail | achievements | Insights |
| Allergy action plan, photo viewer | document photos | Insights |
| Group detail feed, Post detail, Create post, Report post | community | Groups |
| Create private group, Invite to group, Member list | private groups | Groups |
| Member profile / family member detail | who is in a group | Group detail, Result |
| Group switcher sheet, Feed filter sheet | feed controls | Group detail |
| Notifications, Notification settings | alerts and their settings | Groups bell, push |
| Edit name and username | profile header | Profile |
| Personal details | name, birth date, email, who the profile is for | Profile |
| Change email | passwordless email change with a code | Personal details |
| Preferences | haptics, appearance, default scan mode | Profile |
| Language | switch app language | Profile |
| Family plan | upgrade placeholder (allowed by the brief) | Profile |
| Invite friends | code and share | Profile |
| My allergens and ingredients, Caution level, Diet, Other answers | edit onboarding answers | Profile |
| Scan reminders | daily reminder toggle and time | Profile |
| Verdict colors explained | what the four verdicts mean | Profile, Result, Insights |
| Allergy card | restaurant card with language switch and full screen | Profile |
| Widgets how to add sheet | steps to add a widget | Profile |
| Request a feature | form | Profile |
| Export summary report | preview for a doctor, share | Profile |
| Delete account | warning, type to confirm, final dialog | Profile |
| Session expired | sends the user back to sign in | app start |
| No internet | full screen with Retry | any failed load while offline |
| App update required | placeholder (allowed by the brief) | app start when the mock says so |
| Confirm dialog | logout, delete account, delete scan, leave group, remove member, discard, block | many |
| Toast | success and undo feedback | many |

## Part 3. States per screen

| Screen | Loading | Empty | Filled | Error | Offline | Permission denied | Locked / not ready |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | skeleton cards | placeholder card, zero rings | yes | inline error with retry | banner + cached data | - | - |
| Scanner | camera warming | - | live | camera failed | works | explainer + Open Settings | - |
| Analyzing | progress steps | - | - | -> unreadable | offline message + retry | - | - |
| Result / Product detail | skeleton | - | 4 verdicts, barcode and label variants | error with retry | cached result | - | - |
| Fix results | - | no ingredients | yes | save failed toast | - | - | - |
| Food search | spinner in field | recent searches | results | error state | offline state | - | - |
| Saved foods | skeleton | empty state | list, filters | error | cached | - | - |
| Scan history | skeleton | empty, no match | grouped list | error | cached | - | - |
| Compare | skeleton | pick two products | side by side | error | cached | - | - |
| Ingredient detail | skeleton | no scans yet | list | error | cached | - | - |
| Log reaction | - | blank form | editing | save failed | queued locally | photo library denied | - |
| Reaction history / detail | skeleton | empty state | list / detail | error | cached | - | - |
| Insights | skeleton cards | zero streak, no reactions, empty charts | yes | error per card | cached | - | Most flagged locked under 7 days |
| Badges / detail | skeleton | none earned yet | grid | error | cached | - | locked badges |
| Action plan / viewer | skeleton | no photos | grid | error | works | photo library denied | - |
| Groups | skeleton | no groups joined | list | error | cached | - | - |
| Group detail | skeleton | empty feed | posts | error | cached | - | - |
| Post detail | skeleton | no comments | comments | error | cached | - | - |
| Create group / post / invite | - | blank | editing | send failed | offline message | photo denied | - |
| Member | skeleton | - | detail | error | cached | - | - |
| Notifications | skeleton | empty state | Today / Earlier groups | error | cached | - | - |
| Profile | - | "Tap to set name" | filled | - | banner | - | - |
| Settings screens | - | - | forms and toggles | save failed toast | works | notifications denied (reminders) | - |
| Allergy card / Export | - | - | preview | - | works | - | - |
| Delete account | - | - | 3 steps | request failed | blocked with message | - | - |
| Session expired / No internet / Update required | - | - | single message | - | - | - | - |
