// Central registry for all question types in TentaGen
// Single source of truth — form, settings, AI, and exports all read from here

export type QuestionTier = "core" | "extended" | "specialized"

export type QuestionCategory =
  | "choice"       // MCQ-style selections
  | "text"         // Written responses
  | "cloze"        // Fill-in / gap-fill
  | "interactive"  // Ordering, matching, highlighting
  | "scientific"   // Math/chemistry notation

export interface QuestionTypeDefinition {
  id: string
  tier: QuestionTier
  learnosityType: string     // Actual Learnosity type for WISEflow export
  qtiInteraction: string     // QTI 2.1 interaction type
  defaultEnabled: boolean    // true = on by default
  canDisable: boolean        // false = always on (core types)
  category: QuestionCategory
  hasOptions: boolean        // MCQ-style answer options?
  hasCorrectAnswer: boolean  // Auto-scorable?
  supportsRubric: boolean    // instructor_stimulus support?
}

// All 18 active question types + 2 legacy (kept for DB compatibility)
export const QUESTION_TYPES: Record<string, QuestionTypeDefinition> = {
  // ─── CORE TIER (always ON) ───
  mcq: {
    id: "mcq",
    tier: "core",
    learnosityType: "mcq",
    qtiInteraction: "ChoiceInteraction",
    defaultEnabled: true,
    canDisable: false,
    category: "choice",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  true_false: {
    id: "true_false",
    tier: "core",
    learnosityType: "mcq",
    qtiInteraction: "ChoiceInteraction",
    defaultEnabled: true,
    canDisable: false,
    category: "choice",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  longtextV2: {
    id: "longtextV2",
    tier: "core",
    learnosityType: "longtextV2",
    qtiInteraction: "ExtendedTextInteraction",
    defaultEnabled: true,
    canDisable: false,
    category: "text",
    hasOptions: false,
    hasCorrectAnswer: false,
    supportsRubric: true,
  },
  short_answer: {
    id: "short_answer",
    tier: "core",
    learnosityType: "plaintext",
    qtiInteraction: "ExtendedTextInteraction",
    defaultEnabled: true,
    canDisable: false,
    category: "text",
    hasOptions: false,
    hasCorrectAnswer: false,
    supportsRubric: true,
  },
  fill_blank: {
    id: "fill_blank",
    tier: "core",
    learnosityType: "clozetext",
    qtiInteraction: "TextEntryInteraction",
    defaultEnabled: true,
    canDisable: false,
    category: "cloze",
    hasOptions: false,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },

  // ─── EXTENDED TIER (ON by default, can disable) ───
  multiple_response: {
    id: "multiple_response",
    tier: "extended",
    learnosityType: "mcq",
    qtiInteraction: "ChoiceInteraction",
    defaultEnabled: true,
    canDisable: true,
    category: "choice",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  matching: {
    id: "matching",
    tier: "extended",
    learnosityType: "association",
    qtiInteraction: "MatchInteraction",
    defaultEnabled: true,
    canDisable: true,
    category: "interactive",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  ordering: {
    id: "ordering",
    tier: "extended",
    learnosityType: "orderlist",
    qtiInteraction: "OrderInteraction",
    defaultEnabled: true,
    canDisable: true,
    category: "interactive",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },

  // ─── SPECIALIZED TIER (OFF by default, enable in settings) ───
  choicematrix: {
    id: "choicematrix",
    tier: "specialized",
    learnosityType: "choicematrix",
    qtiInteraction: "MatchInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "interactive",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  clozetext: {
    id: "clozetext",
    tier: "specialized",
    learnosityType: "clozetext",
    qtiInteraction: "TextEntryInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "cloze",
    hasOptions: false,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  clozedropdown: {
    id: "clozedropdown",
    tier: "specialized",
    learnosityType: "clozedropdown",
    qtiInteraction: "InlineChoiceInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "cloze",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  orderlist: {
    id: "orderlist",
    tier: "specialized",
    learnosityType: "orderlist",
    qtiInteraction: "OrderInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "interactive",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  tokenhighlight: {
    id: "tokenhighlight",
    tier: "specialized",
    learnosityType: "tokenhighlight",
    qtiInteraction: "HottextInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "interactive",
    hasOptions: false,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  clozeassociation: {
    id: "clozeassociation",
    tier: "specialized",
    learnosityType: "clozeassociation",
    qtiInteraction: "GapMatchInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "cloze",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  imageclozeassociationV2: {
    id: "imageclozeassociationV2",
    tier: "specialized",
    learnosityType: "imageclozeassociationV2",
    qtiInteraction: "GraphicGapMatchInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "interactive",
    hasOptions: true,
    hasCorrectAnswer: true,
    supportsRubric: false,
  },
  plaintext: {
    id: "plaintext",
    tier: "specialized",
    learnosityType: "plaintext",
    qtiInteraction: "ExtendedTextInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "text",
    hasOptions: false,
    hasCorrectAnswer: false,
    supportsRubric: true,
  },
  formulaessayV2: {
    id: "formulaessayV2",
    tier: "specialized",
    learnosityType: "formulaessayV2",
    qtiInteraction: "ExtendedTextInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "scientific",
    hasOptions: false,
    hasCorrectAnswer: false,
    supportsRubric: true,
  },
  chemistryessayV2: {
    id: "chemistryessayV2",
    tier: "specialized",
    learnosityType: "chemistryessayV2",
    qtiInteraction: "ExtendedTextInteraction",
    defaultEnabled: false,
    canDisable: true,
    category: "scientific",
    hasOptions: false,
    hasCorrectAnswer: false,
    supportsRubric: true,
  },
} as const

// ─── HELPER FUNCTIONS ───

/** Get all types for a specific tier */
export function getTypesByTier(tier: QuestionTier): QuestionTypeDefinition[] {
  return Object.values(QUESTION_TYPES).filter((t) => t.tier === tier)
}

/** Get default enabled type IDs (core + extended) */
export function getDefaultEnabledTypes(): string[] {
  return Object.values(QUESTION_TYPES)
    .filter((t) => t.defaultEnabled)
    .map((t) => t.id)
}

/** Get all core type IDs (always enabled, cannot be disabled) */
export function getCoreTypeIds(): string[] {
  return Object.values(QUESTION_TYPES)
    .filter((t) => t.tier === "core")
    .map((t) => t.id)
}

/** Validate and normalize enabled types (always include core) */
export function normalizeEnabledTypes(enabledTypes: string[] | undefined): string[] {
  const coreIds = getCoreTypeIds()
  if (!enabledTypes || enabledTypes.length === 0) {
    return getDefaultEnabledTypes()
  }
  // Always include core types even if somehow missing
  const typeSet = new Set([...coreIds, ...enabledTypes])
  // Filter out any invalid type IDs
  return Array.from(typeSet).filter((id) => id in QUESTION_TYPES)
}

/** Get the Learnosity export type for a given question type ID */
export function getLearnosityType(typeId: string): string {
  return QUESTION_TYPES[typeId]?.learnosityType ?? "longtextV2"
}

/** Get the QTI interaction type for a given question type ID */
export function getQtiInteraction(typeId: string): string {
  return QUESTION_TYPES[typeId]?.qtiInteraction ?? "ExtendedTextInteraction"
}

/** Check if a type ID is valid (exists in the registry) */
export function isValidQuestionType(typeId: string): boolean {
  return typeId in QUESTION_TYPES
}

/** Get specialized types grouped by category (for settings UI) */
export function getSpecializedByCategory(): Record<string, QuestionTypeDefinition[]> {
  const specialized = getTypesByTier("specialized")
  const grouped: Record<string, QuestionTypeDefinition[]> = {}
  for (const type of specialized) {
    if (!grouped[type.category]) {
      grouped[type.category] = []
    }
    grouped[type.category].push(type)
  }
  return grouped
}

// All valid type IDs as a union type for TypeScript
export type QuestionTypeId = keyof typeof QUESTION_TYPES

// Legacy types kept only for Convex DB compatibility (not in active system)
export const LEGACY_TYPE_IDS = ["hotspot", "rating_scale"] as const
