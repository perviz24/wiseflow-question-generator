import { NextRequest, NextResponse } from "next/server"
import { BUNNY_STREAM_API_KEY, BUNNY_ACCOUNT_API_KEY, BUNNY_VIDEO_LIBRARY_ID, NEXT_PUBLIC_CONVEX_URL } from "@/lib/env"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../convex/_generated/api"

// Bunny.net API base URLs
const BUNNY_CORE_API = "https://api.bunny.net"
const BUNNY_STREAM_API = "https://video.bunnycdn.com"

interface BunnyVideoLibrary {
  Id: number
  Name: string
  PullZoneId: number
  EnableTranscribing: boolean
}

interface BunnyPullZone {
  Id: number
  Hostnames: Array<{
    Value: string
    IsSystemHostname: boolean
  }>
}

interface CaptionModel {
  srclang: string
  label: string
  version: number
}

interface BunnyVideoModel {
  guid: string
  videoLibraryId: number
  title: string
  dateUploaded: string
  views: number
  isPublic: boolean
  length: number
  status: number // 0=Created, 1=Uploaded, 2=Processing, 3=Transcoding, 4=Finished, 5=Error
  availableResolutions: string | null
  captions: CaptionModel[] | null
  hasMP4Fallback: boolean
  collectionId: string | null
}

// Convert VTT format to plain text
function vttToPlainText(vtt: string): string {
  // Remove VTT header
  let text = vtt.replace(/WEBVTT\s*\n/g, "")

  // Remove timestamps (format: 00:00:00.000 --> 00:00:05.000)
  text = text.replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}\s*\n/g, "")

  // Remove cue identifiers (numbers before timestamps)
  text = text.replace(/^\d+\s*\n/gm, "")

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, "")

  // Remove extra whitespace and newlines
  text = text.replace(/\n{3,}/g, "\n\n").trim()

  return text
}

export async function POST(request: NextRequest) {
  try {
    const { url, language, userId } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Check if Bunny.net credentials are configured
    if (!BUNNY_STREAM_API_KEY || !BUNNY_ACCOUNT_API_KEY || !BUNNY_VIDEO_LIBRARY_ID) {
      return NextResponse.json(
        { error: "Bunny.net credentials not configured. Please set BUNNY_STREAM_API_KEY, BUNNY_ACCOUNT_API_KEY and BUNNY_VIDEO_LIBRARY_ID environment variables." },
        { status: 500 }
      )
    }

    // Step 1: Get Video Library details (uses Account API Key)
    const libraryResponse = await fetch(
      `${BUNNY_CORE_API}/videolibrary/${BUNNY_VIDEO_LIBRARY_ID}`,
      {
        headers: {
          "AccessKey": BUNNY_ACCOUNT_API_KEY,
        },
      }
    )

    if (!libraryResponse.ok) {
      console.error("Failed to fetch video library:", await libraryResponse.text())
      return NextResponse.json(
        { error: "Failed to access Bunny.net video library" },
        { status: 500 }
      )
    }

    const library = await libraryResponse.json() as BunnyVideoLibrary

    if (!library.EnableTranscribing) {
      return NextResponse.json(
        { error: "Transcription is not enabled for this video library. Please enable it in Bunny.net dashboard." },
        { status: 500 }
      )
    }

    // Step 1b: Get Pull Zone to find CDN hostname (uses Account API Key)
    const pullZoneResponse = await fetch(
      `${BUNNY_CORE_API}/pullzone/${library.PullZoneId}`,
      {
        headers: {
          "AccessKey": BUNNY_ACCOUNT_API_KEY,
        },
      }
    )

    if (!pullZoneResponse.ok) {
      console.error("Failed to fetch pull zone:", await pullZoneResponse.text())
      return NextResponse.json(
        { error: "Failed to access Bunny.net pull zone" },
        { status: 500 }
      )
    }

    const pullZone = await pullZoneResponse.json() as BunnyPullZone

    // Find the system hostname (CDN domain like xxx.b-cdn.net)
    const systemHostname = pullZone.Hostnames.find(h => h.IsSystemHostname)
    if (!systemHostname) {
      return NextResponse.json(
        { error: "No CDN hostname found for this video library" },
        { status: 500 }
      )
    }

    // Step 2: Create video object
    const createVideoResponse = await fetch(
      `${BUNNY_STREAM_API}/library/${BUNNY_VIDEO_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          "AccessKey": BUNNY_STREAM_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Transcript-${Date.now()}`,
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

    const videoData = await createVideoResponse.json() as BunnyVideoModel
    const videoId = videoData.guid

    // Step 2.5: Create Convex transcription job
    const convex = new ConvexHttpClient(NEXT_PUBLIC_CONVEX_URL)
    await convex.mutation(api.transcriptions.createTranscriptionJob, {
      userId,
      videoUrl: url,
      videoGuid: videoId,
      language: language === "sv" ? "sv" : "en",
    })

    // Step 3: Fetch video from URL
    const fetchResponse = await fetch(
      `${BUNNY_STREAM_API}/library/${BUNNY_VIDEO_LIBRARY_ID}/videos/${videoId}/fetch`,
      {
        method: "POST",
        headers: {
          "AccessKey": BUNNY_STREAM_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
        }),
      }
    )

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text()
      console.error("Bunny.net fetch video error:", errorText)

      // Clean up - delete the created video
      await fetch(
        `${BUNNY_STREAM_API}/library/${BUNNY_VIDEO_LIBRARY_ID}/videos/${videoId}`,
        {
          method: "DELETE",
          headers: {
            "AccessKey": BUNNY_STREAM_API_KEY,
          },
        }
      ).catch(() => {})

      return NextResponse.json(
        { error: "Failed to fetch video from URL. Please check if the URL is accessible and public." },
        { status: 400 }
      )
    }

    // Step 4: Return immediately with job ID - webhook will update when ready
    return NextResponse.json({
      message: "Video transcription started",
      videoGuid: videoId,
      status: "processing",
      note: "Transcription is processing. Check status using the videoGuid or wait for webhook notification."
    })

    // OLD CODE - Removed synchronous polling
    // Step 4: Wait for video to be processed and transcribed
    // let attempts = 0
    // const maxAttempts = 120 // 2 minutes max (video processing + transcription takes time)
    // let videoInfo: BunnyVideoModel | null = null

    /* OLD SYNCHRONOUS CODE - Now handled by webhook
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const statusResponse = await fetch(...)
      // ... rest of polling logic
    }
    if (!videoInfo || !videoInfo.captions || videoInfo.captions.length === 0) { ... }
    const targetLanguage = language === "sv" ? "sv" : "en"
    const caption = videoInfo.captions.find(c => c.srclang === targetLanguage) || videoInfo.captions[0]
    const captionUrl = `https://${systemHostname.Value}/${videoId}/captions/${caption.srclang}.vtt`
    const captionResponse = await fetch(captionUrl)
    if (!captionResponse.ok) { ... }
    const vttContent = await captionResponse.text()
    const plainTextTranscript = vttToPlainText(vttContent)
    await fetch(...DELETE video...)
    return NextResponse.json({ transcript, characterCount, url, videoId, language })
    END OLD CODE */
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
