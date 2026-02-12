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

    const questionTypeInstructions: Record<string, string> = {
      mcq: "multiple choice questions with 4 options each (A, B, C, D)",
      true_false: "true/false questions with 2 options (A: True, B: False)",
      longtextV2: "essay questions that require detailed written responses",
      short_answer: "short answer questions requiring 1-3 sentence responses",
      fill_blank: "fill-in-the-blank questions with gaps in sentences to complete",
      multiple_response: "multiple response questions with several options where multiple can be correct",
      matching: "matching questions pairing terms with definitions or concepts",
      ordering: "ordering/sequencing questions where items must be arranged in correct order",
      hotspot: "image-based hotspot questions requiring selection of correct area on diagram/image",
      rating_scale: "rating scale questions using Likert-style 1-5 scale for evaluation",
      choicematrix: "choice matrix questions with a grid of rows (statements) and columns (options like Agree/Disagree). Provide rows in options (label=row, value=column header). correctAnswer lists the correct column for each row",
      clozetext: "cloze text questions with sentences containing typed blanks. Write the sentence with [___] for each blank. Provide correct fill-in answers in correctAnswer array",
      clozedropdown: "cloze dropdown questions with inline dropdown menus in sentences. Write the sentence with [___] for blanks. Provide dropdown options in the options array and correct selections in correctAnswer",
      orderlist: "ordered list questions where items must be dragged into correct sequence. Provide items in options array. correctAnswer lists item labels in the correct order",
      tokenhighlight: "token highlight questions where students select correct words/phrases from a passage. Provide the passage in stimulus. List the tokens that should be highlighted in correctAnswer",
      clozeassociation: "cloze association questions with drag-and-drop gaps in text. Write sentence with [___] for gaps. Provide draggable answer options in options. correctAnswer maps each gap to its answer",
      imageclozeassociationV2: "image cloze association questions with labeled drop zones on an image. Describe the image/diagram in stimulus. Provide drop zone labels and draggable options. correctAnswer maps zones to answers",
      plaintext: "plain text response questions requiring a simple written answer without formatting. Provide instructorStimulus with grading guidance",
      formulaessayV2: "formula essay questions requiring mathematical notation in responses. The question should require math formulas, equations, or expressions. Provide instructorStimulus with expected mathematical content",
      chemistryessayV2: "chemistry essay questions requiring chemical notation in responses. The question should involve chemical formulas, reactions, or molecular structures. Provide instructorStimulus with expected chemical content",
    }

    const typesList = questionTypes
      .map((t: string) => questionTypeInstructions[t] || t)
      .join(", ")

    // Build prompt based on context priority
    let prompt = ""

    if (context && priority === "context_only") {
      // Prioritize uploaded context only - completely omit subject/topic to avoid AI bias
      prompt = `You are a pedagogical expert creating exam questions.

PRIORITY: Generate questions strictly and exclusively based on the following provided content:
${context}

Do not infer, assume, or create questions about any subject or topic not present in the content above. Use ONLY what is provided.

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
- IMPORTANT: Distribute questions EVENLY across all selected question types. DO NOT favor MCQ or older formats.
- If multiple types selected, ensure balanced representation (e.g., 10 questions with 3 types = 3-4 of each type).
- For MCQ: Provide exactly 4 options (A, B, C, D). Mark the correct answer(s) in correctAnswer array.
- For True/False: Provide exactly 2 options (A: True, B: False). Mark the correct answer.
- For Essays: Provide clear question prompts and guidance for instructors in instructorStimulus.
- For Hotspot: Describe the image/diagram and indicate which area(s) should be selected.
- For Matching: Provide pairs in options array (left side labels, right side values).
- For Ordering: List items that need sequencing with correct order in correctAnswer.
- For Fill-in-blank: Use [___] to indicate blanks, provide answers in correctAnswer array.
- For Choice Matrix: Create a grid with row statements and column options. Options array has labels as row statements and values as column headers. correctAnswer lists the correct column per row.
- For Cloze Text: Write sentences with [___] blanks to type into. correctAnswer has the expected typed answers.
- For Cloze Dropdown: Write sentences with [___] blanks. Options array provides dropdown choices per gap. correctAnswer has the correct selections.
- For Order List: Provide items to be reordered. Options array has the items. correctAnswer lists labels in correct order.
- For Token Highlight: Write a passage in stimulus. correctAnswer lists words/phrases students must highlight.
- For Cloze Association: Write text with [___] gaps. Options array has draggable answers. correctAnswer maps gaps to correct answers.
- For Image Cloze Association: Describe the image in stimulus. Provide labeled drop zones and draggable options. correctAnswer maps zones to answers.
- For Plain Text: Simple open-ended questions. Provide grading rubric in instructorStimulus.
- For Formula Essay: Questions requiring mathematical notation. Provide expected math content in instructorStimulus.
- For Chemistry Essay: Questions requiring chemical notation. Provide expected chemical content in instructorStimulus.
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
