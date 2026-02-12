// Export questions to Wiseflow "innehållsbank" JSON format
// Formats aligned with real WISEflow BEL.json reference structure

interface Question {
  type: string // Question type ID from question-types.ts registry
  stimulus: string
  options?: Array<{
    label: string
    value: string
  }>
  correctAnswer?: string[]
  instructorStimulus?: string
  // Score fields from Convex (based on difficulty: easy=1, medium=2, hard=3)
  score?: number
  maxScore?: number
  minScore?: number
  // Short keyword title from Convex (e.g. "Celldelning", "Presbyopi")
  title?: string
  // Stored tags from Convex (used to avoid duplicate tags during export)
  tags?: string[]
}

// Legacy format (nya versionen) - Learnosity structure
interface WiseflowLegacyQuestion {
  type: string
  widget_type: "response"
  reference: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  metadata: null
}

interface WiseflowLegacyItem {
  reference: string
  title: string
  description: string
  stimulus: string
  workflow: []
  metadata: []
  note: string
  source: string
  definition: {
    template: "dynamic"
    widgets: Array<{ reference: string }>
  }
  status: "published"
  questions: WiseflowLegacyQuestion[]
  features: []
  tags: string[]
  labels: Array<{
    id: number
    name: string
    type: "personal"
  }>
}

interface WiseflowLegacyRoot {
  data: WiseflowLegacyItem[]
  metadata: {
    author_version: string
    date_created: number
    created_by: number
    content: "item"
  }
}

interface WiseflowLabel {
  id: number
  name: string
  type: "personal"
}

// Utgående format (gamla versionen) - matches real WISEflow BEL.json structure
interface WiseflowUtgaendeQuestion {
  id: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  itemId: number
  maxScore: number
  minScore: number
}

interface WiseflowUtgaendeItem {
  id: number
  baseId: number
  title: string
  assignmentId: null
  assignment: null
  file: null
  extras: []
  features: string
  reference: string
  shared: false
  tools: []
  questions: WiseflowUtgaendeQuestion[]
  lastChanged: string
  shareType: -1
  shareFirstName: string
  shareLastName: string
  showAsItem: 1
  maxScore: number
  tags: string[]
  type: 0
  questionCount: number
  extraCount: 0
  hidden: false
  shareObj: null
}

interface ExportMetadata {
  subject: string
  topic: string
  difficulty: string
  language: string
  exportFormat: "legacy" | "utgaende" | "qti21"
  term?: string
  semester?: string
  examType?: string
  courseCode?: string
  additionalTags?: string
  tutorInitials?: string
  includeAITag?: boolean
  includeLanguageTag?: boolean
}

// Get the display name for a question type (single language only)
function getQuestionTypeTag(type: string, isSv: boolean): string {
  const typeMap: Record<string, [string, string]> = {
    mcq: ["MCQ", "Flervalsfråga"],
    true_false: ["True/False", "Sant/Falskt"],
    longtextV2: ["Essay", "Essä"],
    short_answer: ["Short Answer", "Kort svar"],
    fill_blank: ["Fill in the Blank", "Ifyllnad"],
    multiple_response: ["Multiple Response", "Flera rätt"],
    matching: ["Matching", "Matchning"],
    ordering: ["Ordering", "Ordningsföljd"],
    hotspot: ["Image Hotspot", "Bildmarkering"],
    rating_scale: ["Rating Scale", "Betygsskala"],
  }
  const entry = typeMap[type]
  return entry ? (isSv ? entry[1] : entry[0]) : type
}

// Get difficulty display name (single language only)
function getDifficultyTag(difficulty: string, isSv: boolean): string {
  const diffMap: Record<string, [string, string]> = {
    easy: ["Easy", "Lätt"],
    medium: ["Medium", "Medium"],
    hard: ["Hard", "Svår"],
  }
  const entry = diffMap[difficulty]
  return entry ? (isSv ? entry[1] : entry[0]) : difficulty
}

// Get score from question data, fallback to difficulty-based default
function getScore(question: Question, metadata: ExportMetadata): number {
  if (question.score && question.score > 0) return question.score
  if (question.maxScore && question.maxScore > 0) return question.maxScore
  // Fallback based on difficulty
  switch (metadata.difficulty) {
    case "easy": return 1
    case "medium": return 2
    case "hard": return 3
    default: return 1
  }
}

// Generate tags for a SINGLE question (single language, no raw internal values)
// existingTags: tags already stored on the question (from library) — skip duplicates
function generateAutoTags(metadata: ExportMetadata, questionType: string, existingTags?: string[]): string[] {
  const autoTags: string[] = []
  const isSv = metadata.language === "sv"
  const existing = new Set(existingTags || [])

  const addIfNew = (tag: string) => {
    if (tag && !existing.has(tag)) autoTags.push(tag)
  }

  addIfNew(metadata.subject)
  if (metadata.topic) addIfNew(metadata.topic)

  // Translated question type (e.g. "Flervalsfråga" not "mcq")
  addIfNew(getQuestionTypeTag(questionType, isSv))

  // Translated difficulty (e.g. "Svår" not "hard")
  addIfNew(getDifficultyTag(metadata.difficulty, isSv))

  // Language tag (only if metadata.includeLanguageTag is not explicitly false)
  if (metadata.includeLanguageTag !== false) {
    addIfNew(isSv ? "Svenska" : "English")
  }

  // AI-generated marker only if explicitly enabled
  if (metadata.includeAITag === true) {
    addIfNew(isSv ? "AI-genererad" : "AI-generated")
  }

  // Tutor initials if provided
  if (metadata.tutorInitials && metadata.tutorInitials.trim()) {
    addIfNew(metadata.tutorInitials.trim())
  }

  return autoTags
}

// Convert options {label: "A", value: "Mucin"} → {label: "Mucin", value: "0"}
function convertOptionsToWiseflow(options: Array<{ label: string; value: string }>): Array<{ label: string; value: string }> {
  return options.map((opt, index) => ({
    label: opt.value,
    value: index.toString(),
  }))
}

// Map correctAnswer labels (["A"]) → index values (["1"])
function mapCorrectAnswersToIndices(
  correctAnswer: string[],
  originalOptions: Array<{ label: string; value: string }>
): string[] {
  return correctAnswer.map((label) => {
    const index = originalOptions.findIndex((opt) => opt.label === label)
    return index >= 0 ? index.toString() : "0"
  })
}

function generateManualTags(metadata: ExportMetadata): string[] {
  const manualTags: string[] = []
  if (metadata.term) manualTags.push(metadata.term)
  if (metadata.semester) manualTags.push(metadata.semester)
  if (metadata.examType) manualTags.push(metadata.examType)
  if (metadata.courseCode) manualTags.push(metadata.courseCode)

  if (metadata.additionalTags) {
    const customTags = metadata.additionalTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    manualTags.push(...customTags)
  }

  return manualTags
}

function generateLabelsFromTags(tags: string[]): WiseflowLabel[] {
  return tags.map((tag) => ({
    id: 900000 + Math.abs(hashString(tag)) % 100000,
    name: tag,
    type: "personal" as const,
  }))
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}

// Get short title: use stored title if available, otherwise generate from stimulus
function getShortTitle(question: Question): string {
  // Use the stored short keyword title from Convex if available
  if (question.title && question.title.length > 0 && question.title.length <= 80) {
    return question.title
  }
  // Fallback: extract short title from stimulus (first few words)
  const plainText = question.stimulus.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim()
  const words = plainText.split(/\s+/).filter(w => w.length > 0)
  // Take first 3-5 meaningful words for a short title
  const shortWords = words.slice(0, 5).join(" ")
  return shortWords.length > 60 ? shortWords.substring(0, 57) + "..." : shortWords
}

// Build question data object for longtextV2 (essay) — matches real WISEflow format
// max_length = WORD count (Learnosity default 10000). 10000 lets students write freely.
function buildEssayQuestionData(question: Question, score: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {
    submit_over_limit: true,
    show_word_count: true,
    stimulus: question.stimulus,
    type: "longtextV2",
    max_length: 10000,
    validation: {
      max_score: score,
    },
    formatting_options: [
      "bold", "italic", "underline", "|",
      "unorderedList", "orderedList", "|",
      "charactermap"
    ],
    character_map: true,
    score: score,
    minScore: 0,
  }
  // Add instructor_stimulus (model answer/rubric) if available
  if (question.instructorStimulus) {
    data.instructor_stimulus = question.instructorStimulus
  }
  return data
}

// Build question data for MCQ — matches real WISEflow format
function buildMcqQuestionData(question: Question, score: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {
    stimulus: question.stimulus,
    type: "mcq",
    shuffle_options: true,
    score: score,
    minScore: 0,
  }
  if (question.options) {
    data.options = convertOptionsToWiseflow(question.options)
    data.ui_style = {
      choice_label: "upper-alpha",
      type: "horizontal",
    }
    if (question.correctAnswer) {
      data.validation = {
        scoring_type: "exactMatch",
        valid_response: {
          score: score,
          value: mapCorrectAnswersToIndices(question.correctAnswer, question.options),
        },
      }
    }
  }
  return data
}

// Build question data for multiple_response — WISEflow needs multiple_responses flag
function buildMultipleResponseData(question: Question, score: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {
    stimulus: question.stimulus,
    type: "mcq",
    multiple_responses: true,
    shuffle_options: true,
    score: score,
    minScore: 0,
  }
  if (question.options) {
    data.options = convertOptionsToWiseflow(question.options)
    data.ui_style = {
      choice_label: "upper-alpha",
      type: "horizontal",
    }
    if (question.correctAnswer) {
      data.validation = {
        scoring_type: "partialMatchV2",
        valid_response: {
          score: score,
          value: mapCorrectAnswersToIndices(question.correctAnswer, question.options),
        },
        penalty: 0,
        rounding: "none",
      }
    }
  }
  return data
}

// Build question data for short_answer — uses longtextV2 with shorter max_length
// Short answer uses longtextV2 with smaller word limit (50 words) and minimal formatting
function buildShortAnswerData(question: Question, score: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {
    submit_over_limit: true,
    show_word_count: true,
    stimulus: question.stimulus,
    type: "longtextV2",
    max_length: 200,
    validation: {
      max_score: score,
    },
    formatting_options: ["bold", "unorderedList", "orderedList"],
    character_map: true,
    score: score,
    minScore: 0,
  }
  if (question.instructorStimulus) {
    data.instructor_stimulus = question.instructorStimulus
  }
  return data
}

export function exportToWiseflowJSON(questions: Question[], metadata: ExportMetadata): string {
  const manualTags = generateManualTags(metadata)

  if (metadata.exportFormat === "legacy") {
    // LEGACY FORMAT (nya versionen) - Learnosity JSON structure
    const timestamp = Date.now()

    const items: WiseflowLegacyItem[] = questions.map((question) => {
      const questionRef = generateUUID()
      const itemRef = generateUUID()
      const title = getShortTitle(question)
      const score = getScore(question, metadata)

      // Pass existing tags to avoid duplicates (e.g., "Matchning" already in stored tags)
      const autoTags = generateAutoTags(metadata, question.type, question.tags)
      const allTags = [...(question.tags || []), ...autoTags, ...manualTags]

      // Build question data based on type
      let questionData
      const effectiveType = getEffectiveWiseflowType(question.type)

      if (question.type === "mcq" || question.type === "true_false") {
        questionData = buildMcqQuestionData(question, score)
      } else if (question.type === "multiple_response") {
        questionData = buildMultipleResponseData(question, score)
      } else if (question.type === "short_answer") {
        questionData = buildShortAnswerData(question, score)
      } else {
        // Essay, fill_blank, matching, ordering, hotspot, rating → longtextV2
        questionData = buildEssayQuestionData(question, score)
      }

      const wiseflowQuestion: WiseflowLegacyQuestion = {
        type: effectiveType,
        widget_type: "response",
        reference: questionRef,
        data: questionData,
        metadata: null,
      }

      return {
        reference: itemRef,
        title,
        description: "",
        stimulus: question.stimulus,
        workflow: [],
        metadata: [],
        note: "",
        source: "",
        definition: {
          template: "dynamic",
          widgets: [{ reference: questionRef }],
        },
        status: "published",
        questions: [wiseflowQuestion],
        features: [],
        tags: [],
        labels: generateLabelsFromTags(allTags),
      }
    })

    const root: WiseflowLegacyRoot = {
      data: items,
      metadata: {
        author_version: "4.8.1",
        date_created: Math.floor(timestamp / 1000),
        created_by: 2321143,
        content: "item",
      },
    }

    return JSON.stringify(root, null, 2)
  } else {
    // UTGÅENDE FORMAT — matches real WISEflow BEL.json structure
    const timestamp = Math.floor(Date.now() / 1000)
    const userProfile = getUserProfile(metadata)

    const items: WiseflowUtgaendeItem[] = questions.map((question, index) => {
      const baseId = 3500001 + index
      const itemId = 700001 + index
      const questionId = 6000001 + index
      const title = getShortTitle(question)
      const score = getScore(question, metadata)

      // Pass existing tags to avoid duplicates (e.g., "Matchning" already in stored tags)
      const autoTags = generateAutoTags(metadata, question.type, question.tags)
      const allTags = [...(question.tags || []), ...autoTags, ...manualTags]

      // Build question data based on type (matching real WISEflow format)
      let questionData
      const effectiveType = getEffectiveWiseflowType(question.type)

      if (question.type === "mcq" || question.type === "true_false") {
        questionData = buildMcqQuestionData(question, score)
      } else if (question.type === "multiple_response") {
        questionData = buildMultipleResponseData(question, score)
      } else if (question.type === "short_answer") {
        questionData = buildShortAnswerData(question, score)
      } else {
        // Essay, fill_blank, matching, ordering, hotspot, rating → longtextV2
        questionData = buildEssayQuestionData(question, score)
      }

      const utgaendeQuestion: WiseflowUtgaendeQuestion = {
        id: questionId,
        data: questionData,
        itemId: baseId,
        maxScore: score,
        minScore: 0,
      }

      const reference = metadata.tutorInitials
        ? `${metadata.tutorInitials.toUpperCase()}${String(index + 1).padStart(2, "0")}`
        : `Q${String(index + 1).padStart(2, "0")}`

      return {
        id: itemId,
        baseId,
        title,
        assignmentId: null,
        assignment: null,
        file: null,
        extras: [],
        features: `<span class='learnosity-response question-${baseId}q${questionId}'></span>`,
        reference,
        shared: false as const,
        tools: [],
        questions: [utgaendeQuestion],
        lastChanged: timestamp.toString(),
        shareType: -1 as const,
        shareFirstName: userProfile.firstName,
        shareLastName: userProfile.lastName,
        showAsItem: 1 as const,
        maxScore: score,
        tags: allTags,
        type: 0 as const,
        questionCount: 1,
        extraCount: 0 as const,
        hidden: false as const,
        shareObj: null,
      }
    })

    return JSON.stringify(items, null, 2)
  }
}

// Map TentaGen types to WISEflow-compatible types
function getEffectiveWiseflowType(type: string): string {
  // WISEflow only natively supports: longtextV2, mcq, choicematrix, association, classification
  // Map our types to the closest WISEflow equivalent
  switch (type) {
    case "mcq":
    case "true_false":
    case "multiple_response":
      return "mcq"
    case "longtextV2":
    case "short_answer":
    case "fill_blank":
    case "matching":
    case "ordering":
    case "hotspot":
    case "rating_scale":
    default:
      return "longtextV2"
  }
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getUserProfile(metadata: ExportMetadata): { firstName: string; lastName: string } {
  const initials = metadata.tutorInitials || ""

  if (initials.startsWith("id:")) {
    const id = initials.substring(3).toLowerCase()
    return { firstName: "Tutor", lastName: id.toUpperCase() }
  } else if (initials.length >= 2) {
    return { firstName: initials[0], lastName: initials.substring(1) }
  }

  return { firstName: "Unknown", lastName: "User" }
}

export function downloadWiseflowJSON(questions: Question[], metadata: ExportMetadata) {
  const jsonString = exportToWiseflowJSON(questions, metadata)

  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const timestamp = new Date().toISOString().split("T")[0]
  const format = metadata.exportFormat === "legacy" ? "legacy" : "utgaende"
  const filename = `wiseflow_${metadata.subject.toLowerCase().replace(/\s+/g, "_")}_${format}_${timestamp}.json`

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
