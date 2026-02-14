import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateText, Output } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { ANTHROPIC_API_KEY } from "@/lib/env"
import { checkRateLimit } from "@/lib/ratelimit"

// Set function timeout to 60 seconds
export const maxDuration = 60

// Define the schema for a single question — matches main generate route
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
    "rating_scale",
    "choicematrix",
    "clozetext",
    "clozedropdown",
    "orderlist",
    "tokenhighlight",
    "clozeassociation",
    "imageclozeassociationV2",
    "plaintext",
    "formulaessayV2",
    "chemistryessayV2"
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
    .describe("Array of correct option labels (e.g., ['A', 'C'])"),
  instructorStimulus: z
    .string()
    .optional()
    .describe("Grading rubric/guidance for the instructor on what to look for in essay and short answer responses"),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .optional()
    .describe("The difficulty level of THIS specific question. REQUIRED when generating mixed difficulty."),
})

const QuestionsResponseSchema = z.object({
  questions: z.array(QuestionSchema),
})

// Question type instructions — matches main generate route
const questionTypeInstructions: Record<string, string> = {
  mcq: "Multiple Choice (4 options A-D)",
  true_false: "True/False (2 options: A=True, B=False)",
  longtextV2: "Essay (detailed written response, include instructorStimulus with grading rubric)",
  short_answer: "Short Answer (1-3 sentences, include instructorStimulus with expected answer)",
  fill_blank: "Fill-in-the-blank (use [___] for blanks, answers in correctAnswer)",
  multiple_response: "Multiple Response (multiple correct answers possible)",
  matching: "Matching (pairs of terms and definitions in options)",
  ordering: "Ordering/Sequencing (correct order in correctAnswer)",
  hotspot: "Hotspot (describe image/diagram, indicate correct area)",
  rating_scale: "Rating Scale (Likert 1-5)",
  choicematrix: "Choice Matrix (grid: rows=statements, columns=options like Agree/Disagree)",
  clozetext: "Cloze Text (sentences with [___] blanks to type into)",
  clozedropdown: "Cloze Dropdown (sentences with [___] blanks, dropdown options)",
  orderlist: "Order List (items to drag into correct sequence)",
  tokenhighlight: "Token Highlight (passage where students select correct words/phrases)",
  clozeassociation: "Cloze Association (drag-and-drop gaps in text)",
  imageclozeassociationV2: "Image Cloze Association (labeled drop zones on image)",
  plaintext: "Plain Text (simple written answer, include instructorStimulus)",
  formulaessayV2: "Formula Essay (requires mathematical notation, include instructorStimulus)",
  chemistryessayV2: "Chemistry Essay (requires chemical notation, include instructorStimulus)",
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject, topic, difficulty, language, count, questionTypes, additionalContext } = body

    // Check rate limit (100 questions/day per user)
    const rateLimitResponse = await checkRateLimit(userId, language || "sv")
    if (rateLimitResponse) return rateLimitResponse

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

    const questionTypesText = questionTypes
      .map((type: string) => questionTypeInstructions[type] || type)
      .join(", ")

    const languageText = language === "sv" ? "Swedish" : "English"

    const difficultyText = difficulty === "mixed"
      ? "mixed difficulty — generate a balanced mix of easy, medium, and hard questions (roughly 1/3 each). For EACH question, set the difficulty field."
      : `${difficulty} difficulty`

    let prompt = `You are a pedagogical expert creating exam questions for ${subject}, specifically about ${topic}.

Generate exactly ${count} ${difficultyText} question(s) in ${languageText}.

CRITICAL: User specifically selected these question types: ${questionTypesText}
- You MUST generate ONLY the question types listed above
- DO NOT generate MCQ unless specifically requested
- If multiple types are selected, distribute questions evenly across them
- For MCQ: provide 4 options (A, B, C, D) with correct answer in correctAnswer array
- For True/False: provide 2 options (A: True, B: False) with correct answer
- For Essay/Short Answer: provide instructor guidance for grading in instructorStimulus
- For Fill-in-blank/Cloze Text: use [___] for blanks, provide answers in correctAnswer
- For Matching: provide pairs with labels and values in options array
- For Ordering/Order List: list items with correct sequence in correctAnswer
- For Token Highlight: write a passage, list tokens to highlight in correctAnswer
- For Choice Matrix: rows as options (label=statement, value=column header), correctAnswer lists correct column per row
- For Plain Text/Formula Essay/Chemistry Essay: include grading guidance in instructorStimulus
- Questions should test understanding, not just memorization
- Avoid ambiguous wording`

    // Add additional context if provided
    if (additionalContext && additionalContext.trim()) {
      prompt += `\n\nAdditional context to guide question generation:\n${additionalContext.trim()}`
    }

    // Create Anthropic client at request time using validated env var
    const anthropic = createAnthropic({
      apiKey: ANTHROPIC_API_KEY,
      baseURL: "https://api.anthropic.com/v1",
    })

    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      output: Output.object({
        schema: QuestionsResponseSchema,
      }),
      prompt,
      temperature: 0.7,
    })

    return NextResponse.json({ questions: output.questions })
  } catch (error) {
    console.error("Generate more API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate questions" },
      { status: 500 }
    )
  }
}
