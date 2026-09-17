# User flows

Each journey as a Mermaid diagram. Route names come from `NAVIGATION.md`.
Rules that apply to all flows are at the end.

## 1. First launch (the questionnaire)

```mermaid
flowchart TD
  W["/(onboarding)/welcome"] --> Q1["Q1 who"] -->|Me| Q2["Q2 allergies?"]
  Q1 -->|"Someone else (Plus/Family)"| N["person-name"] --> Q2
  Q1 -->|"Already added"| P["person-pick"] --> Q2
  Q2 -->|No| Q9
  Q2 -->|"Yes / not sure"| Q3["Q3 foods list"] --> Q4["Q4 typed foods"] --> F["Q5-Q8 per food"] --> Q9["Q9 conditions?"]
  Q9 -->|Yes| Q10["Q10 which"] --> Q11["Q11 end date (temporary)"] --> Q12
  Q9 -->|No| Q12["Q12 note"]
  Q12 --> C["camera explainer"] --> S["setup"] --> R["review: foods, conditions, messages, issues"]
  R -->|"Looks right"| SP["save profile (sign in)"] --> NP["notifications"] --> H["/(tabs)/home"]
  R -->|Fix| F
```

## 2. Returning user

```mermaid
flowchart TD
  Splash --> Check{Session?}
  Check -->|valid, onboarding complete| Home["/(tabs)/home"]
  Check -->|expired| Expired["/(auth)/session-expired"]
  Expired -->|Sign in| Email["/(auth)/email"] --> Verify["/(auth)/verify"] --> Home
  Check -->|onboarding unfinished| Resume["/(onboarding)/<saved step>"]
```

## 3. Scan

```mermaid
flowchart TD
  Start{Started from} -->|Home hero, empty card, + menu| Scanner["/scan (modes: Food, Barcode, Label, Menu)"]
  Start -->|History empty state| Scanner
  Scanner -->|shutter or gallery| Analyzing["/scan/analyzing"]
  Scanner -->|barcode detected| Analyzing
  Analyzing --> Result["/scan/result/[id]?from=<origin>"]
  Result -->|Fix results| Fix["/scan/fix/[id]"] -->|Save| Result
  Result -->|bookmark| Saved[Toast: Saved to foods]
  Result -->|more: Compare| Compare["/compare?a=[id]"]
  Result -->|more: Share| Share[System share sheet]
  Result -->|more: Report a problem| Report["/scan/report/[id]"] -->|Send| Result
  Result -->|Done| Origin[Back to the screen that opened the scanner]
  Scanner -->|close| Origin
```

## 4. Barcode not found and blurry photo

```mermaid
flowchart TD
  Scanner["/scan (Barcode)"] -->|no product| NotFound["/scan/not-found?barcode="]
  NotFound -->|Scan label instead| ScannerLabel["/scan?mode=label"]
  NotFound -->|Add manually| Manual["/scan/manual"] --> Result["/scan/result/[id]"]
  NotFound -->|back| Scanner
  Scanner2["/scan (Food, Label, Menu)"] -->|blurry or dark| Unreadable["/scan/unreadable"]
  Unreadable -->|Retake| Scanner2
  Unreadable -->|Type instead| Manual
```

## 5. Search, product, save, compare

```mermaid
flowchart TD
  Entry{From} -->|+ menu: Food search| Search["/search"]
  Entry -->|Home hero| Search
  Search -->|result row| Product["/product/[id]"]
  Search -->|recent search| Search
  Product -->|bookmark| Toast[Toast: Saved] --> SavedList["/saved"]
  Product -->|Compare| Compare["/compare?a=[id]"]
  Compare -->|thumbnail| Compare
  Compare -->|Share| Share[System share sheet]
  SavedList -->|row| Product
  SavedList -->|swipe delete| Undo[Toast with Undo]
```

## 6. Log a reaction

```mermaid
flowchart TD
  Entry{From} -->|+ menu| Form["/reactions/new"]
  Entry -->|Insights reactions card| Form
  Entry -->|result more menu| Form2["/reactions/new?scanId="] --> Form
  Form -->|choose food| Picker[FoodPickerSheet from history]
  Form -->|photo| ImagePicker[Image picker]
  Form -->|Save| Toast[Toast: Reaction logged] --> Back[Back to where it started]
  Form -->|back with edits| Confirm[ConfirmDialog: discard?]
  Insights["/(tabs)/insights"] -->|Reactions card| List["/reactions"] -->|row| Detail["/reactions/[id]"]
  Detail -->|Delete| Confirm2[ConfirmDialog] --> List
```

## 7. Groups and family

```mermaid
flowchart TD
  Groups["/(tabs)/groups"] -->|Join| Joined[Pill turns Joined, toast]
  Groups -->|card| Detail["/groups/[id]"]
  Groups -->|+ Private group| Create["/groups/new"] -->|Create| Invite["/groups/[id]/invite"]
  Invite -->|Share link / copy code| Share[System share sheet]
  Detail -->|member avatar| Member["/members/[id]"]
  Detail -->|post| Post["/groups/posts/[id]"]
  Detail -->|new post| NewPost["/groups/posts/new?groupId="] --> Detail
  Detail -->|title dropdown| Switcher[GroupSwitcherSheet] --> Detail
  Detail -->|more: Leave group| Confirm[ConfirmDialog] --> Groups
  Post -->|more: Report| Report["/groups/posts/[id]/report"]
  Post -->|more: Block user| Confirm2[ConfirmDialog]
  Member -->|Add family member| Survey["/(onboarding)/who?mode=add"] --> Setup["/(onboarding)/setup"] --> Profiles["/profiles"]
  Member -->|Edit restrictions| Edit["/profiles/edit/[section]"]
  Member -->|Remove| Confirm3[ConfirmDialog] --> Profiles
```

## 8. Edit restrictions and see results update

```mermaid
flowchart TD
  Profile["/(tabs)/profile"] -->|My allergens and ingredients| Restrictions["/settings/restrictions"]
  Profile -->|Caution level| Caution["/settings/caution"]
  Profile -->|Diet| Diet["/settings/diet"]
  Restrictions -->|Save| Toast[Toast: Profile updated] --> Profile
  Toast -.->|verdicts recalculated| Home["/(tabs)/home recently scanned"]
  Toast -.-> History["/history"]
  Toast -.-> Saved["/saved"]
```

## 9. Notifications

```mermaid
flowchart TD
  Groups["/(tabs)/groups bell"] --> List["/notifications"]
  Push[Push notification tap] --> List
  List -->|product alert| Product["/product/[id]"]
  List -->|group reply| Post["/groups/posts/[id]"]
  List -->|reaction reminder| Reaction["/reactions/[id]"]
  List -->|more: Mark all as read| List
  List -->|more: Notification settings| Settings["/notifications/settings"]
```

## 10. Logout and delete account

```mermaid
flowchart TD
  Profile["/(tabs)/profile"] -->|Logout| Confirm[ConfirmDialog: Log out?]
  Confirm -->|Log out| Welcome["/(onboarding)/welcome (stack reset)"]
  Profile -->|Delete account| Warning["/settings/delete-account: what is removed"]
  Warning -->|Continue| Type[Type DELETE to confirm]
  Type -->|Delete| Final[ConfirmDialog: final confirmation]
  Final -->|Delete my account| Welcome
```

## 11. Log food, water and exercise (Phase 3)

```mermaid
flowchart TD
  Home["/(tabs)/home"] -->|"+ > Scan food"| Scan["/scan"] --> Result["/scan/result/[id]"] --> Home2["Home: calories, macros and ring colour update"]
  Home -->|"page 3 > Log Water"| Water[LogWaterSheet] --> Home
  Home -->|"+ > Log exercise"| Ex["/exercise/new"] -->|Log| Home3["budget grows by the burned calories"]
```

## 12. Connect Apple Health

```mermaid
flowchart TD
  P3["Home page 3"] -->|first visit or Connect| Sheet["Add workouts to your daily budget"]
  Sheet -->|Connect Apple Health| Connected["steps, workouts and burn fill in"]
  Sheet -->|Not now| P3
  Profile["/(tabs)/profile > Manage Apple Health"] --> AH["/settings/apple-health"] -->|Connect / Disconnect| Profile
```

## 13. Weight, goals and milestones

```mermaid
flowchart TD
  Ins["/(tabs)/insights"] -->|Log weight| LW[LogWeightSheet] --> Ins2["weight card, chart, changes and BMI update"]
  Ins -->|Day Streak or Badges tile| M["/milestones"] -->|badge| B["/badges/[id]"]
  Ins -->|Set a goal weight| PD["/settings/personal"] -->|Change Goal| Ins
  Profile["/(tabs)/profile"] -->|Edit Nutrition Goals| NG["/settings/nutrition-goals"] -->|Auto Generate| Home["Home budget updates"]
```

## Rules for every flow

- Every screen has a clear way in and out; there are no dead ends.
- Back returns to the previous screen with its scroll position and selections kept. Android hardware back does the same.
- Closing the scanner, a sheet or a result returns to the screen that opened it (`?from=`), not always Home.
- Finishing a task (save, log reaction, join group) shows a toast and returns the user to a sensible place.
- Once Home is reached the onboarding stack is replaced, so back cannot re-enter onboarding.
- Screens with unsaved changes ask before leaving.
- Route names are deep link ready so notifications can open the right screen later.
