import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateObject } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Define the schema for a single question
const QuestionSchema = z.object({
  type: z.enum(["mcq", "true_false", "longtextV2"]),
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
    const { subject, topic, difficulty, language, count, questionTypes } = body

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
    const questionTypesText = questionTypes
      .map((type) => {
        if (type === "mcq") return "Multiple Choice"
        if (type === "true_false") return "True/False"
        if (type === "longtextV2") return "Essay"
        return type
      })
      .join(", ")

    const languageText = language === "sv" ? "Swedish" : "English"

    const prompt = `You are a pedagogical expert creating exam questions for ${subject}, specifically about ${topic}.

Generate exactly ${count} ${difficulty} difficulty question(s) in ${languageText}.

Question types to generate: ${questionTypesText}
- If multiple types are selected, distribute questions evenly across them
- For Multiple Choice: provide 4 options (A, B, C, D) with 1 correct answer
- For True/False: provide 2 options (A, B) representing True and False
- For Essay: provide instructor guidance for grading`

    const result = await generateObject({
      model: anthropic("claude-3-7-sonnet-20250219"),
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
