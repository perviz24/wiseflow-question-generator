import { NextRequest, NextResponse } from "next/server"
import { AssemblyAI } from "assemblyai"
import ytdl from "ytdl-core"

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
})

export async function POST(request: NextRequest) {
  try {
    const { url, language, videoFile } = await request.json()

    if (!url && !videoFile) {
      return NextResponse.json(
        { error: "YouTube URL or video file is required" },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        { error: "AssemblyAI API key not configured" },
        { status: 500 }
      )
    }

    let audioUrl: string

    // If YouTube URL is provided, extract audio URL
    if (url) {
      // Validate YouTube URL
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/
      if (!youtubeRegex.test(url)) {
        return NextResponse.json(
          { error: "Invalid YouTube URL. Please provide a direct video link (e.g., youtube.com/watch?v=VIDEO_ID)." },
          { status: 400 }
        )
      }

      // Extract audio stream URL from YouTube using ytdl-core
      try {
        const info = await ytdl.getInfo(url)
        const audioFormats = ytdl.filterFormats(info.formats, "audioonly")

        if (audioFormats.length === 0) {
          return NextResponse.json(
            { error: "No audio stream available for this video." },
            { status: 404 }
          )
        }

        // Get the best quality audio format
        audioUrl = audioFormats[0].url
      } catch (ytdlError) {
        console.error("YouTube audio extraction error:", ytdlError)
        return NextResponse.json(
          { error: "Failed to extract audio from YouTube video. Please check if the video is accessible." },
          { status: 400 }
        )
      }
    } else if (videoFile) {
      // For uploaded video files, we'll need to upload to AssemblyAI first
      // This requires the file to be sent as base64 or FormData
      // For now, return error asking for direct upload implementation
      return NextResponse.json(
        { error: "Video file upload not yet implemented. Please use YouTube URLs for now." },
        { status: 501 }
      )
    } else {
      return NextResponse.json(
        { error: "No valid input provided" },
        { status: 400 }
      )
    }

    // Request transcription from AssemblyAI
    const transcript = await client.transcripts.transcribe({
      audio: audioUrl,
      language_code: language === "sv" ? "sv" : "en",
    })

    // Check for errors in transcription
    if (transcript.status === "error") {
      console.error("AssemblyAI transcription error:", transcript.error)
      return NextResponse.json(
        { error: transcript.error || "Failed to transcribe video" },
        { status: 500 }
      )
    }

    // Check if transcript text is available
    if (!transcript.text) {
      return NextResponse.json(
        { error: "No transcript text generated. The video might not contain speech or audio." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      transcript: transcript.text,
      characterCount: transcript.text.length,
      url: url || "uploaded-file",
      confidence: transcript.confidence,
      audioUrl,
    })
  } catch (error: unknown) {
    console.error("Error extracting video transcript:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
      return NextResponse.json(
        { error: "Request timeout. Video transcription is taking longer than expected." },
        { status: 504 }
      )
    }

    if (errorMessage.includes("invalid") || errorMessage.includes("Invalid")) {
      return NextResponse.json(
        { error: "Invalid video URL or format." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to extract transcript from video" },
      { status: 500 }
    )
  }
}
