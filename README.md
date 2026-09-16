# Allergy App (frontend)

React Native / Expo frontend for a dietary restrictions and allergy app. The onboarding flow is
built 1:1 from the designer's PDF in the repo root; the main app (scanner, results, history,
profiles, settings) follows the same visual language.

- Design tokens: [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md) and `src/theme/tokens.ts`
- Deviations from the PDF: [`docs/DESIGN_NOTES.md`](docs/DESIGN_NOTES.md)
- Stack decisions: [`docs/STACK.md`](docs/STACK.md)

## Requirements

- Node 20+ (tested with Node 26), npm 10+
- Xcode 16+ with an iOS simulator (iOS builds)
- Android Studio + SDK, a physical Android device with USB debugging (Android builds)
- Watchman (optional, faster Metro)

## Setup

```bash
npm install
cp .env.example .env      # EXPO_PUBLIC_API_MODE=mock for now
```

This project uses a **development build** (`expo-dev-client`), not Expo Go, because it relies on
native modules (MMKV, camera, Apple sign in). The first run of each platform compiles the native
app; later runs only restart Metro.

## Run

```bash
npm run ios              # builds and launches on the iOS Simulator (npx expo run:ios)
npm run android          # builds and installs on the USB-connected Android device
npm start                # Metro only (dev client), when the native app is already installed
```

### Android device over USB

1. On the phone: Settings > About phone > tap "Build number" 7 times to enable Developer options.
2. Developer options > enable **USB debugging** (and "Install via USB" on some brands).
3. Plug the phone in, choose "File transfer" if asked, and accept the RSA fingerprint prompt.
4. Check the device is visible:
   ```bash
   adb devices        # should list the device as "device", not "unauthorized"
   ```
5. `npm run android` (this runs `npx expo run:android --device` and prompts if several devices are connected).
6. If Metro cannot be reached from the phone, run `adb reverse tcp:8081 tcp:8081`.

### Release builds

```bash
npm run ios:release       # Release configuration on the simulator
npm run android:release   # release variant on the device (uses the debug keystore)
```

## Quality

```bash
npm run typecheck        # tsc --noEmit (strict)
npm run lint             # ESLint (eslint-config-expo)
npm run format           # Prettier
npm test                 # Jest + React Native Testing Library
```

## Project structure

```
app/                     Expo Router routes
  (onboarding)/          welcome, language, survey steps, setup, summary, save profile
  (auth)/                email, verification code
  (tabs)/                home, scan, history, profile
  (modals)/              scan result, product detail, legal, permissions
  dev/                   hidden component gallery (allergyapp://dev/components)
src/
  components/ui/         Button, OptionCard, ProgressHeader, Chip, SearchInput, Sheet, Checkbox, ...
  components/onboarding/ QuestionScreen template driven by config
  features/              scan, profile, history, settings feature folders
  theme/                 tokens.ts, typography.ts, responsive.ts, useTheme
  store/                 zustand stores + MMKV persistence
  services/              service interfaces, mock and http implementations
  mocks/                 mock data (ingredients, products, scan results)
  i18n/                  i18next setup and locales
  hooks/  utils/  types/
docs/                    design tokens, notes, stack
```

## Switching to the real backend

Every data call goes through an interface in `src/services/types.ts`. `EXPO_PUBLIC_API_MODE`
selects the implementation (`mock` today, `real` for the HTTP clients in `src/services/http`).
No component imports a mock or an API URL directly.

## Hidden dev screen

Open `allergyapp://dev/components` (or tap the app version in Settings five times) to see every UI
component in every state.
