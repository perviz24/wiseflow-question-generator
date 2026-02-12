# Session 2 Handoff — Question Types System (Part 2)

## Project
- **Name:** TentaGen (wiseflow-question-generator)
- **Path:** `C:\Users\pervi\OneDrive\Desktop\Claude code folder files\wiseflow-question-generator\`
- **Stack:** Next.js 16 + TypeScript + Convex + Clerk + Vercel AI SDK + shadcn/ui
- **Live:** Deployed on Vercel

## What Session 1 Completed (sub-features 1–5)

### 1. `src/lib/question-types.ts` — Type Registry (SINGLE SOURCE OF TRUTH)
- 18 active question types in 3 tiers + 2 legacy (hotspot, rating_scale)
- **Core (5, always ON):** mcq, true_false, longtextV2, short_answer, fill_blank
- **Extended (3, ON by default):** multiple_response, matching, ordering
- **Specialized (10, OFF by default):** choicematrix, clozetext, clozedropdown, orderlist, tokenhighlight, clozeassociation, imageclozeassociationV2, plaintext, formulaessayV2, chemistryessayV2
- Helper functions: `getDefaultEnabledTypes()`, `normalizeEnabledTypes()`, `getLearnosityType()`, `getQtiInteraction()`, `getSpecializedByCategory()`

### 2. Convex Schema Updated (`convex/schema.ts`)
- `questions.type` now has 20 `v.literal()` values (18 active + 2 legacy)
- `userProfiles.enabledQuestionTypes: v.optional(v.array(v.string()))` — undefined = defaults

### 3. Translations (`src/lib/translations.ts`)
- 10 new `questionType_*` keys (sv + en) for all specialized types
- 18 settings dialog strings (tier names, category labels, manage types, etc.)

### 4. `src/components/question-types-dialog.tsx` — Management UI
- Opens from settings sheet via "Manage Question Types" button
- 3-tier layout with color-coded badges (emerald/blue/amber)
- Core types show lock icon, Extended/Specialized have Switch toggles
- Reset to defaults button

### 5. `src/components/settings-sheet.tsx` — Save/Load Wiring
- Loads `enabledQuestionTypes` from Convex profile on open
- Passes to `QuestionTypesDialog` as prop
- Saves to Convex via `upsertProfile` mutation on "Save Settings"

## What Session 2 Must Build (sub-features 6–10)

### 6. Form Type Selector — `src/components/question-generator-form.tsx`
**Current state:** Has hardcoded array of ~8 types with a "show more" toggle.
**Goal:** Replace with types from `question-types.ts` registry, filtered by user's `enabledQuestionTypes` from their profile.
- Import `QUESTION_TYPES`, `normalizeEnabledTypes` from question-types.ts
- Read user profile to get `enabledQuestionTypes`
- Show only enabled types as checkboxes in the form
- Keep existing UI pattern (grid of type checkboxes)

### 7. AI Generation Prompts — `src/app/api/generate/route.ts` (or wherever AI prompt lives)
**Goal:** Teach the AI how to generate questions for new specialized types.
- Each type needs specific generation instructions (e.g., clozetext = "create sentences with ___ blanks")
- Map type IDs to prompt snippets describing the expected output format
- Keep prompt concise — AI should know what each type looks like

### 8. Question Preview — `src/components/question-preview.tsx`
**Current state:** Has render logic for original 8 types + hotspot + rating_scale.
**Goal:** Add preview renders for new specialized types.
- choicematrix → grid/matrix display
- clozetext → text with highlighted blanks
- clozedropdown → text with dropdown indicators
- orderlist → numbered drag list
- tokenhighlight → text with highlighted tokens
- clozeassociation → text gaps with drag targets
- imageclozeassociationV2 → image with labeled drop zones
- plaintext → simple text area
- formulaessayV2 → text area with math notation indicator
- chemistryessayV2 → text area with chemistry notation indicator

### 9. WISEflow/Learnosity Export — `src/lib/wiseflow-export.ts`
**Current state:** Has `getEffectiveWiseflowType()` mapping 8 types → Learnosity types.
**Goal:** Extend to support all 18 types using the `learnosityType` field from question-types.ts.
- Replace hardcoded mapping with: `import { getLearnosityType } from '@/lib/question-types'`
- Each type's `learnosityType` is already defined in the registry
- New types need proper Learnosity JSON structure (stimulus, options, validation)

**Confirmed Learnosity type mappings (from learnosity-qti GitHub repo):**
| TentaGen Type | Learnosity Type | QTI Interaction |
|---|---|---|
| choicematrix | choicematrix | MatchInteraction |
| clozetext | clozetext | TextEntryInteraction |
| clozedropdown | clozedropdown | InlineChoiceInteraction |
| orderlist | orderlist | OrderInteraction |
| tokenhighlight | tokenhighlight | HottextInteraction |
| clozeassociation | clozeassociation | GapMatchInteraction |
| imageclozeassociationV2 | imageclozeassociationV2 | GraphicGapMatchInteraction |
| plaintext | plaintext | ExtendedTextInteraction |
| formulaessayV2 | formulaessayV2 | ExtendedTextInteraction |
| chemistryessayV2 | chemistryessayV2 | ExtendedTextInteraction |

### 10. QTI/CSV/Word Exports
- `src/lib/qti-export.ts` — use `getQtiInteraction()` from registry
- `src/lib/csv-export.ts` — add new type column labels
- Word export — include new type rendering

## Important Technical Notes

1. **Question interface `type` field is now `string`** in these 5 files (was specific union):
   - `src/lib/wiseflow-export.ts`
   - `src/lib/csv-export.ts`
   - `src/lib/qti-export.ts`
   - `src/components/question-preview.tsx`
   - `src/components/question-generator-form.tsx` (also has `as any` cast at line ~373 for Convex mutation)

2. **Convex dev vs prod are SEPARATE** — after schema changes, must deploy to both:
   - Dev: `npx convex dev --once`
   - Prod: `npx convex deploy`

3. **Translation keys for type names** follow pattern: `questionType_${typeId}` where typeId uses camelCase (e.g., `questionType_choicematrix`, `questionType_imageclozeassociationV2`)

4. **User's quality demand:** "handle it very professionally so that i do not need to go ahead and check if it works or not" — test everything with Playwright before declaring done.

## File Map (key files to read first)

```
src/lib/question-types.ts          ← SINGLE SOURCE OF TRUTH (read first)
src/lib/translations.ts            ← All UI strings (sv + en)
src/components/settings-sheet.tsx   ← Settings with types dialog
src/components/question-types-dialog.tsx ← Types management UI
src/components/question-generator-form.tsx ← Form (needs type selector update)
src/components/question-preview.tsx ← Preview renders (needs new types)
src/lib/wiseflow-export.ts         ← WISEflow/Learnosity export (needs mappings)
src/lib/qti-export.ts              ← QTI export (needs new interactions)
src/lib/csv-export.ts              ← CSV export (needs new columns)
convex/schema.ts                   ← Database schema (already updated)
convex/profiles.ts                 ← User profiles (already updated)
src/app/api/generate/route.ts      ← AI generation (needs type prompts)
```

## Delete This File
After Session 2 is complete, delete this handoff file — it's temporary.
