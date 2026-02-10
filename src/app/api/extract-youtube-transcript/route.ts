import { NextRequest, NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"

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

    // Extract video ID from URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: "Could not extract video ID from URL" },
        { status: 400 }
      )
    }

    // Try requested language first, then fallback to English
    const lang = language || "sv"

    let transcriptData
    try {
      // Try to fetch transcript in requested language
      transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: lang,
      })
    } catch (error) {
      // If requested language failed and it wasn't English, try English as fallback
      if (lang !== "en") {
        console.log(`No transcript in ${lang}, trying English fallback...`)
        try {
          transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: "en",
          })
        } catch (fallbackError) {
          throw fallbackError
        }
      } else {
        throw error
      }
    }

    if (!transcriptData || transcriptData.length === 0) {
      return NextResponse.json(
        { error: "No transcript found. Please ensure the video has captions enabled." },
        { status: 404 }
      )
    }

    // Combine all transcript segments into a single text
    const transcript = transcriptData.map(item => item.text).join(" ")

    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript content found. Please ensure the video has captions available." },
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

    // Check for specific error messages from youtube-transcript
    if (errorMessage.includes("Could not find captions") || errorMessage.includes("Transcript is disabled")) {
      return NextResponse.json(
        { error: "No captions available for this video. Please ensure the video has captions enabled." },
        { status: 404 }
      )
    }

    if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
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

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([^&\n?#]+)$/, // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}
