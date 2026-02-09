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

function generateAutoTags(metadata: ExportMetadata, questionTypes: Set<string>): string[] {
  const autoTags: string[] = []

  // Add subject and topic
  autoTags.push(metadata.subject)
  autoTags.push(metadata.topic)

  // Add all unique question types from the set
  questionTypes.forEach((type) => {
    if (type === "mcq") autoTags.push("MCQ")
    else if (type === "true_false") autoTags.push("True/False")
    else if (type === "longtextV2") autoTags.push("Essay")
  })

  // Add difficulty
  autoTags.push(metadata.difficulty)

  // Add language
  autoTags.push(metadata.language === "sv" ? "Swedish" : "English")

  // Add timestamp
  const timestamp = new Date().toLocaleString("sv-SE")
  autoTags.push(timestamp)

  // Add AI-generated marker (only if enabled)
  if (metadata.includeAITag !== false) {
    // Default to true if not specified
    autoTags.push("AI-generated")
  }

  // Add tutor initials if provided
  if (metadata.tutorInitials && metadata.tutorInitials.trim()) {
    autoTags.push(metadata.tutorInitials.trim())
  }

  return autoTags
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
  // Collect all unique question types from questions
  const questionTypes = new Set<string>()
  questions.forEach((q) => questionTypes.add(q.type))

  // Generate tags
  const autoTags = generateAutoTags(metadata, questionTypes)
  const manualTags = generateManualTags(metadata)
  const allTags = [...autoTags, ...manualTags]

  if (metadata.exportFormat === "legacy") {
    // LEGACY FORMAT (nya versionen) - Learnosity JSON structure
    const timestamp = Date.now()

    const items: WiseflowLegacyItem[] = questions.map((question, index) => {
      const questionRef = generateUUID()
      const itemRef = generateUUID()

      // Strip HTML tags from stimulus for title
      const plainTitle = question.stimulus.replace(/<[^>]*>/g, "").trim()
      const title = plainTitle.length > 100 ? plainTitle.substring(0, 97) + "..." : plainTitle

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
        wiseflowQuestion.data.options = question.options
        wiseflowQuestion.data.shuffle_options = true
        wiseflowQuestion.data.ui_style = {
          choice_label: "upper-alpha",
          type: "horizontal",
        }

        // Map correct answers to index-based values
        if (question.correctAnswer) {
          const validResponseValues = question.correctAnswer.map((label) => {
            const index = question.options!.findIndex((opt) => opt.label === label)
            return index.toString()
          })

          wiseflowQuestion.data.validation = {
            scoring_type: "exactMatch",
            valid_response: {
              score: 1,
              value: validResponseValues,
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
        utgaendeQuestion.data.options = question.options
        utgaendeQuestion.data.ui_style = {
          choice_label: "upper-alpha",
          type: "block",
        }

        // Map correct answers to index-based values
        if (question.correctAnswer) {
          const validResponseValues = question.correctAnswer.map((label) => {
            const index = question.options!.findIndex((opt) => opt.label === label)
            return index.toString()
          })

          utgaendeQuestion.data.validation = {
            scoring_type: "exactMatch",
            valid_response: {
              score: 1,
              value: validResponseValues,
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
        shared: false,
        tools: [],
        questions: [utgaendeQuestion],
        lastChanged: timestamp.toString(),
        shareType: -1,
        shareFirstName: userProfile.firstName,
        shareLastName: userProfile.lastName,
        showAsItem: 1,
        maxScore: 1,
        tags: allTags,
        type: 0,
        questionCount: 1,
        extraCount: 0,
        hidden: false,
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
