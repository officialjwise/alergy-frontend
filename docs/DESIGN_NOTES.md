# Design notes and deviations

Every place where the build differs from the PDF, or where the PDF was ambiguous, is listed here.

## Fixes the brief asked for

1. **Progress bar** - the fill length in the PDF jumps around (e.g. 32% on "Who are you", 22% on
   "When were you born", 60% on ingredients, 40% on "Save your profile"). The app computes
   `step / totalSteps` from the real onboarding step index so it only ever increases.
2. **Copy adapts to who the profile is for** - picking "My child", "A family member" or
   "Someone I care for" swaps question copy ("When was your child born?", "Which ingredients
   do they avoid?"...). Strings live in `src/i18n/locales/en.json` under `*_other` keys.
3. **Profile summary uses real answers** - the "Your food profile is ready" card is built from the
   store, not the sample values (Peanuts, Milk, Shellfish, Pork / Extra cautious / Halal / Eat with
   confidence). Empty answers hide the row.
4. **Continue is disabled until valid** - single/multi select need one answer, ingredients need at
   least one chip, the date must be a real date in the past.
5. **Persistence** - answers and the current step are persisted with MMKV; relaunching resumes at
   the same step. Back restores the previous selection.

## Deviations and interpretations

- **Font**: the mockups are rendered in an Inter / SF Pro style face. Inter is bundled so both
  platforms match. Cap heights in the mockup run ~15-20% taller than Inter at the width-fitted
  size; widths were preferred so line breaks match the PDF.
- **Button width**: the Continue button in the PDF is inset 24-28pt on some screens and 20pt on
  others (mockup noise). It uses the same 20pt as the cards everywhere.
- **Card height varies with list length in the PDF** (92pt on 4-5 item screens, 66pt on the
  8-item diet list, 60pt on the ingredient suggestions). Implemented as a `compact` density on
  `OptionCard`; question configs choose it for lists of 6+ items and the suggestions list.
- **Icons** are vector glyphs from Ionicons / MaterialCommunityIcons chosen to match each mockup
  glyph. A few mockup glyphs have no exact equivalent (peanut, sesame, stomach, praying hands);
  the closest filled glyph is used. Swap in `Icon.tsx` if custom SVGs arrive.
- **Flags** in the language sheet are emoji (the PDF shows wavy emoji-style flags).
- **Photos and illustration** (hero bowl, camera scan, "All done" illustration, avatars, laurels)
  were cropped out of the PDF at 300 DPI (~1.76x). The "Works for you" badge is rendered as a
  component on top of the photo, covering the baked-in badge at the same position. The right
  laurel is a mirror of the left one (the mockup's right laurel is clipped).
- **Language sheet backdrop**: the PDF blurs the welcome screen behind the sheet with a gray tint.
  Implemented with `expo-blur` plus a 45% tint.
- **Sheet grabber** is drawn 44x5 (the mockup's is unusually wide, ~56x6).
- **Date wheel** is a custom 3-column wheel (month / day / year) that matches the PDF on both
  platforms, instead of the native iOS spinner that Android cannot reproduce.
- **"Sign in with Apple" / Google** are wired to mock handlers; real credentials are for later.
- **Safety notice**: every result screen carries "Results are a guide. Always check the label."
  (not in the PDF; required for an allergy app).
- **Screens not in the PDF** (severity per ingredient, profile name, custom ingredient, permission
  explainers, notifications, email + OTP, legal, splash, main app, settings, states) use the same
  tokens, cards, buttons and spacing so they read as part of the same design.

## Flow decisions not visible in the PDF

- **Language sheet trigger**: the PDF has no visible language button on the welcome screen. The
  sheet opens over the blurred welcome screen on the first "Get Started" tap (matching the page
  order Welcome -> Select Language -> Who); picking a language or closing the sheet continues to
  the survey. Later the language is changed from Settings.
- **Birth date wheel** starts on the PDF's sample date (June 15, 2001) and that date counts as the
  answer, so Continue is enabled without scrolling. Days clamp when the month or year changes.
- **Ingredient chips** show the exact PDF order of suggestions (Eggs, Sesame, Soy, Alcohol) first,
  then Milk, Wheat, Shellfish, Peanuts, Tree nuts, Fish. Typing an unknown ingredient offers an
  "Add" card that creates a custom ingredient.
- **Severity per ingredient** is a card per ingredient with four filter chips and an
  "Apply to all" shortcut. Continue needs every ingredient rated.
- **Setup screen** counts to 100% in about 4 seconds, ticks the checklist at 30 / 55 / 78 / 100%,
  then moves on by itself (the PDF only shows the 78% frame).
- **Profile summary** hides rows without answers and shows "{name}'s profile" when the profile is
  for someone else.
- **Save your profile**: Sign in with Apple is only rendered on iOS (Apple's guidelines); Android
  shows Google and email. The terms checkbox is on by default like the PDF, but tapping a sign-in
  button with it off shows an inline error instead of continuing.
- **Email flow** (not in the PDF): email entry -> 6-digit code with a 30s resend timer, wrong /
  expired / too-many-attempts errors, and a mock hint showing the accepted code.
- **Notification prompt** is the last onboarding step, after the account, and is skippable.

## Main app (not in the PDF)

Built with the same tokens: 20pt gutters, 16pt-radius bordered cards, 24pt-radius lavender cards,
52pt icon chips, 62pt pill buttons, Inter type scale.

- **Tabs**: Home, Scan, History, Profile. Outline icons when inactive, filled when active,
  near-black active tint, muted inactive tint, 1pt divider on top.
- **Home**: greeting, active-profile card (tap to switch profile via a sheet), near-black
  "Scan food" card, "Recent scans" and "Saved safe foods" lists with skeleton / empty / error states.
- **Scanner**: full-bleed camera, white scan-frame corners (same geometry as the welcome hero),
  torch, gallery import, "Type instead" manual search, barcode detection. Recognition is mocked:
  captures rotate through the mock catalogue so every verdict can be demoed.
- **Verdicts**: Works for you (green), Caution (amber), Not safe (red), Not sure (gray). Each has
  an icon and a label; colour is never the only signal. The result screen lists every triggering
  ingredient with the matched label text and why (contains / may contain / cross-contact / unclear),
  the ingredients that were checked and cleared, the label text, and the safety notice.
- **History**: search, verdict and saved filters as chips, grouped by Today / Yesterday / date.
- **Profiles**: multiple profiles, switch from Home, manage (add = re-run the survey, delete with
  confirmation, cannot delete the last one). Editing restrictions, caution level, diet and goal
  reuses the survey cards.
- **Settings**: account (sign in / out), language sheet, notifications toggle, privacy / terms,
  redo onboarding, delete account (double confirmation), version (5 taps opens the component gallery).

## Open questions for the designer

- Whether the auth buttons are intentionally taller (76pt) than the primary button (62pt).
- Exact icon set (SF Symbols vs custom) so the glyphs can be matched 1:1.
- Dark mode is out of scope for now; the theme hook is ready for it.
