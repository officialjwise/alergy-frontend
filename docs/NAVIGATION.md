# Navigation map

Every screen in the app with its Expo Router file, how it is presented and
where it leads. Route names are stable so notifications and links can open
them later (`/scan/result/[id]`, `/groups/[id]`, ...). Sheets and dialogs
that are components (no URL) are marked as such.

```
App start
  /                                app/index.tsx                       splash redirect
  Onboarding not complete -> (onboarding) stack (Phase 1, unchanged)
  Session expired         -> /(auth)/session-expired
  Onboarding complete     -> /(tabs)/home

Main tabs   app/(tabs)/_layout.tsx   floating pill tab bar + round dark + button
  1. Home        /(tabs)/home         app/(tabs)/home/index.tsx
  2. Insights    /(tabs)/insights     app/(tabs)/insights/index.tsx
  3. Groups      /(tabs)/groups       app/(tabs)/groups/index.tsx
  4. Profile     /(tabs)/profile      app/(tabs)/profile/index.tsx
  + button       PlusMenu overlay (component, no URL): Log reaction, Saved foods, Food search, Scan food

Sheets rendered inside a screen (components, no URL)
  FeatureIntroSheet          over Home, once after the first saved food
  ProfileSwitcherSheet       Home header (family setups)
  ScannerHelpSheet           Scanner help button
  GroupSwitcherSheet         Group detail title
  FeedFilterSheet            Group detail filter button
  WidgetsHowToSheet          Profile > Widgets > "How to add?"
  FoodPickerSheet            Log reaction > choose a food from history
  StreakSheet                Insights > Day streak card
  ConfirmDialog              logout, delete account, delete scan, leave group,
                             remove family member, discard changes, block user
  Toast                      save, delete, undo, join, share, send

Scanning
  /scan                      app/scan/index.tsx                modal (transparent), sheet look, modes Food / Barcode / Label / Menu
  /scan/analyzing            app/scan/analyzing.tsx            modal over the scanner
  /scan/result/[id]          app/scan/result/[id].tsx          verdict result; ?variant=barcode|label, ?from=home|history|search
  /scan/fix/[id]             app/scan/fix/[id].tsx             Fix results
  /scan/not-found            app/scan/not-found.tsx            barcode not found; ?barcode=
  /scan/unreadable           app/scan/unreadable.tsx           blurry or dark photo
  /scan/manual               app/scan/manual.tsx               add a product manually (from not-found)
  /scan/report/[id]          app/scan/report/[id].tsx          report a problem with a result

Foods
  /search                    app/search/index.tsx              Food search
  /product/[id]              app/product/[id].tsx              Product detail (reuses the result layout)
  /saved                     app/saved/index.tsx               Saved foods
  /history                   app/history/index.tsx             Scan history
  /compare                   app/compare/index.tsx             Compare products; ?a=&b=
  /ingredients/[id]          app/ingredients/[id].tsx          Ingredient detail (which scans flagged it)

Reactions
  /reactions                 app/reactions/index.tsx           Reaction history
  /reactions/new             app/reactions/new.tsx             Log reaction; ?scanId=
  /reactions/[id]            app/reactions/[id].tsx            Reaction detail

Insights extras
  /badges                    app/badges/index.tsx              Badges
  /badges/[id]               app/badges/[id].tsx               Badge detail
  /action-plan               app/action-plan/index.tsx         Allergy action plan photos
  /action-plan/[id]          app/action-plan/[id].tsx          Full screen photo viewer

Groups
  /groups/[id]               app/groups/[id]/index.tsx         Group detail feed
  /groups/[id]/invite        app/groups/[id]/invite.tsx        Invite to group
  /groups/[id]/members       app/groups/[id]/members.tsx       Member list
  /groups/new                app/groups/new.tsx                Create private group
  /groups/posts/new          app/groups/posts/new.tsx          Create post; ?groupId=
  /groups/posts/[id]         app/groups/posts/[id]/index.tsx   Post detail and comments
  /groups/posts/[id]/report  app/groups/posts/[id]/report.tsx  Report post
  /members/[id]              app/members/[id].tsx              Member profile (community) or family member detail
  /profiles                  app/profiles/index.tsx            Family profiles (Phase 1)
  /profiles/edit/[section]   app/profiles/edit/[section].tsx   Edit a profile section (Phase 1)
  Add family member          -> /(onboarding)/who?mode=add (reuses the survey)

Notifications
  /notifications             app/notifications/index.tsx
  /notifications/settings    app/notifications/settings.tsx

Profile and settings
  /settings/name             app/settings/name.tsx             Edit name and username
  /settings/personal         app/settings/personal.tsx         Personal details
  /settings/preferences      app/settings/preferences.tsx
  /settings/language         app/settings/language.tsx
  /settings/family-plan      app/settings/family-plan.tsx      upgrade placeholder (approved by the brief)
  /settings/invite           app/settings/invite.tsx           Invite friends
  /settings/restrictions     app/settings/restrictions.tsx     My allergens and ingredients
  /settings/caution          app/settings/caution.tsx          Caution level
  /settings/diet             app/settings/diet.tsx             Diet
  /settings/survey           app/settings/survey.tsx           Other onboarding answers (frequency, watch for, reasons, challenges, goal)
  /settings/reminders        app/settings/reminders.tsx        Scan reminders
  /settings/verdict-colors   app/settings/verdict-colors.tsx   Verdict colors explained
  /settings/allergy-card     app/settings/allergy-card.tsx     Allergy card (share, language, full screen)
  /settings/request-feature  app/settings/request-feature.tsx
  /settings/export           app/settings/export.tsx           Export summary report preview
  /settings/change-email     app/settings/change-email.tsx     Change email (sends a code to the new address)
  /settings/delete-account   app/settings/delete-account.tsx   Warning, type to confirm, final confirmation
  /legal/terms               app/legal/[doc].tsx               Terms and conditions (Phase 1)
  /legal/privacy             app/legal/[doc].tsx               Privacy policy (Phase 1)

Auth (Phase 1 plus additions)
  /(auth)/email              app/(auth)/email.tsx
  /(auth)/verify             app/(auth)/verify.tsx
  /(auth)/session-expired    app/(auth)/session-expired.tsx    returns the user to sign in

Global states
  /offline                   app/offline.tsx                   No internet; Retry
  /update-required           app/update-required.tsx           App update required (placeholder approved by the brief)
  +not-found                 app/+not-found.tsx                unknown route

Developer only (hidden, not linked from the UI)
  /dev/components            app/dev/components.tsx            component gallery, padding guide toggle, mock data toggle
```

## Presentation rules

| Kind | Presentation | Way out |
| --- | --- | --- |
| Tab screens | inside the tab navigator | switch tab |
| Stack screens | `slide_from_right`, swipe back enabled | back button (NavHeader) or swipe |
| Scanner | full screen modal with a sheet look, `slide_from_bottom` | swipe down, close button |
| Scan result, Product detail | `slide_from_right` from wherever it was opened; `?from=` tells Done where to return | back, Done |
| Analyzing | fade over the scanner, cannot be dismissed by the user | replaced by the result automatically |
| Legal, dev gallery | modal | close |
| Sheets | `@gorhom/bottom-sheet` modal with blur backdrop | drag down, backdrop tap, close |
| Dialogs | centred `ConfirmDialog` | cancel or confirm |

The tab bar is hidden on the scanner and on every full screen modal.

## Flow rules that the map enforces

- Onboarding routes are replaced, not pushed, when the user reaches Home, so back from Home never returns to onboarding.
- `Done` on a result goes back to the screen that started the scan (`?from=`), never always to Home.
- Screens with unsaved edits (Fix results, Log reaction, Create group, Edit name, Personal details, Request a feature) ask before leaving.
- Every list item has a detail screen: scan, product, reaction, badge, notification (opens its target), group, post, member.
