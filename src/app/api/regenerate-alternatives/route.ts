import { NextRequest } from "next/server"
import { generateText, Output } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { ANTHROPIC_API_KEY } from "@/lib/env"

// Set function timeout to 60 seconds
export const maxDuration = 60

// Define the schema for regenerated options
const RegeneratedOptionsSchema = z.object({
  options: z.array(
    z.object({
      label: z.string().describe("Option label like A, B, C, D"),
      value: z.string().describe("The option text"),
    })
  ),
  correctAnswer: z
    .array(z.string())
    .describe("Array of correct option labels (e.g., ['A', 'C'])"),
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
      questionType,
      questionText,
      currentOptions,
      subject,
      topic,
      difficulty,
      language,
    } = body

    // Validate required fields
    if (!questionType || !questionText || !subject || !topic) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Build the prompt
    const languageInstruction = language === "sv" ? "in Swedish" : "in English"
    const difficultyMap = {
      easy: "easy (suitable for beginners)",
      medium: "medium (suitable for intermediate learners)",
      hard: "hard (suitable for advanced learners)",
      mixed: "mixed difficulty (vary between easy, medium, and hard)",
    }

    const optionCount = questionType === "true_false" ? 2 : 4
    const optionLabels = questionType === "true_false"
      ? "A and B (True/False)"
      : "A, B, C, and D"

    const currentOptionsText = currentOptions
      ? `\n\nCurrent options (for reference, generate different alternatives):\n${currentOptions.map((opt: any) => `${opt.label}. ${opt.value}`).join("\n")}`
      : ""

    const prompt = `You are a pedagogical expert. Generate NEW alternative answer options for this existing question.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficultyMap[difficulty as keyof typeof difficultyMap]}
Language: ${languageInstruction}

Question: ${questionText}${currentOptionsText}

Requirements:
- Generate ${optionCount} NEW answer options (labels: ${optionLabels})
- ${questionType === "true_false" ? "A must be 'True' (Sann/Sant), B must be 'False' (Falskt)" : "Provide 4 distinct options"}
- Options should be DIFFERENT from the current options shown above
- Only ONE option should be correct (mark it in correctAnswer array)
- Options should test understanding at the ${difficulty} level
- Keep the same question text, only change the answer options
- Ensure options are pedagogically sound and plausible distractors

Generate the new answer options now.`

    // Create Anthropic client at request time using validated env var
    const anthropic = createAnthropic({
      apiKey: ANTHROPIC_API_KEY,
      baseURL: "https://api.anthropic.com/v1",
    })

    // Generate new options using Vercel AI SDK with Anthropic
    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      output: Output.object({
        schema: RegeneratedOptionsSchema,
      }),
      prompt,
      temperature: 0.8, // Slightly higher temperature for more variation
    })

    // Return the regenerated options
    return Response.json({
      success: true,
      options: output.options,
      correctAnswer: output.correctAnswer,
    })
  } catch (error) {
    console.error("Regeneration error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json(
      { error: `Failed to regenerate options: ${errorMessage}` },
      { status: 500 }
    )
  }
}
