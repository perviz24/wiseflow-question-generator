// Export questions to CSV format for easy viewing in Excel/Google Sheets

interface Question {
  type: "mcq" | "true_false" | "longtextV2" | "short_answer" | "fill_blank" | "multiple_response" | "matching" | "ordering" | "hotspot" | "rating_scale"
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

// Escape CSV field (handle quotes and commas)
function escapeCSVField(field: string | undefined): string {
  if (!field) return ""
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function downloadCSV(questions: Question[], metadata: ExportMetadata) {
  // CSV Headers
  const headers = [
    "Type",
    "Question",
    "Options",
    "Correct Answer(s)",
    "Instructor Notes",
    "Subject",
    "Difficulty",
    "Tags",
  ]

  // Build CSV rows
  const rows = questions.map((q) => {
    const type = q.type
    const question = q.stimulus
    const options = q.options?.map((opt) => `${opt.label}. ${opt.value}`).join(" | ") || ""
    const correctAnswer = q.correctAnswer?.join(", ") || ""
    const instructorNotes = q.instructorStimulus || ""
    const subject = metadata.subject
    const difficulty = metadata.difficulty
    const tags = q.tags?.join(", ") || ""

    return [
      escapeCSVField(type),
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

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `wiseflow-questions-${metadata.subject}-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
