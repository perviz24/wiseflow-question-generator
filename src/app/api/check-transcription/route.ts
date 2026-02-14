import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { AssemblyAI } from "assemblyai"

// Poll transcription status by transcriptId
// Returns status + transcript text when completed
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transcriptId = request.nextUrl.searchParams.get("id")

    if (!transcriptId) {
      return NextResponse.json(
        { error: "Transcript ID is required" },
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
    const transcript = await client.transcripts.get(transcriptId)

    if (transcript.status === "error") {
      return NextResponse.json({
        status: "error",
        error: transcript.error || "Transcription failed",
      })
    }

    if (transcript.status === "completed") {
      const text = transcript.text || ""
      return NextResponse.json({
        status: "completed",
        transcript: text,
        characterCount: text.length,
      })
    }

    // Still processing (queued or processing)
    return NextResponse.json({
      status: transcript.status, // "queued" | "processing"
    })
  } catch (error: unknown) {
    console.error("Error checking transcription status:", error)
    return NextResponse.json(
      { error: "Failed to check transcription status" },
      { status: 500 }
    )
  }
}
