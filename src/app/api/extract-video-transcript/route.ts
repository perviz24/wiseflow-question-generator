import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { AssemblyAI } from "assemblyai"

// Submit a video/audio for transcription via AssemblyAI
// Returns a transcriptId that the client polls via /api/check-transcription
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { url, language } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "Audio/video URL is required" },
        { status: 400 }
      )
    }

    // Read directly to avoid env.ts eager validation of all vars at build time
    const assemblyKey = process.env.ASSEMBLYAI_API_KEY
    if (!assemblyKey) {
      return NextResponse.json(
        { error: "AssemblyAI API key not configured" },
        { status: 500 }
      )
    }

    const client = new AssemblyAI({ apiKey: assemblyKey })

    // Submit to AssemblyAI (non-blocking — returns immediately with transcript ID)
    // speech_models is required by the API — use universal-2 for 99-language support (incl. Swedish)
    // universal-3-pro only supports 6 languages so we fall back to universal-2
    const transcript = await client.transcripts.submit({
      audio: url,
      speech_models: ["universal-2"],
      language_code: language === "sv" ? "sv" : "en",
    })

    return NextResponse.json({
      transcriptId: transcript.id,
      status: transcript.status, // "queued" or "processing"
    })
  } catch (error: unknown) {
    console.error("Error submitting video for transcription:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
      return NextResponse.json(
        { error: "Begäran tog för lång tid. Försök igen." },
        { status: 504 }
      )
    }

    if (errorMessage.includes("text/html") || errorMessage.includes("HTML document")) {
      return NextResponse.json(
        { error: "Videons URL leder till en webbsida, inte en direktlänk till video/ljud. Plattformar som Vimeo delar inte direktlänkar. Prova istället att ladda ner videon och ladda upp filen direkt." },
        { status: 422 }
      )
    }

    if (errorMessage.includes("does not appear to contain audio")) {
      return NextResponse.json(
        { error: "Filen innehåller inget ljud. Kontrollera att det är en riktig video/ljudfil, eller ladda ner videon från webbplatsen och ladda upp den direkt." },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: `Transkription misslyckades: ${errorMessage}` },
      { status: 500 }
    )
  }
}
