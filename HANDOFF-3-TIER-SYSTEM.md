# TentaGen — 3-Tier Question Type System Handoff Guide

> **For:** Next Claude Code session to continue implementing this feature
> **Date:** 2026-02-12
> **Project:** wiseflow-question-generator
> **Path:** `C:\Users\pervi\OneDrive\Desktop\Claude code folder files\wiseflow-question-generator\`

---

## Status: What's Done

All 11 bug fixes/features from the user's sequential task list are COMPLETE and committed:

1. ~~Fix matching tag appearing twice~~ ✅
2. ~~Fix tutor initials tag not showing in WISEflow~~ ✅
3. ~~Fix multiple_response answer tagging~~ ✅
4. ~~Fix question titles (too long)~~ ✅
5. ~~Fix CSV export encoding and format~~ ✅
6. ~~Fix WISEflow longtextV2 formatting~~ ✅
7. ~~Make language tag optional~~ ✅
8. ~~Fix YouTube/Vimeo URL upload errors~~ ✅
9. ~~Implement bulk delete in library~~ ✅
10. ~~Add TentaGen logo on homepage~~ ✅
11. ~~Add Word (.docx) export format~~ ✅

**Code is pushed to GitHub but NOT yet redeployed to Vercel.**

---

## Next Task: 3-Tier Question Type System (Feature #12)

This is a major architectural change with 10 sub-features. User approved this plan.

### The Concept

Organize all question types into 3 tiers with user-controlled activation:

| Tier | Types | Default State | Description |
|------|-------|--------------|-------------|
| **Core** | mcq, true_false, longtextV2, short_answer, fill_blank | Always ON (cannot disable) | Most-used types |
| **Extended** | multiple_response, matching, ordering | ON by default (can disable) | Common but optional |
| **Specialized** | choicematrix, association, classification, clozetext, clozedropdown, orderlist, tokenhighlight | OFF by default (opt-in) | Advanced Learnosity types |

**Also:** Remove `hotspot` and `rating_scale` from UI (keep in Convex schema for backward compatibility with existing saved questions).

### 10 Sub-Features (Build Order)

#### Sub-feature 1: Create shared question types file
- **File:** `src/lib/question-types.ts` (NEW)
- **Contains:** Type definitions, tier assignments, default states, Learnosity type mappings
- **All other files will import from here** (single source of truth)

#### Sub-feature 2: Update Convex schema
- **File:** `convex/schema.ts`
- **Add 7 new type literals** to the `type` union: choicematrix, association, classification, clozetext, clozedropdown, orderlist, tokenhighlight
- **Keep** hotspot and rating_scale in schema (backward compat)
- **Add type-specific optional fields** for new types (e.g., `stemItems` for choicematrix, `possibleResponses` for association)
- **Run `npx convex dev --once`** to deploy schema change

#### Sub-feature 3: Add translations for new types
- **File:** `src/lib/translations.ts`
- **Add Swedish and English names** for all 7 new types
- **Add tier labels:** "Grundläggande"/"Core", "Utökad"/"Extended", "Specialiserad"/"Specialized"
- **Add settings page translations**

#### Sub-feature 4: Update AI generation API route
- **File:** `src/app/api/generate/route.ts` (+ generate-more + regenerate-alternatives)
- **Update Zod schema** to include new types
- **Update AI prompt** with descriptions of new types so Claude knows how to generate them
- **Add structured output schemas** for new types (choicematrix needs stem_items/options, etc.)

#### Sub-feature 5: Create settings page for type activation
- **File:** `src/app/settings/page.tsx` (NEW) or integrate into existing SettingsSheet
- **Store activation state** in Convex userProfiles table (add `activeQuestionTypes` field)
- **UI:** Grouped by tier, Core types are locked ON, Extended/Specialized have toggles
- **Default:** Core always on, Extended on, Specialized off

#### Sub-feature 6: Update question generator form selector
- **File:** `src/components/question-generator-form.tsx`
- **Replace hardcoded type buttons** with dynamic rendering from question-types.ts
- **Only show types that are activated** in user's settings
- **Group visually by tier** with labels

#### Sub-feature 7: Build preview renders for new types
- **File:** `src/components/question-preview.tsx`
- **Add render cases** for each new type (choicematrix as grid, association as pairs, etc.)
- **Handle edit mode** for new types

#### Sub-feature 8: Build WISEflow/Learnosity export builders
- **File:** `src/lib/wiseflow-export.ts`
- **Add Learnosity JSON builders** for each new type following official Learnosity format
- **Reference:** BEL.json contains real examples of Learnosity structure

#### Sub-feature 9: Update QTI export for new types
- **File:** `src/lib/qti-export.ts`
- **Add QTI 2.1/2.2 XML builders** for new types where QTI supports them
- **Some specialized types may not have QTI equivalents** — skip gracefully

#### Sub-feature 10: Update CSV and Word export for new types
- **Files:** `src/lib/csv-export.ts`, `src/lib/word-export.ts`
- **Add column/formatting support** for new type structures

---

## Critical Files Map

| File | Lines | What It Does |
|------|-------|--------------|
| `src/components/question-generator-form.tsx` | ~970 | Main form — type selector, all form fields |
| `src/app/library/page.tsx` | ~980 | Library — list, filter, export, delete |
| `src/components/question-preview.tsx` | ~750 | Preview + edit + export for generated questions |
| `src/app/api/generate/route.ts` | ~350 | AI generation endpoint (Claude API) |
| `src/app/api/generate-more/route.ts` | ~200 | Generate additional questions |
| `src/app/api/regenerate-alternatives/route.ts` | ~200 | Regenerate specific question |
| `src/lib/wiseflow-export.ts` | ~300 | WISEflow/Learnosity JSON export |
| `src/lib/qti-export.ts` | ~250 | QTI 2.1/2.2 XML export |
| `src/lib/csv-export.ts` | ~100 | CSV export |
| `src/lib/word-export.ts` | ~280 | Word (.docx) export |
| `src/lib/translations.ts` | ~500 | Bilingual translations (sv/en) |
| `convex/schema.ts` | ~100 | Database schema |
| `convex/questions.ts` | ~150 | Question CRUD mutations/queries |

---

## Current Question Types in Code

**In Convex schema (`type` union):**
mcq, longtextV2, true_false, short_answer, fill_blank, multiple_response, matching, ordering, hotspot, rating_scale

**In generate API route (Zod enum):**
Same 10 types

**In form (hardcoded buttons, lines 605-850):**
Same 10 types as individual button blocks

**In translations:**
All 10 types have Swedish/English display names

---

## Learnosity Type Reference (for new types)

These are the 7 new types to add. Their Learnosity `type` values:

| Our Type Name | Learnosity `type` | What It Is |
|---------------|-------------------|------------|
| choicematrix | choicematrix | Grid with stems (rows) and options (columns) — rate multiple items |
| association | association | Drag-and-drop matching (pairs) — more flexible than `matching` |
| classification | classification | Sort items into categories (drag-and-drop into buckets) |
| clozetext | clozetext | Fill-in-the-blank with typed input (inline text entry) |
| clozedropdown | clozedropdown | Fill-in-the-blank with dropdown selectors |
| orderlist | orderlist | Drag items into correct order (more structured than `ordering`) |
| tokenhighlight | tokenhighlight | Highlight words/sentences in a passage |

---

## Key Architecture Notes

1. **WISEflow uses Learnosity engine** — all exports must follow Learnosity JSON format
2. **Reference file:** A BEL.json file with 145 real Learnosity items was analyzed in earlier sessions. Key structure: `{ reference, type, data: { type, stimulus, options, validation, metadata } }`
3. **longtextV2 max_length** is WORD count (not characters). Default 10000 for essays, 200 for short answers
4. **Tags format:** `[ { type: "Tag", name: "Subject", description: "Matematik" } ]`
5. **Bilingual UI:** App supports Swedish (sv) and English (en). All user-facing strings go through `t()` from translations.ts
6. **Export formats:** Legacy JSON, Utgående JSON, QTI 2.1, QTI 2.2 (Inspera), Word (.docx), CSV
7. **User settings:** Stored in Convex `userProfiles` table. Currently has: userId, tutorInitials, uiLanguage

---

## Deployment Info

- **Live URL:** https://tentagen.vercel.app
- **GitHub:** perviz24/wiseflow-question-generator
- **Convex prod:** https://strong-rabbit-731.convex.cloud
- **Auth:** Clerk with JWT template "convex"
- **Deploy command:** `vercel --prod --force --yes`

---

## User's Quality Expectation

> "Handle it very professionally so that I do not need to go ahead and check if it works or not... since this platform will be used by schools and institutions it would be better to do this once and right."

Test everything with Playwright before declaring done. Commit after each sub-feature.
