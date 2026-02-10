import { NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { url, language } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      )
    }

    // Validate YouTube URL (must be actual video URL, not search results)
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please provide a direct video link (e.g., youtube.com/watch?v=VIDEO_ID), not a search results page." },
        { status: 400 }
      )
    }

    // Call the Python script
    const lang = language || "sv"
    const command = `python C:/Users/pervi/tools/yt_transcript.py "${url}" ${lang}`

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
    })

    if (stderr && !stdout) {
      console.error("Python script error:", stderr)
      return NextResponse.json(
        { error: "Failed to extract transcript. Please check if the video has captions available." },
        { status: 500 }
      )
    }

    const transcript = stdout.trim()

    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript found. Please ensure the video has captions enabled." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      transcript,
      characterCount: transcript.length,
      url,
    })
  } catch (error: unknown) {
    console.error("Error extracting YouTube transcript:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timeout. Video might be too long or transcript extraction is taking longer than expected." },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: "Failed to extract transcript from YouTube video" },
      { status: 500 }
    )
  }
}
