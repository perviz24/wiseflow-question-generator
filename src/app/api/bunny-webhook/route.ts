import { NextRequest, NextResponse } from "next/server"
import { BUNNY_WEBHOOK_SECRET, BUNNY_STREAM_API_KEY, BUNNY_ACCOUNT_API_KEY, BUNNY_VIDEO_LIBRARY_ID, NEXT_PUBLIC_CONVEX_URL } from "@/lib/env"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"
import crypto from "crypto"

const BUNNY_CORE_API = "https://api.bunny.net"
const BUNNY_STREAM_API = "https://video.bunnycdn.com"

interface BunnyWebhookPayload {
  VideoGuid: string
  VideoLibraryId: number
  Status: number
  // Add other fields as needed
}

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature || !BUNNY_WEBHOOK_SECRET) {
    return false
  }

  const hmac = crypto.createHmac("sha256", BUNNY_WEBHOOK_SECRET)
  hmac.update(payload)
  const expectedSignature = hmac.digest("hex")

  return signature === expectedSignature
}

// Convert VTT format to plain text
function vttToPlainText(vtt: string): string {
  let text = vtt.replace(/WEBVTT\s*\n/g, "")
  text = text.replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}\s*\n/g, "")
  text = text.replace(/^\d+\s*\n/gm, "")
  text = text.replace(/<[^>]*>/g, "")
  text = text.replace(/\n{3,}/g, "\n\n").trim()
  return text
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("X-Bunny-Signature")

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("Invalid webhook signature")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const payload = JSON.parse(rawBody) as BunnyWebhookPayload

    // Only process if video is finished encoding (Status 4)
    if (payload.Status !== 4) {
      console.log(`Video ${payload.VideoGuid} not ready yet, status: ${payload.Status}`)
      return NextResponse.json({ message: "Video not ready" })
    }

    // Fetch video details to get captions
    const videoResponse = await fetch(
      `${BUNNY_STREAM_API}/library/${BUNNY_VIDEO_LIBRARY_ID}/videos/${payload.VideoGuid}`,
      {
        headers: {
          "AccessKey": BUNNY_STREAM_API_KEY,
        },
      }
    )

    if (!videoResponse.ok) {
      console.error("Failed to fetch video details")
      return NextResponse.json(
        { error: "Failed to fetch video" },
        { status: 500 }
      )
    }

    const videoData = await videoResponse.json()

    // Check if captions are available
    if (!videoData.captions || videoData.captions.length === 0) {
      console.log(`No captions available for video ${payload.VideoGuid}`)

      // Update Convex job as failed
      const convex = new ConvexHttpClient(NEXT_PUBLIC_CONVEX_URL)
      await convex.mutation(api.transcriptions.updateTranscriptionJob, {
        videoGuid: payload.VideoGuid,
        status: "failed",
        errorMessage: "No captions generated. Video may contain no speech or transcription failed.",
      })

      return NextResponse.json({ message: "No captions available" })
    }

    // Step 1: Get Pull Zone hostname to construct caption URL
    const libraryResponse = await fetch(
      `${BUNNY_CORE_API}/videolibrary/${BUNNY_VIDEO_LIBRARY_ID}`,
      {
        headers: {
          "AccessKey": BUNNY_ACCOUNT_API_KEY,
        },
      }
    )

    if (!libraryResponse.ok) {
      console.error("Failed to fetch video library")
      return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 })
    }

    const library = await libraryResponse.json()

    const pullZoneResponse = await fetch(
      `${BUNNY_CORE_API}/pullzone/${library.PullZoneId}`,
      {
        headers: {
          "AccessKey": BUNNY_ACCOUNT_API_KEY,
        },
      }
    )

    if (!pullZoneResponse.ok) {
      console.error("Failed to fetch pull zone")
      return NextResponse.json({ error: "Failed to fetch pull zone" }, { status: 500 })
    }

    const pullZone = await pullZoneResponse.json()
    const systemHostname = pullZone.Hostnames.find((h: { IsSystemHostname: boolean }) => h.IsSystemHostname)

    if (!systemHostname) {
      console.error("No CDN hostname found")
      return NextResponse.json({ error: "No CDN hostname" }, { status: 500 })
    }

    // Step 2: Download caption file
    const caption = videoData.captions[0] // Use first available caption
    const captionUrl = `https://${systemHostname.Value}/${payload.VideoGuid}/captions/${caption.srclang}.vtt`

    const captionResponse = await fetch(captionUrl)
    if (!captionResponse.ok) {
      console.error("Failed to fetch caption file")

      // Update Convex job as failed
      const convex = new ConvexHttpClient(NEXT_PUBLIC_CONVEX_URL)
      await convex.mutation(api.transcriptions.updateTranscriptionJob, {
        videoGuid: payload.VideoGuid,
        status: "failed",
        errorMessage: "Failed to download caption file from CDN",
      })

      return NextResponse.json({ error: "Failed to download caption" }, { status: 500 })
    }

    // Step 3: Convert VTT to plain text
    const vttContent = await captionResponse.text()
    const plainTextTranscript = vttToPlainText(vttContent)

    // Step 4: Update Convex database with completed transcript
    const convex = new ConvexHttpClient(NEXT_PUBLIC_CONVEX_URL)
    await convex.mutation(api.transcriptions.updateTranscriptionJob, {
      videoGuid: payload.VideoGuid,
      status: "completed",
      transcript: plainTextTranscript,
      characterCount: plainTextTranscript.length,
    })

    // Step 5: Clean up - delete video from Bunny Stream to save storage
    await fetch(
      `${BUNNY_STREAM_API}/library/${BUNNY_VIDEO_LIBRARY_ID}/videos/${payload.VideoGuid}`,
      {
        method: "DELETE",
        headers: {
          "AccessKey": BUNNY_STREAM_API_KEY,
        },
      }
    ).catch(err => console.error("Failed to delete video from Bunny:", err))

    console.log(`Webhook processed successfully for video ${payload.VideoGuid}`)

    return NextResponse.json({
      message: "Webhook processed successfully",
      videoGuid: payload.VideoGuid,
      transcriptLength: plainTextTranscript.length,
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
