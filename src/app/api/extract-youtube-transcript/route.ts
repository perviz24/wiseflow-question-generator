import { NextRequest, NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"

// Extract transcript from YouTube videos using youtube-transcript package
// AssemblyAI cannot fetch YouTube URLs directly (gets HTML instead of audio)
export async function POST(request: NextRequest) {
  try {
    const { url, language } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      )
    }

    // Fetch transcript from YouTube
    const transcriptItems = await YoutubeTranscript.fetchTranscript(url, {
      lang: language === "sv" ? "sv" : "en",
    })

    if (!transcriptItems || transcriptItems.length === 0) {
      return NextResponse.json(
        { error: "No transcript found for this video. The video may not have captions available." },
        { status: 404 }
      )
    }

    // Combine all transcript segments into one text
    const fullTranscript = transcriptItems
      .map((item) => item.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()

    return NextResponse.json({
      transcript: fullTranscript,
      characterCount: fullTranscript.length,
    })
  } catch (error: unknown) {
    console.error("Error extracting YouTube transcript:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    // Common YouTube transcript errors
    if (errorMessage.includes("Could not get")) {
      return NextResponse.json(
        { error: "Could not retrieve transcript. The video may not have captions enabled." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: `YouTube transcript extraction failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
