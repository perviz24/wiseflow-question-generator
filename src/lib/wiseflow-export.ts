// Export questions to Wiseflow "innehållsbank" JSON format

interface Question {
  type: "mcq" | "true_false" | "longtextV2" | "short_answer" | "fill_blank" | "multiple_response" | "matching" | "ordering" | "hotspot" | "rating_scale"
  stimulus: string
  options?: Array<{
    label: string
    value: string
  }>
  correctAnswer?: string[]
  instructorStimulus?: string
}

// Legacy format (nya versionen) - Learnosity structure
interface WiseflowLegacyQuestion {
  type: string
  widget_type: "response"
  reference: string
  data: {
    minScore: number
    options?: Array<{ label: string; value: string }>
    score: number
    shuffle_options?: boolean
    stimulus: string
    type: string
    ui_style?: {
      choice_label: "upper-alpha"
      type: "horizontal" | "block"
    }
    validation?: {
      scoring_type: "exactMatch"
      valid_response: {
        score: number
        value: string[]
      }
    }
  }
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

// Utgående format (gamla versionen) - array structure
interface WiseflowUtgaendeQuestion {
  id: number
  data: {
    options?: Array<{ label: string; value: string }>
    ui_style?: {
      choice_label: "upper-alpha"
      type: "block"
    }
    stimulus: string
    type: string
    validation?: {
      scoring_type: "exactMatch"
      valid_response: {
        score: number
        value: string[]
      }
    }
    shuffle_options?: boolean
    score: number
    minScore: number
  }
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
  includeAITag?: boolean // Whether to include "AI-generated" tag
}

// Get the display name for a question type
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

// Generate tags for a SINGLE question (per-question type, not all types)
function generateAutoTags(metadata: ExportMetadata, questionType: string): string[] {
  const autoTags: string[] = []
  const isSv = metadata.language === "sv"

  // Add subject and topic
  autoTags.push(metadata.subject)
  autoTags.push(metadata.topic)

  // Add THIS question's type only (not all types from the set)
  autoTags.push(getQuestionTypeTag(questionType, isSv))

  // Add difficulty (in correct language)
  if (metadata.difficulty === "easy") autoTags.push(isSv ? "Lätt" : "Easy")
  else if (metadata.difficulty === "medium") autoTags.push(isSv ? "Medium" : "Medium")
  else if (metadata.difficulty === "hard") autoTags.push(isSv ? "Svår" : "Hard")
  else autoTags.push(metadata.difficulty)

  // Add language tag
  autoTags.push(isSv ? "Svenska" : "English")

  // Add AI-generated marker only if explicitly enabled
  if (metadata.includeAITag === true) {
    autoTags.push(isSv ? "AI-genererad" : "AI-generated")
  }

  // Add tutor initials if provided
  if (metadata.tutorInitials && metadata.tutorInitials.trim()) {
    autoTags.push(metadata.tutorInitials.trim())
  }

  return autoTags
}

// Convert AI-generated options {label: "A", value: "Mucin"} to Wiseflow format {label: "Mucin", value: "0"}
function convertOptionsToWiseflow(options: Array<{ label: string; value: string }>): Array<{ label: string; value: string }> {
  return options.map((opt, index) => ({
    label: opt.value, // Answer text becomes the label
    value: index.toString(), // Index as string becomes the value
  }))
}

// Map correctAnswer labels (e.g. ["A"]) to Wiseflow index values (e.g. ["1"])
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

  // Add exam center tags
  if (metadata.term) manualTags.push(metadata.term)
  if (metadata.semester) manualTags.push(metadata.semester)
  if (metadata.examType) manualTags.push(metadata.examType)
  if (metadata.courseCode) manualTags.push(metadata.courseCode)

  // Add custom additional tags (comma-separated)
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
  // Generate unique IDs for labels (simple hash-based approach)
  return tags.map((tag, index) => ({
    id: 900000 + Math.abs(hashString(tag)) % 100000, // Generate ID between 900000-999999
    name: tag,
    type: "personal" as const,
  }))
}

// Simple string hash function for consistent label IDs
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

export function exportToWiseflowJSON(questions: Question[], metadata: ExportMetadata): string {
  // Manual tags are shared across all questions
  const manualTags = generateManualTags(metadata)

  if (metadata.exportFormat === "legacy") {
    // LEGACY FORMAT (nya versionen) - Learnosity JSON structure
    const timestamp = Date.now()

    const items: WiseflowLegacyItem[] = questions.map((question, index) => {
      const questionRef = generateUUID()
      const itemRef = generateUUID()

      // Strip HTML tags from stimulus for title
      const plainTitle = question.stimulus.replace(/<[^>]*>/g, "").trim()
      const title = plainTitle.length > 100 ? plainTitle.substring(0, 97) + "..." : plainTitle

      // Per-question tags (only THIS question's type, not all types)
      const autoTags = generateAutoTags(metadata, question.type)
      const allTags = [...autoTags, ...manualTags]

      const wiseflowQuestion: WiseflowLegacyQuestion = {
        type: question.type,
        widget_type: "response",
        reference: questionRef,
        data: {
          minScore: 0,
          score: 1,
          stimulus: question.stimulus,
          type: question.type,
        },
        metadata: null,
      }

      // Add MCQ/True-False specific fields
      if ((question.type === "mcq" || question.type === "true_false") && question.options) {
        // Convert options: {label: "A", value: "Mucin"} → {label: "Mucin", value: "0"}
        wiseflowQuestion.data.options = convertOptionsToWiseflow(question.options)
        wiseflowQuestion.data.shuffle_options = true
        wiseflowQuestion.data.ui_style = {
          choice_label: "upper-alpha",
          type: "horizontal",
        }

        // Map correct answers to index-based values
        if (question.correctAnswer) {
          wiseflowQuestion.data.validation = {
            scoring_type: "exactMatch",
            valid_response: {
              score: 1,
              value: mapCorrectAnswersToIndices(question.correctAnswer, question.options),
            },
          }
        }
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
    // UTGÅENDE FORMAT (gamla versionen) - Array structure
    const timestamp = Math.floor(Date.now() / 1000)
    const userProfile = getUserProfile(metadata)

    const items: WiseflowUtgaendeItem[] = questions.map((question, index) => {
      const baseId = 3500001 + index
      const itemId = 700001 + index
      const questionId = 6000001 + index

      // Strip HTML tags from stimulus for title
      const plainTitle = question.stimulus.replace(/<[^>]*>/g, "").trim()
      const title = plainTitle.length > 100 ? plainTitle.substring(0, 97) + "..." : plainTitle

      // Per-question tags (only THIS question's type)
      const autoTags = generateAutoTags(metadata, question.type)
      const allTags = [...autoTags, ...manualTags]

      const utgaendeQuestion: WiseflowUtgaendeQuestion = {
        id: questionId,
        data: {
          stimulus: question.stimulus,
          type: question.type,
          shuffle_options: true,
          score: 1,
          minScore: 0,
        },
        itemId: baseId,
        maxScore: 1,
        minScore: 0,
      }

      // Add MCQ/True-False specific fields
      if ((question.type === "mcq" || question.type === "true_false") && question.options) {
        // Convert options: {label: "A", value: "Mucin"} → {label: "Mucin", value: "0"}
        utgaendeQuestion.data.options = convertOptionsToWiseflow(question.options)
        utgaendeQuestion.data.ui_style = {
          choice_label: "upper-alpha",
          type: "block",
        }

        // Map correct answers to index-based values
        if (question.correctAnswer) {
          utgaendeQuestion.data.validation = {
            scoring_type: "exactMatch",
            valid_response: {
              score: 1,
              value: mapCorrectAnswersToIndices(question.correctAnswer, question.options),
            },
          }
        }
      }

      const reference = metadata.tutorInitials ? `${metadata.tutorInitials.toUpperCase()}${String(index + 1).padStart(2, "0")}` : `Q${String(index + 1).padStart(2, "0")}`

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
        maxScore: 1,
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

// Helper to generate UUID for legacy format
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper to extract user profile from metadata
function getUserProfile(metadata: ExportMetadata): { firstName: string; lastName: string } {
  // Parse tutor initials like "id:pma" or "JD"
  const initials = metadata.tutorInitials || ""

  if (initials.startsWith("id:")) {
    // Format: id:pma → First: Parvis, Last: Assar
    const id = initials.substring(3).toLowerCase()
    // Simple mapping - in real app this would come from user profile
    return { firstName: "Tutor", lastName: id.toUpperCase() }
  } else if (initials.length >= 2) {
    // Format: JD → First: J, Last: D
    return { firstName: initials[0], lastName: initials.substring(1) }
  }

  return { firstName: "Unknown", lastName: "User" }
}

export function downloadWiseflowJSON(questions: Question[], metadata: ExportMetadata) {
  const jsonString = exportToWiseflowJSON(questions, metadata)

  // Create blob and download
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  // Generate filename with timestamp and format
  const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const format = metadata.exportFormat === "legacy" ? "legacy" : "utgaende"
  const filename = `wiseflow_${metadata.subject.toLowerCase().replace(/\s+/g, "_")}_${format}_${timestamp}.json`

  // Trigger download
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}
