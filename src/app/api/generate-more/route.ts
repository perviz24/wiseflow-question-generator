import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateObject } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { readFileSync } from "fs"
import { join } from "path"

// Set function timeout to 60 seconds
export const maxDuration = 60

// Turbopack workaround: read API key from .env.local if env var is empty
function getAnthropicKey(): string {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY
  }
  try {
    const envPath = join(process.cwd(), ".env.local")
    const envContent = readFileSync(envPath, "utf-8")
    const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
    if (match && match[1]) {
      return match[1].trim()
    }
  } catch {
    // .env.local not found (production) — env var should be set
  }
  return ""
}

const anthropic = createAnthropic({
  apiKey: getAnthropicKey(),
  baseURL: "https://api.anthropic.com/v1",
})

// Define the schema for a single question
const QuestionSchema = z.object({
  type: z.enum([
    "mcq",
    "true_false",
    "longtextV2",
    "short_answer",
    "fill_blank",
    "multiple_response",
    "matching",
    "ordering",
    "hotspot",
    "rating_scale"
  ]),
  stimulus: z.string().describe("The question text"),
  options: z
    .array(
      z.object({
        label: z.string().describe("Option label like A, B, C, D"),
        value: z.string().describe("The option text"),
      })
    )
    .optional()
    .describe("Answer options for MCQ and True/False questions"),
  correctAnswer: z
    .array(z.string())
    .optional()
    .describe("Correct answer labels like ['A'] or ['A', 'B']"),
  instructorStimulus: z
    .string()
    .optional()
    .describe("Instructor guidance for essay questions"),
})

const QuestionsResponseSchema = z.object({
  questions: z.array(QuestionSchema),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject, topic, difficulty, language, count, questionTypes, additionalContext } = body

    // Validation
    if (!subject || !topic || !difficulty || !language || !count || !questionTypes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Count must be between 1 and 20" },
        { status: 400 }
      )
    }

    if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
      return NextResponse.json(
        { error: "At least one question type must be selected" },
        { status: 400 }
      )
    }

    // Build the prompt
    const questionTypeMap: Record<string, string> = {
      mcq: "Multiple Choice (4 options A-D)",
      true_false: "True/False (2 options)",
      longtextV2: "Essay (with instructor guidance)",
      short_answer: "Short Answer (1-3 sentences)",
      fill_blank: "Fill-in-the-blank (with [___] placeholders)",
      multiple_response: "Multiple Response (multiple correct answers)",
      matching: "Matching (pairs of terms and definitions)",
      ordering: "Ordering/Sequencing (items in correct order)",
      hotspot: "Hotspot (image-based area selection)",
      rating_scale: "Rating Scale (Likert 1-5)",
    }

    const questionTypesText = questionTypes
      .map((type: string) => questionTypeMap[type] || type)
      .join(", ")

    const languageText = language === "sv" ? "Swedish" : "English"

    let prompt = `You are a pedagogical expert creating exam questions for ${subject}, specifically about ${topic}.

Generate exactly ${count} ${difficulty} difficulty question(s) in ${languageText}.

CRITICAL: User specifically selected these question types: ${questionTypesText}
- You MUST generate ONLY the question types listed above
- DO NOT generate MCQ unless specifically requested
- If multiple types are selected, distribute questions evenly across them
- For Multiple Choice: provide 4 options (A, B, C, D) with correct answer in correctAnswer array
- For True/False: provide 2 options (A: True, B: False) with correct answer
- For Essay: provide instructor guidance for grading in instructorStimulus
- For Hotspot: describe the image/diagram and indicate correct area(s)
- For Matching: provide pairs with labels and values in options array
- For Ordering: list items with correct sequence in correctAnswer
- For Fill-in-blank: use [___] for blanks, provide answers in correctAnswer`

    // Add additional context if provided
    if (additionalContext && additionalContext.trim()) {
      prompt += `\n\nAdditional context to guide question generation:\n${additionalContext.trim()}`
    }

    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: QuestionsResponseSchema,
      prompt,
      temperature: 0.7,
    })

    return NextResponse.json({ questions: result.object.questions })
  } catch (error) {
    console.error("Generate more API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate questions" },
      { status: 500 }
    )
  }
}
