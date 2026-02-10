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

    // Try requested language first, then fallback to English
    const lang = language || "sv"
    let command = `python C:/Users/pervi/tools/yt_transcript.py "${url}" ${lang}`

    let { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
    })

    // If requested language failed and it wasn't English, try English as fallback
    if (stderr && !stdout && lang !== "en") {
      console.log(`No transcript in ${lang}, trying English fallback...`)
      command = `python C:/Users/pervi/tools/yt_transcript.py "${url}" en`
      const fallbackResult = await execAsync(command, {
        timeout: 30000,
      })
      stdout = fallbackResult.stdout
      stderr = fallbackResult.stderr
    }

    if (stderr && !stdout) {
      console.error("Python script error:", stderr)

      // Check if error mentions available languages
      if (stderr.includes("transcripts are available in the following languages")) {
        return NextResponse.json(
          { error: "No captions available in the requested language. The video may not have Swedish subtitles. Try a video with Swedish captions or the system will use English if available." },
          { status: 404 }
        )
      }

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
