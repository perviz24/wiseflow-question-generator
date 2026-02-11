import { NextRequest, NextResponse } from "next/server"
import { AssemblyAI } from "assemblyai"

// Submit a video/audio for transcription via AssemblyAI
// Returns a transcriptId that the client polls via /api/check-transcription
export async function POST(request: NextRequest) {
  try {
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
        { error: "Request timeout. Please try again." },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: `Transcription failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
