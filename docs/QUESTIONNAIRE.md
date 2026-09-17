# The onboarding questionnaire in the app

Source: `Onboarding-Questionnaire.pdf` (version 2, 17 September 2026). This
file maps every question, rule and message in that document to the code that
implements it. The questionnaire's version number lives in
`src/features/questionnaire/definition.ts`; profiles record the version they
answered and are invited to answer again when it changes.

## Questions and screens

| # | Question | Shown when | Screen | Answer stored in |
| --- | --- | --- | --- | --- |
| 1 | Who are you setting up? | Always. Free shows only "Me" plus an upgrade card; Plus and Family offer "Someone else" while there is room; "Someone I've already added" once someone was added | `app/(onboarding)/who.tsx`, `person-name.tsx`, `person-pick.tsx` | `answers.target`, `personName`, `existingProfileId` |
| 2 | Any food allergies or foods to avoid? | Always | `allergies.tsx` | `hasAllergies` (yes / no / unsure) |
| 3 | Which foods from the list? | Answer to 2 is Yes or unsure | `foods.tsx` + `FoodPicker` (14 major allergens first, "Show more") | `pickedFoods` |
| 4 | Any other foods? (typed in, up to 10) | Answer to 2 is Yes or unsure | `foods-other.tsx` + `TypedFoods` | `typedFoods` with its resolution |
| 5 | What happens when they eat it? | For each food | `food-reaction.tsx` | `perFood[id].kind`, `kindUnsure` |
| 6 | How bad has the worst reaction been? | For each food unless avoided by choice | `food-worst.tsx` | `perFood[id].worst` |
| 7 | How strictly is it avoided? | For each food avoided by choice | `food-strictness.tsx` | `perFood[id].strictness` |
| 8 | Has a doctor confirmed it? (optional) | For each food unless avoided by choice | `food-doctor.tsx` | `perFood[id].doctorConfirmed` |
| 9 | Any health condition affecting diet? | Always | `conditions.tsx` | `hasConditions` |
| 10 | Which conditions? | Answer to 9 is Yes | `conditions-pick.tsx` | `conditions` |
| 11 | When will it end? (optional) | For each temporary condition | `condition-end.tsx` | `conditionEnds[id]` |
| 12 | Anything else to note? (optional) | Always | `note.tsx` | `note` |

The ordered step list with its conditions is `src/features/onboarding/steps.ts`
(`activeSteps`), tested in `steps.test.ts`. After the questions the app shows
the camera explainer, the setup animation, the review screen (section 5), the
sign-in screen and the notification prompt.

## What the answers become

`src/features/questionnaire/rules.ts` (tested in `rules.test.ts`):

- `riskLevel`: severe, needed treatment and "not sure" are High risk; mild is a
  Warning; foods avoided by choice are High risk when avoided strictly and a
  Warning when a small amount is acceptable.
- `resolveFoodAnswers`: "not sure what kind" is recorded as an allergy,
  "not sure how bad" as severe; both are flagged on the food (`kindAssumed`,
  `severityAssumed`) so the review screen and the allergies screen can say so.
- `resolveTypedFood`: names the catalogue knows become that allergen
  (`prawns` becomes Crustaceans); words on almost every label are refused
  (`GENERIC_LABEL_WORDS`); anything else is kept as typed and checked by name
  only.
- `mergeProfile`: builds the profile, keeps the original answers, and when
  answering again adds to or updates the profile without removing anything.
- `validateAnswers`: nothing is saved halfway; every missing answer is listed
  on the review screen with a link back to the question, and the plan limit is
  checked again when saving.
- `activeConditionIds`: health conditions only take effect once the email is
  confirmed (`session.user.emailConfirmed`).
- `conditionNeedsCheck`: two weeks after a temporary condition's end date Home
  asks whether it still applies; the advice never switches off by itself.

## How results use the profile

`src/services/verdictEngine.ts` (tested in `verdictEngine.test.ts`):

- A product that contains a food is shown at the food's level (High risk or
  Warning).
- "May contain" and shared-equipment statements are shown at the same level as
  contains for High risk foods (any trace matters) and as a Warning for
  Warning foods. This is the app's reading of "leans towards warning too
  much rather than too little" and is one of the items for clinical review.
- Typed-in foods are checked by name only and can only make a result more
  cautious.
- Active health conditions add "limit" or "avoid" notes from
  `src/services/conditionRules.ts`; an "avoid" note turns a safe result into
  a Warning.

## Section 5 messages

| Message | When | Where |
| --- | --- | --- |
| Some reactions were recorded as severe | a food has `severityAssumed` | review screen, allergies screen tag |
| Consider speaking to a doctor | answer to question 2 was "I'm not sure" | review screen |
| Confirm your email to switch on health conditions | conditions exist and the email is not confirmed | review screen, conditions screen |
| We already know this food | a typed food resolved to a catalogue allergen | question 4 (inline) and review screen |
| Checked by name only | a typed food was kept as typed | question 4 (inline), review, allergies screen, result rows |
| Earlier entries are still on the profile | answering again left out foods recorded before | review screen |

## Plans

`src/features/questionnaire/plans.ts` reads the people per plan from
`appConfig.plans` (Free 1, Plus 5, Family 15). Lowering a limit removes
nobody: the profiles list and question 1 only stop offering "Someone else".
The mock plan can be switched in the hidden gallery.

## Existing users

`src/store/profileStore.ts` migrates profiles saved by the old survey
(`migrateLegacyProfile`): each restriction becomes a food with the matching
level, custom ingredients become foods checked by name only, and the profile
keeps `questionnaireVersion: 1` so the allergies screen invites the person to
answer the questions again. Nobody is forced through it.

## Still needs sign-off

The wording of the questions, the severity rules (questions 5 to 7), the
may-contain rule above, the condition ingredient lists and the generic-word
list are clinical judgements written with caution in mind. They have not been
reviewed by a qualified healthcare professional.
