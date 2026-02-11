import { NextRequest, NextResponse } from "next/server"
import { BUNNY_API_KEY, BUNNY_VIDEO_LIBRARY_ID } from "@/lib/env"

// Bunny.net API base URLs
const BUNNY_API_BASE = "https://video.bunnycdn.com"
const BUNNY_STREAM_BASE = "https://video.bunnycdn.com/library"

interface BunnyVideo {
  guid: string
  videoLibraryId: number
  title: string
  availableResolutions: string
  transcriptUrl?: string
  hasMP4Fallback: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { url, language, videoFile } = await request.json()

    if (!url && !videoFile) {
      return NextResponse.json(
        { error: "Video URL or video file is required" },
        { status: 400 }
      )
    }

    // Check if Bunny.net credentials are configured
    if (!BUNNY_API_KEY || !BUNNY_VIDEO_LIBRARY_ID) {
      return NextResponse.json(
        { error: "Bunny.net credentials not configured. Please set BUNNY_API_KEY and BUNNY_VIDEO_LIBRARY_ID environment variables." },
        { status: 500 }
      )
    }

    let videoId: string

    // Step 1: Upload video to Bunny Stream
    if (url) {
      // Fetch video from URL
      const createVideoResponse = await fetch(
        `${BUNNY_STREAM_BASE}/${BUNNY_VIDEO_LIBRARY_ID}/videos`,
        {
          method: "POST",
          headers: {
            "AccessKey": BUNNY_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `Transcript-${Date.now()}`,
            collectionId: "", // Optional: specify collection if needed
          }),
        }
      )

      if (!createVideoResponse.ok) {
        const errorText = await createVideoResponse.text()
        console.error("Bunny.net create video error:", errorText)
        return NextResponse.json(
          { error: "Failed to create video in Bunny Stream" },
          { status: 500 }
        )
      }

      const videoData = await createVideoResponse.json() as BunnyVideo
      videoId = videoData.guid

      // Fetch video from URL
      const fetchResponse = await fetch(
        `${BUNNY_STREAM_BASE}/${BUNNY_VIDEO_LIBRARY_ID}/videos/${videoId}/fetch`,
        {
          method: "POST",
          headers: {
            "AccessKey": BUNNY_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url,
            headers: {},
          }),
        }
      )

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text()
        console.error("Bunny.net fetch video error:", errorText)
        return NextResponse.json(
          { error: "Failed to fetch video from URL. Please check if the URL is accessible." },
          { status: 400 }
        )
      }

      // Wait for video to be processed (polling)
      let attempts = 0
      const maxAttempts = 30 // 30 seconds max
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

        const statusResponse = await fetch(
          `${BUNNY_STREAM_BASE}/${BUNNY_VIDEO_LIBRARY_ID}/videos/${videoId}`,
          {
            method: "GET",
            headers: {
              "AccessKey": BUNNY_API_KEY,
            },
          }
        )

        if (statusResponse.ok) {
          const statusData = await statusResponse.json() as BunnyVideo
          if (statusData.availableResolutions && statusData.availableResolutions.length > 0) {
            break // Video is processed
          }
        }

        attempts++
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: "Video processing timeout. Please try again later." },
          { status: 504 }
        )
      }
    } else if (videoFile) {
      // Direct file upload to Bunny Stream
      return NextResponse.json(
        { error: "Video file upload not yet implemented. Please use video URLs for now." },
        { status: 501 }
      )
    } else {
      return NextResponse.json(
        { error: "No valid input provided" },
        { status: 400 }
      )
    }

    // Step 2: Request transcription
    const transcribeResponse = await fetch(
      `${BUNNY_STREAM_BASE}/${BUNNY_VIDEO_LIBRARY_ID}/videos/${videoId}/transcribe`,
      {
        method: "POST",
        headers: {
          "AccessKey": BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language === "sv" ? "sv" : "en",
        }),
      }
    )

    if (!transcribeResponse.ok) {
      const errorText = await transcribeResponse.text()
      console.error("Bunny.net transcribe error:", errorText)
      return NextResponse.json(
        { error: "Failed to start video transcription" },
        { status: 500 }
      )
    }

    // Wait for transcription to complete (polling)
    let transcriptAttempts = 0
    const maxTranscriptAttempts = 60 // 60 seconds max
    let transcriptUrl: string | undefined

    while (transcriptAttempts < maxTranscriptAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const videoInfoResponse = await fetch(
        `${BUNNY_STREAM_BASE}/${BUNNY_VIDEO_LIBRARY_ID}/videos/${videoId}`,
        {
          method: "GET",
          headers: {
            "AccessKey": BUNNY_API_KEY,
          },
        }
      )

      if (videoInfoResponse.ok) {
        const videoInfo = await videoInfoResponse.json() as BunnyVideo
        if (videoInfo.transcriptUrl) {
          transcriptUrl = videoInfo.transcriptUrl
          break
        }
      }

      transcriptAttempts++
    }

    if (!transcriptUrl) {
      return NextResponse.json(
        { error: "Transcription timeout. The video might be too long or contain no speech." },
        { status: 504 }
      )
    }

    // Step 3: Fetch transcript content
    const transcriptResponse = await fetch(transcriptUrl)
    if (!transcriptResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch transcript content" },
        { status: 500 }
      )
    }

    const transcriptText = await transcriptResponse.text()

    // Step 4: Clean up - delete video from Bunny Stream (optional, to save storage)
    await fetch(
      `${BUNNY_STREAM_BASE}/${BUNNY_VIDEO_LIBRARY_ID}/videos/${videoId}`,
      {
        method: "DELETE",
        headers: {
          "AccessKey": BUNNY_API_KEY,
        },
      }
    ).catch(err => console.error("Failed to delete video from Bunny:", err))

    return NextResponse.json({
      transcript: transcriptText,
      characterCount: transcriptText.length,
      url: url || "uploaded-file",
      videoId,
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
