# Design tokens

Source of truth: `dietary_restrictions_app_onboarding_survey(1)(1).pdf` (7 A4 pages, 3 phone mockups per page, 21 screens).

## How the values were measured

1. Each page was rasterized at 300 DPI (`pdftoppm -r 300`), giving 2481 x 3508 px pages.
2. Each phone screen was cropped by detecting the dark bezel. Screen widths are 677-700 px for a
   393 pt wide phone (iPhone 14/15 Pro class), so **1 pt = 1.763 px** in the numbers below.
   Screen numbering: page 1 = screens 01-03 (Welcome, Language, Who), page 2 = 04-06, ... page 7 = 19-21.
3. Colours were sampled as the median of solid regions (buttons, circles, bars) or, for text,
   the median of the darkest 1-3% of pixels inside a text run (stroke cores).
4. Font sizes were fitted by rendering the same strings in Inter and matching the measured
   pixel width. Cap heights in the mockups run ~15-20% taller than Inter at the width-fitted size,
   so widths (which decide line breaks) were preferred.
5. The PDF is a rendered mockup, not a vector export. The same element varies a few px between
   screens; values were averaged and rounded to the nearest design-system step.

## Colours

| Token             | Value     | Measured                                               | Where                                                                        |
| ----------------- | --------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `background`      | `#FFFFFF` | `#FEFEFE`                                              | Page background, every screen                                                |
| `surface`         | `#F5F5F7` | `#F6F6F6` / `#F6F6FA`                                  | Icon chips (s03), back button (s03), feature circles (s01)                   |
| `surfaceTint`     | `#F6F6FB` | `#F6F7FB` / `#F7F7FC` / `#F6F6FA`                      | Review card (s15), profile cards (s19), why-use cards (s20), hero card (s01) |
| `surfaceStrong`   | `#F2F2F7` | `#F2F2F6` / `#F2F2F2`                                  | Ingredient chips (s08), close button (s02), date wheel highlight (s04)       |
| `border`          | `#EFEFF2` | `#F1F1F2` / `#EEEEF2`                                  | Unselected card border (s03), search field (s08), Google/email buttons (s21) |
| `divider`         | `#F2F2F4` | `#F2F2F2`                                              | Language rows (s02), checklist rows (s18)                                    |
| `track`           | `#E8E8EC` | `#E6E6EA` / `#EEEFF2`                                  | Progress track (s03), loading track (s18)                                    |
| `ring`            | `#D9D9DE` | `#D9D9DE`                                              | Unselected radio ring (s03)                                                  |
| `handle`          | `#C7C7CC` | `#C6C6CA`                                              | Sheet grabber (s02)                                                          |
| `primary`         | `#1C1A20` | `#1B1920` (button), `#191520` (bar), `#18151C` (check) | Continue button, selected border, filled check, progress fill                |
| `text`            | `#0F0D14` | `#0E0B14` / `#141318` / `#0B0710`                      | Question titles, "78%", sheet title                                          |
| `textBody`        | `#37363C` | `#46464A` (17pt strokes, blurred)                      | Option labels, language rows, checkbox labels                                |
| `textSecondary`   | `#6B6B70` | `#6A696C`                                              | Feature captions (s01)                                                       |
| `textMuted`       | `#85858A` | `#858589` / `#7F7F86` / `#86858F`                      | Subtitles, "Suggested", review date                                          |
| `textPlaceholder` | `#A6A6AC` | `#A6A6AC`                                              | "Search ingredients" (s08)                                                   |
| `textFaded`       | `#C7C7CC` | `#C4C4CA` (visual)                                     | Date wheel unselected rows (s04)                                             |
| `success`         | `#1C9750` | `#1C9750`                                              | "Works for you" badge circle (s01, s14)                                      |
| `successBright`   | `#29AD51` | `#29AD51` / `#1AC458` / `#06C74F`                      | Loading bar head (s18), check strokes (s20), Halal icon (s19)                |
| `successSoft`     | `#B8DFB3` | `#B8DFB3`                                              | Loading bar tail (s18)                                                       |
| `successTint`     | `#D5EFDA` | visual                                                 | "All done" check circle (s17)                                                |
| `danger`          | `#F5433A` | `#F74236`                                              | X marks (s20), "Avoid" icon (s19)                                            |
| `gold`            | `#EDB962` | `#ECB861` / `#EFBA63`                                  | Stars and laurels (s15)                                                      |
| `info`            | `#3B9FD8` | `#2892C0` core, `#60ADCF` blended                      | Spinner ring (s18)                                                           |
| `warning`         | `#E8A317` | not in PDF                                             | Caution verdict (main app)                                                   |
| `appleBlack`      | `#000000` | visual                                                 | Sign in with Apple (s21)                                                     |

## Typography (Inter)

| Token          | Size / line | Weight   | Fitted size | Measured on                                                                     |
| -------------- | ----------- | -------- | ----------- | ------------------------------------------------------------------------------- |
| `display`      | 40 / 52     | Bold     | 40.2-40.6   | "Eating with restrictions made easy" (s01), pitch 91px                          |
| `titleLg`      | 38 / 48     | Bold     | 37.3-37.6   | "Save your profile" (s21), "Why use this app?" (s20), "Time to generate" (s17)  |
| `title`        | 36 / 48     | Bold     | 36.3-36.7   | "Who are you setting this up for?" (s03), pitch 85px                            |
| `loading`      | 60 / 68     | Bold     | 59.4        | "78%" (s18)                                                                     |
| `statement`    | 32 / 42     | SemiBold | 32.5        | "We're setting everything up for you" (s18), pitch 75px                         |
| `sectionTitle` | 22 / 28     | SemiBold | 22.0-23.2   | "Setting up" (s18), "Without the app" (s20), "Select Language" (s02)            |
| `bodyLg`       | 22 / 32     | Regular  | 21.9-23.1   | Review text (s15), "All done!" (s17)                                            |
| `subtitle`     | 20 / 30     | Regular  | 20.4-20.8   | "Scan food and know if it works for you in seconds." (s01), pitch 53px          |
| `wheel`        | 24 / 30     | Regular  | 23.5        | "June" (s04)                                                                    |
| `button`       | 18 / 22     | SemiBold | 18.4        | "Continue" (s03)                                                                |
| `sectionLabel` | 18 / 24     | Regular  | 18.3        | "Suggested" (s08)                                                               |
| `input`        | 18 / 24     | Regular  | 19.0        | "Search ingredients" (s08)                                                      |
| `label`        | 17 / 24     | Medium   | 17.7-17.9   | "Someone I care for", "A family member" (s03)                                   |
| `body`         | 17 / 24     | Regular  | 17.0-17.9   | "English" (s02), "Ingredient watchlist" (s18), "I agree to the Terms and" (s21) |
| `caption`      | 16 / 22     | Regular  | 15.5        | "Scan any food" (s01), pitch 40px                                               |
| `captionSm`    | 15 / 20     | Regular  | 15.1        | "avg rating" (s15)                                                              |
| `badge`        | 16 / 20     | SemiBold | 15.7        | "Works for you" (s01)                                                           |

## Spacing and layout

| Token                        | Value                                                  | Measured                                                  |
| ---------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| Screen horizontal padding    | 20                                                     | Cards at x=39..659 px of 693 -> 22 / 19 pt (s03)          |
| Header top (below safe area) | 16                                                     | Back button top at 71 pt with a 54 pt status bar          |
| Back button                  | 46 circle                                              | 80-83 px (s03)                                            |
| Progress bar                 | 8 tall, 24 gap after back button, 8 extra right inset  | 15 px tall, x=163..641 (s03)                              |
| Title top (below header)     | 40                                                     | Cap top at 168 pt, header bottom at 116 pt, minus leading |
| Title to first card          | 40                                                     | 81 px between title descender and card border (s03)       |
| Subtitle to first card       | 24                                                     | s07                                                       |
| Option card                  | min 92 tall, padding 20, gap 16                        | 161 px tall, 30 px gap (s03)                              |
| Compact option card          | min 68, padding 12                                     | s12 diet list 66 pt, s08 suggested 60 pt                  |
| Icon chip                    | 52 circle, 26 icon                                     | 90 px circle, 31x44 px glyph (s03)                        |
| Radio / check circle         | 32                                                     | 57 px (s03)                                               |
| Primary button               | 62 tall, pill, full content width                      | 107-116 px on s03/05/07/08/09/13/16/19/20                 |
| Button bottom gap            | 16 above home indicator                                | 45-57 px from screen bottom                               |
| Auth buttons                 | 76 tall, 28 gap                                        | 128-137 px, 45-53 px gaps (s21)                           |
| Checkbox                     | 28, radius 6, 26 gap to label                          | 49 px (s21)                                               |
| Search field                 | 60 tall, radius 16                                     | 110 px (s08)                                              |
| Ingredient chip              | 50 tall, pill, 22 padding, 12 gap                      | 90 px tall (s08)                                          |
| Feature circles              | 64, 28 icon, 22 caption pitch                          | 112 px (s01)                                              |
| Hero card                    | square, radius 28, corners 52 arm / 2.5 thick inset 39 | s01                                                       |
| Badge                        | 40 circle + 5 white ring, pill 50 tall radius 24       | s01 / s14                                                 |
| Language sheet               | radius 28, 72 row pitch, 40 close button, 44x5 handle  | s02                                                       |
| Large cards                  | radius 24, padding 24                                  | s15, s18, s19, s20                                        |
| Loading bar                  | 10 tall                                                | 18 px (s18)                                               |
| Date wheel                   | 50 row, 52 highlight radius 14, columns 150 / 82 / 108 | s04                                                       |
| Card radius                  | 16                                                     | diagonal-corner test 15.5 pt (s03, s08)                   |
| Selected border              | 1.5                                                    | 2.5 px (s03)                                              |
| Unselected border            | 1                                                      | ~2 px (s03)                                               |

## Icons

The mockups use filled, slightly rounded glyphs (SF Symbols style) inside the option chips and
thin 2pt outline glyphs for the feature circles, checklist and summary cards. They are mapped to
`Ionicons` / `MaterialCommunityIcons` glyphs in `src/components/ui/Icon.tsx` (one place to swap
for custom SVGs later).
