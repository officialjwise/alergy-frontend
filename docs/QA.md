# QA pass (Phase 2, milestone 11)

Date: 2026-09-17. Device: iPhone 14 Pro Max simulator (iOS 26.0), plus an
iPhone SE (3rd generation) simulator for the small-screen pass. Android was
deferred by the product owner ("focus is on iOS"), so nothing below was run on
Android; the Android notes in `README.md` still apply.

## How the app was driven

Every screen was opened on the simulator and screenshotted, either through its
deep link (`xcrun simctl openurl <udid> "allergyapp://<route>"`) or by tapping
through the flow with synthetic clicks. The hidden gallery
(`allergyapp://dev/components`, or tap the version line on Profile five times)
holds the switches used for the state checks: padding guides, new-user versus
active-user mock data, next photo unreadable, sample restrictions, session
expiry and forced update.

## Flows from `USER_FLOWS.md`

| Flow | Result |
| --- | --- |
| 1. First launch | Onboarding (Phase 1) reaches Home; the product alerts intro sheet appears once a saved food exists and is remembered. |
| 2. Returning user | Launch goes straight to Home; an expired session (dev switch) shows the session expired screen and its sign-in path returns to Home. |
| 3. Scan | Home or + menu opens the scanner sheet; Food capture shows the analyzing screen with ingredient callouts and lands on the result; Done returns to the origin. Barcode, Label and Menu modes switch hints and frame. |
| 4. Recovery | Barcode not found offers "scan the label" and "add manually"; the unreadable screen (dev switch) offers retake and type instead. |
| 5. Search, product, save, compare | Typing finds products with verdict pills; product detail reuses the result layout; Save creates a saved food with a toast; Compare fills two slots from recent products, shows the ingredient table and the differences toggle. |
| 6. Log a reaction | Form validates food, symptoms and severity; date and time wheels; saved reactions appear in the list, detail and the Insights reactions card; delete asks first. |
| 7. Groups and family | Join / Joined pills, feed with member streaks, post detail with comments, create private group, invite link and code, member detail with family actions. |
| 8. Edit restrictions | Profile rows reuse the onboarding editors; the sample-restrictions switch re-seeds history and verdicts update on Home, history and results. |
| 9. Notifications | Grouped list with unread dots; rows open their target (product, post, reactions, scanner); mark all read; notification settings toggles. |
| 10. Logout and delete | Logout confirms and returns to Welcome; delete account walks warning, typed DELETE and a final dialog, then clears every store. |

## Screens against the references

`docs/design/SCREENSHOT_INVENTORY.md` maps every reference image to the route
that implements it; no row is pending. The five missing Set A images were
built from the written spec and should be re-checked when the images arrive.

## States

| State | Where it was checked |
| --- | --- |
| Loading | Skeletons on Home, Insights, results, lists and groups |
| Empty | New-user data set: Home placeholder card, empty history, saved foods, reactions, action plan, notifications, badges |
| Error | Query errors render the shared error state with retry (mock "fail next" switch in the gallery) |
| Offline | Banner on the tabs; full screen offline route with retry; route errors while offline show the offline content |
| Permission denied | Camera explainer and denied state with Open Settings; photo access toast; notification permission banner |
| Locked / not ready | Most flagged ingredients card, pending scan change rows |

## Alignment

With the padding guides on, titles, cards and rows on Home, Insights, Groups
and Profile sit on the same 20pt page padding, icons share one slot width, and
chevrons align on the right. Cards in a row share heights (stat pager tiles).

## Responsiveness

- iPhone 14 Pro Max (430 x 932): every screen above.
- iPhone SE (3rd generation, 375 x 667): welcome, "who", ingredients, setup,
  Home, Insights, Groups, Profile, scan history and the camera permission view
  were captured with the Pro Max app state copied over (`Documents/mmkv`).
  Nothing is clipped: Get started and Continue stay inside the safe area, the
  stat pager still shows three tiles, and lists scroll beneath the floating tab
  bar. Two things wrap instead of truncating, which is intended: the "Flagged
  foods over time" title next to its badge, and long group names in the
  "My groups" strip (two lines, then an ellipsis).
- Android phone: not run (deferred).

## Accessibility

Every control has a role and a label; verdicts and severities always pair an
icon with text; touch targets are at least 44pt; font scaling is capped per
text style so fixed layouts do not break. VoiceOver order follows the visual
order on the screens that were spot-checked (Home, result, Insights).

## Performance

Animations run on the UI thread (Reanimated) for press feedback, rings,
progress bars and the segmented control thumb. Lists use FlashList.

Release build: `xcodebuild -configuration Release -sdk iphonesimulator`
succeeded with the same local `expo-modules-jsi` patch as Debug. The embedded
JS bundle is 5.9 MB. Installed on the Pro Max simulator it launches to Home
without Metro and opens Insights, Groups and a scan result through deep links.

## Checks run before the push

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run lint` (`expo lint`) | clean. Run lint through this script; a bare `npx eslint .` cannot resolve the `@typescript-eslint` plugin that `eslint-config-expo` wires up. |
| `npx jest` | 10 suites, 36 tests pass |
| Wording grep (calorie, macro, protein, carbs, fat, weight, BMI, workout, exercise) | only ingredient and product names such as "vegetable fat" and "Chocolate Protein Bar" |

## Known issues and limitations

- The Mac's Xcode 26.0.1 cannot compile Expo SDK 57's `expo-modules-jsi`
  without a local, uncommitted patch in `node_modules` (see `README.md`).
  Xcode 26.3 or newer removes the need for it.
- Android has not been run in Phase 2.
- Five of the six Set A reference images were not provided.
- Locales other than English are copies of the English file marked `__todo`;
  the allergy card language switch falls back to English until they exist.
- Ingredient callouts on the analyzing screen use fixed anchor points; real
  positions need the backend's image analysis.
- The invite QR is a placeholder pattern; the family plan and update required
  screens are the two approved placeholders.
- Widgets are previews only.
- Sync, reports, feature requests, notifications and groups are mocked and
  kept on the device.

# Phase 3 pass (milestones 12 to 15, 2026-09-17)

Same set-up as above: iPhone 14 Pro Max simulator driven with deep links and
synthetic taps, iPhone SE (3rd generation) with the Pro Max state copied over.

## What was checked

| Area | Result |
| --- | --- |
| Home (`set-b/01.jpeg`, video 0:03-0:12) | Streak pill, ring calendar, "140 /2773 Calories eaten" card with the eaten/left toggle, macro cards, page dots and the Recently uploaded rows with calories and macro grams. Swiping the macro cards moves the whole block; page 2 shows fiber, sugar, sodium and Health Score 7/10; page 3 shows Connect Apple Health, calories burned, steps and Water. |
| Workouts sheet (`set-b/0.jpeg`) | Opens on the first visit to page 3 and from Connect: Morning Run +320, Yoga +90, Steps +80, "Added to today's budget +490 cal", "Daily Calorie Budget 2,773 → 3,263", Connect Apple Health, Not now. Connecting fills in 490 cal burned and 12,430 steps and the budget becomes 3263. |
| Log Water, Log exercise | Cup stepper saves the day's total; the exercise form estimates calories from the workout, minutes, intensity and weight and adds them to the budget. |
| Milestones (video 0:12-0:16) | Flame with the streak, badge hexagon with the count, longest streak and x/30 pills, 30 badges in three columns; earned ones coloured, locked ones grey. |
| Insights (`set-b/03`, `016`, `017`, `018`, `04`) | Day Streak and Badges Earned tiles, Current Weight 120 lbs with Log weight and "At your goal by June 24, 2027", Weight Progress axis 116-124 with the flat line, range chips, Weight Changes rows, Progress Photos, Daily Average Calories with macro-coloured bars and week chips, Weekly Energy with grouped bars, Expenditure Changes pending rows, Your BMI 19.4 Healthy on the four-band scale. |
| Weight History, photo privacy | Last weigh-in, history rows, Log Weight sheet; the dark "Your Photos, Your Privacy" notice with Continue. |
| Profile (`set-b/07`, `08`, `012`, `013`, video 0:52-2:00) | Header card, Refer a friend row, Account, Goals & Tracking (six rows), Allergies & diet, widget previews, Support & Legal, Follow Us, Account Actions. |
| Settings sub-screens | Confirm your name, Refer your friend (avatars, code, Share, How to earn), Personal Details (Goal Weight with Change Goal, five editable rows), Preferences (appearance tiles and six toggles), Family Plan, Edit nutrition goals (rings, fields, micronutrients fold, Auto Generate Goals), Tracking Reminders (four meals plus End of Day with time pills), Sync to Apple Health, Ring Colors Explained. |
| Sign in | New Sign in screen from Welcome ("Already have an account? Sign in") with Apple, Google and email; Save your profile restyled to match. |
| iPhone SE | Home, Insights, Milestones and Profile fit at 375pt; three cards per row still readable. |
| Checks | `npx tsc --noEmit` clean, `npm run lint` clean, 50 Jest tests pass (14 new for the nutrition maths). |

## Known limitations added in Phase 3

- Apple Health is a mock: "Connect" flips a stored flag and returns sample
  workouts and steps. The HealthKit module and entitlement are a native
  follow-up.
- Appearance stores System / Light / Dark but the palette is light-only.
- The referral code, reward copy and Family Plan price are configuration
  values; sharing the code uses the system share sheet (no clipboard module).
- "Time Traveler" and the invite badges cannot progress until logging for a
  past day and referrals are tracked by a backend.
- The Release simulator build was not repeated for Phase 3; the Debug build
  was verified on both simulators.

# Phase 4 pass (questionnaire, 2026-09-17)

Walked through on the iPhone 14 Pro Max simulator from a cleared state:
Welcome, language sheet, Q1 (Free plan: "Me" and the upgrade card), Q2 "I'm
not sure" with its note, Q3 with peanuts and milk, Q4 with "prawns" (recorded
as Crustaceans), "dragon fruit" (checked by name only) and "water" (refused),
Q5 to Q8 for each food including the "recorded as an allergy" and "treated as
severe" notes and the Skip on Q8, Q9 to Q11 with diabetes and a pregnancy
due date, Q12 note, camera question, setup, the review screen with the four
foods and their levels plus the five messages, Apple sign-in, notifications,
Home. Afterwards the allergies screen showed the four foods with High risk or
Warning pills and their tags, the conditions screen showed both conditions
with the end date, a peanut granola bar came back High risk with "Limit honey
(Diabetes)", and dark chocolate came back High risk from its may-contain
statement with "Limit sugar (Diabetes)". Typecheck, lint and 58 tests pass.
