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

interface WiseflowItem {
  title: string
  questions: WiseflowQuestion[]
}

export function exportToWiseflowJSON(
  questions: Question[],
  metadata: {
    subject: string
    topic: string
    difficulty: string
    language: string
  }
): string {
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

    return {
      title: title || `${metadata.subject} - ${metadata.topic} - Question ${index + 1}`,
      questions: [wiseflowQuestion],
    }
  })

  // Return formatted JSON with 2-space indentation
  return JSON.stringify(wiseflowItems, null, 2)
}

export function downloadWiseflowJSON(
  questions: Question[],
  metadata: {
    subject: string
    topic: string
    difficulty: string
    language: string
  }
) {
  const jsonString = exportToWiseflowJSON(questions, metadata)

  // Create blob and download
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const filename = `wiseflow_${metadata.subject.toLowerCase().replace(/\s+/g, "_")}_${timestamp}.json`

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
