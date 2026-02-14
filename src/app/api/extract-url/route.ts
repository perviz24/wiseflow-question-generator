import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { checkRateLimit } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limit: shares the 100/day pool with AI generation
    const rateLimitResponse = await checkRateLimit(userId)
    if (rateLimitResponse) return rateLimitResponse

    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // Use simple fetch for now (can be replaced with Firecrawl later)
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TentaGenBot/1.0)",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      )
    }

    const html = await response.text()

    // Basic HTML to text conversion (strip tags)
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: "No text content found at URL" },
        { status: 400 }
      )
    }

    // Limit to 50,000 characters
    const content = text.slice(0, 50000)

    return NextResponse.json({ content, length: content.length })
  } catch (error) {
    console.error("URL extraction error:", error)
    return NextResponse.json(
      { error: "Failed to extract content from URL" },
      { status: 500 }
    )
  }
}
