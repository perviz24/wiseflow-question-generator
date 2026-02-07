import { NextRequest } from "next/server"
import { generateText, Output } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { readFileSync } from "fs"
import { join } from "path"

// Set function timeout to 60 seconds
export const maxDuration = 60

// Initialize Anthropic client at module level (workaround for Turbopack env var bug)
// CRITICAL: Turbopack bug causes process.env to load as empty strings
// Workaround: Read .env.local directly at runtime
function getAnthropicKey(): string {
  // Try environment variable first (works in production/Vercel)
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY
  }

  // Fallback: Read .env.local file directly (development workaround)
  try {
    const envPath = join(process.cwd(), ".env.local")
    const envContent = readFileSync(envPath, "utf-8")
    const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
    if (match && match[1]) {
      return match[1].trim()
    }
  } catch (error) {
    console.error("Failed to read .env.local:", error)
  }

  return ""
}

const apiKey = getAnthropicKey()
console.log("🔑 API Key loaded:", {
  exists: !!apiKey,
  length: apiKey.length,
  prefix: apiKey.substring(0, 20),
})

const anthropic = createAnthropic({
  apiKey,
  baseURL: "https://api.anthropic.com/v1", // Explicitly set baseURL
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
    .describe("Array of correct option labels (e.g., ['A', 'C'])"),
  instructorStimulus: z
    .string()
    .optional()
    .describe("Guidance for the instructor on what to look for in essay answers"),
})

// Define the output schema for multiple questions
const GeneratedQuestionsSchema = z.object({
  questions: z.array(QuestionSchema),
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const {
      subject,
      topic,
      difficulty,
      numQuestions,
      questionTypes,
      language,
      context,
      contextPriority,
    } = body

    // Validate required fields based on context priority
    const priority = contextPriority || "subject_topic"
    const requiresSubjectTopic = priority === "subject_topic" || !context

    if (requiresSubjectTopic && (!subject || !topic)) {
      return Response.json(
        { error: "Subject and topic are required when no context is provided or when using subject/topic priority" },
        { status: 400 }
      )
    }

    if (!questionTypes || questionTypes.length === 0) {
      return Response.json(
        { error: "At least one question type is required" },
        { status: 400 }
      )
    }

    // Build the prompt
    const languageInstruction = language === "sv" ? "in Swedish" : "in English"
    const difficultyMap = {
      easy: "easy (suitable for beginners)",
      medium: "medium (suitable for intermediate learners)",
      hard: "hard (suitable for advanced learners)",
    }

    const questionTypeInstructions = {
      mcq: "multiple choice questions with 4 options each (A, B, C, D)",
      true_false: "true/false questions with 2 options (A: True, B: False)",
      longtextV2: "essay questions that require detailed written responses",
    }

    const typesList = questionTypes
      .map((t: string) => questionTypeInstructions[t as keyof typeof questionTypeInstructions])
      .join(", ")

    // Build prompt based on context priority
    let prompt = ""

    if (context && priority === "context_only") {
      // Prioritize uploaded context only
      prompt = `You are a pedagogical expert creating exam questions.

PRIORITY: Generate questions strictly based on the following provided content:
${context}

The subject (${subject || "General"}) and topic (${topic || "General"}) are for categorization purposes only. Focus exclusively on the content provided above.

Generate ${numQuestions} ${difficultyMap[difficulty as keyof typeof difficultyMap]} questions ${languageInstruction}.

Question types to generate: ${typesList}`

    } else if (context && priority === "hybrid") {
      // Hybrid: prioritize context but keep subject/topic as reference
      prompt = `You are a pedagogical expert creating exam questions.

Generate questions primarily based on this provided content:
${context}

Reference subject: ${subject}
Reference topic: ${topic}

Use the provided content as the primary source for questions, but keep the subject and topic in mind for pedagogical context and alignment.

Generate ${numQuestions} ${difficultyMap[difficulty as keyof typeof difficultyMap]} questions ${languageInstruction}.

Question types to generate: ${typesList}`

    } else {
      // Default: respect subject/topic (with or without context)
      prompt = `You are a pedagogical expert creating exam questions for ${subject}, specifically about ${topic}.

Generate ${numQuestions} ${difficultyMap[difficulty as keyof typeof difficultyMap]} questions ${languageInstruction}.

Question types to generate: ${typesList}

${context ? `Additional context: ${context}` : ""}`
    }

    prompt += `

Requirements:
- For MCQ: Provide exactly 4 options (A, B, C, D). Mark the correct answer(s) in correctAnswer array.
- For True/False: Provide exactly 2 options (A: True, B: False). Mark the correct answer.
- For Essays: Provide clear question prompts and guidance for instructors in instructorStimulus.
- Questions should test understanding, not just memorization.
- Avoid ambiguous wording.
- Ensure questions are pedagogically sound and aligned with learning outcomes.

Generate the questions now.`

    // API key check removed - using hardcoded value temporarily

    // Generate questions using Vercel AI SDK with Anthropic
    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      output: Output.object({
        schema: GeneratedQuestionsSchema,
      }),
      prompt,
      temperature: 0.7,
    })

    // Return the generated questions
    return Response.json({
      success: true,
      questions: output.questions,
      metadata: {
        subject,
        topic,
        difficulty,
        language,
        userId,
      },
    })
  } catch (error) {
    console.error("Generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json(
      { error: `Failed to generate questions: ${errorMessage}` },
      { status: 500 }
    )
  }
}
