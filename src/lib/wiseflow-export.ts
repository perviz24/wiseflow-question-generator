// Export questions to Wiseflow "innehållsbank" JSON format

interface Question {
  type: "mcq" | "true_false" | "longtextV2"
  stimulus: string
  options?: Array<{
    label: string
    value: string
  }>
  correctAnswer?: string[]
  instructorStimulus?: string
}

interface WiseflowQuestion {
  data: {
    type: string
    stimulus: string
    options?: Array<{ label: string; value: string }>
    validation?: {
      valid_response: {
        value: string[]
      }
    }
    max_length?: number
    formatting_options?: string[]
    submit_over_limit?: boolean
    instructor_stimulus?: string
  }
}

interface WiseflowLabel {
  id: number
  name: string
  type: "personal"
}

interface WiseflowItemLegacy {
  title: string
  questions: WiseflowQuestion[]
  tags?: string[]
}

interface WiseflowItemUtgaende {
  title: string
  questions: WiseflowQuestion[]
  labels?: WiseflowLabel[]
}

type WiseflowItem = WiseflowItemLegacy | WiseflowItemUtgaende

interface ExportMetadata {
  subject: string
  topic: string
  difficulty: string
  language: string
  exportFormat: "legacy" | "utgaende"
  term?: string
  semester?: string
  examType?: string
  courseCode?: string
  additionalTags?: string
  tutorInitials?: string
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

  // Add AI-generated marker
  autoTags.push("AI-generated")

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

  const wiseflowItems: WiseflowItem[] = questions.map((question, index) => {
    const wiseflowQuestion: WiseflowQuestion = {
      data: {
        type: question.type,
        stimulus: question.stimulus,
      },
    }

    // Add options and validation for MCQ and True/False
    if ((question.type === "mcq" || question.type === "true_false") && question.options) {
      wiseflowQuestion.data.options = question.options.map((opt) => ({
        label: opt.label,
        value: opt.value,
      }))

      // Map correct answers to index-based values (A=0, B=1, C=2, D=3)
      if (question.correctAnswer) {
        const validResponseValues = question.correctAnswer.map((label) => {
          const index = question.options!.findIndex((opt) => opt.label === label)
          return index.toString()
        })

        wiseflowQuestion.data.validation = {
          valid_response: {
            value: validResponseValues,
          },
        }
      }
    }

    // Add essay-specific fields
    if (question.type === "longtextV2") {
      wiseflowQuestion.data.max_length = 5000
      wiseflowQuestion.data.formatting_options = ["bold", "italic", "underline"]
      wiseflowQuestion.data.submit_over_limit = false

      if (question.instructorStimulus) {
        wiseflowQuestion.data.instructor_stimulus = question.instructorStimulus
      }
    }

    // Create item with title (use first 100 chars of question or generate from metadata)
    const title =
      question.stimulus.length > 100
        ? question.stimulus.substring(0, 97) + "..."
        : question.stimulus

    const baseItem = {
      title: title || `${metadata.subject} - ${metadata.topic} - Question ${index + 1}`,
      questions: [wiseflowQuestion],
    }

    // Add tags or labels based on export format
    if (metadata.exportFormat === "legacy") {
      return {
        ...baseItem,
        tags: allTags,
      } as WiseflowItemLegacy
    } else {
      // utgaende format
      return {
        ...baseItem,
        labels: generateLabelsFromTags(allTags),
      } as WiseflowItemUtgaende
    }
  })

  // Return formatted JSON with 2-space indentation
  return JSON.stringify(wiseflowItems, null, 2)
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
