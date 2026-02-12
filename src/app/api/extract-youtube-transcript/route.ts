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

    // Specific YouTube transcript error messages
    if (errorMessage.includes("Transcript is disabled")) {
      return NextResponse.json(
        { error: "Transkription är inaktiverad för denna video. Videons ägare har stängt av textning/undertexter. Prova en annan video eller ladda upp videofilen direkt." },
        { status: 422 }
      )
    }

    if (errorMessage.includes("Could not get") || errorMessage.includes("No transcript")) {
      return NextResponse.json(
        { error: "Ingen transkription hittades. Videon saknar textning/undertexter. Prova att ladda upp videofilen direkt istället — AI transkriberar den åt dig." },
        { status: 404 }
      )
    }

    if (errorMessage.includes("not a valid YouTube")) {
      return NextResponse.json(
        { error: "Ogiltig YouTube-URL. Kontrollera att länken är korrekt." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: `YouTube-transkription misslyckades: ${errorMessage}` },
      { status: 500 }
    )
  }
}
