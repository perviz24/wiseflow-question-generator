// Export questions to CSV format for easy viewing in Excel/Google Sheets

interface Question {
  type: string // Question type ID from question-types.ts registry
  stimulus: string
  options?: Array<{
    label: string
    value: string
  }>
  correctAnswer?: string[]
  instructorStimulus?: string
  title?: string
  subject?: string
  difficulty?: string
  tags?: string[]
}

interface ExportMetadata {
  subject: string
  topic: string
  difficulty: string
  language: string
  includeAITag?: boolean
}

// Readable type names (Swedish default, English fallback)
function getTypeDisplayName(type: string, lang: string): string {
  const names: Record<string, [string, string]> = {
    mcq: ["Flervalsfråga", "MCQ"],
    true_false: ["Sant/Falskt", "True/False"],
    longtextV2: ["Essä", "Essay"],
    short_answer: ["Kort svar", "Short Answer"],
    fill_blank: ["Ifyllnad", "Fill in the Blank"],
    multiple_response: ["Flera rätt", "Multiple Response"],
    matching: ["Matchning", "Matching"],
    ordering: ["Ordningsföljd", "Ordering"],
    hotspot: ["Bildmarkering", "Image Hotspot"],
    rating_scale: ["Betygsskala", "Rating Scale"],
  }
  const entry = names[type]
  return entry ? (lang === "sv" ? entry[0] : entry[1]) : type
}

// Readable difficulty names
function getDifficultyDisplayName(diff: string, lang: string): string {
  const names: Record<string, [string, string]> = {
    easy: ["Lätt", "Easy"],
    medium: ["Medium", "Medium"],
    hard: ["Svår", "Hard"],
  }
  const entry = names[diff]
  return entry ? (lang === "sv" ? entry[0] : entry[1]) : diff
}

// Strip HTML tags and decode entities for clean text in CSV
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Escape CSV field (handle quotes and commas)
function escapeCSVField(field: string | undefined): string {
  if (!field) return ""
  // If field contains comma, quote, newline, or semicolon → wrap in quotes
  if (field.includes(",") || field.includes('"') || field.includes("\n") || field.includes(";")) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function downloadCSV(questions: Question[], metadata: ExportMetadata) {
  const isSv = metadata.language === "sv"

  // CSV Headers (localized)
  const headers = isSv
    ? ["Typ", "Titel", "Fråga", "Svarsalternativ", "Rätt svar", "Lärarnot", "Ämne", "Svårighetsgrad", "Taggar"]
    : ["Type", "Title", "Question", "Options", "Correct Answer(s)", "Instructor Notes", "Subject", "Difficulty", "Tags"]

  // Build CSV rows with clean text
  const rows = questions.map((q) => {
    const type = getTypeDisplayName(q.type, metadata.language)
    const title = q.title || ""
    const question = stripHtml(q.stimulus)
    const options = q.options?.map((opt) => `${opt.label}. ${opt.value}`).join(" | ") || ""
    const correctAnswer = q.correctAnswer?.join(", ") || ""
    const instructorNotes = q.instructorStimulus ? stripHtml(q.instructorStimulus) : ""
    const subject = metadata.subject
    const difficulty = getDifficultyDisplayName(metadata.difficulty, metadata.language)
    const tags = q.tags?.join(", ") || ""

    return [
      escapeCSVField(type),
      escapeCSVField(title),
      escapeCSVField(question),
      escapeCSVField(options),
      escapeCSVField(correctAnswer),
      escapeCSVField(instructorNotes),
      escapeCSVField(subject),
      escapeCSVField(difficulty),
      escapeCSVField(tags),
    ].join(",")
  })

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows].join("\n")

  // UTF-8 BOM + content — BOM is required for Excel to detect UTF-8 encoding (Swedish ÅÄÖ)
  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  const timestamp = new Date().toISOString().split("T")[0]
  link.download = `tentagen-${metadata.subject.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
