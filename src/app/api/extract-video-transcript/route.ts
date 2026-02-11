import { NextRequest, NextResponse } from "next/server"
import { AssemblyAI } from "assemblyai"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"

// Submit a video/audio for transcription via AssemblyAI
// Returns a transcriptId that the client polls via /api/check-transcription
export async function POST(request: NextRequest) {
  try {
    const { storageId, url, language } = await request.json()

    if (!storageId && !url) {
      return NextResponse.json(
        { error: "Either storageId or url is required" },
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

    // Determine the audio URL to send to AssemblyAI
    let audioUrl: string

    if (storageId) {
      // File uploaded to Convex storage — get the public URL
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
      if (!convexUrl) {
        return NextResponse.json(
          { error: "Convex URL not configured" },
          { status: 500 }
        )
      }

      const convex = new ConvexHttpClient(convexUrl)
      const fileUrl = await convex.query(api.fileStorage.getFileUrl, {
        storageId: storageId as Id<"_storage">,
      })

      if (!fileUrl) {
        return NextResponse.json(
          { error: "Could not get file URL from storage" },
          { status: 400 }
        )
      }

      audioUrl = fileUrl
    } else {
      // Direct video URL provided
      audioUrl = url
    }

    // Submit to AssemblyAI (non-blocking — returns immediately with transcript ID)
    const transcript = await client.transcripts.submit({
      audio: audioUrl,
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
      { error: "Failed to submit video for transcription" },
      { status: 500 }
    )
  }
}
