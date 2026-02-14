// Rate limiting utility using Upstash Redis
// Protects expensive API routes (AI generation, video transcription)
// Limit: 100 questions per day per user

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

// Lazy-initialize to avoid errors when env vars aren't set yet (build time)
let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Rate limiting disabled — env vars not configured
    return null
  }

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    // 100 requests per 24-hour sliding window
    limiter: Ratelimit.slidingWindow(100, "1 d"),
    analytics: true,
    prefix: "tentagen:ratelimit",
  })

  return ratelimit
}

/**
 * Check rate limit for a user.
 * Returns null if allowed, or a NextResponse with 429 status if blocked.
 * If Upstash is not configured, always allows (graceful degradation).
 */
export async function checkRateLimit(
  userId: string,
  language: string = "sv"
): Promise<NextResponse | null> {
  const limiter = getRatelimit()

  // If rate limiting isn't configured, allow all requests
  if (!limiter) return null

  const { success, remaining, reset } = await limiter.limit(userId)

  if (!success) {
    const resetDate = new Date(reset)
    const resetHours = Math.ceil(
      (reset - Date.now()) / (1000 * 60 * 60)
    )

    const message =
      language === "sv"
        ? `Du har nått gränsen på 100 frågor per dag. Kontakta utvecklaren för högre gräns. Återställs om cirka ${resetHours} timmar.`
        : `You have reached the limit of 100 questions per day. Contact the developer for a higher limit. Resets in approximately ${resetHours} hours.`

    return NextResponse.json(
      {
        error: message,
        rateLimited: true,
        remaining: 0,
        resetAt: resetDate.toISOString(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  // Allowed — return null (caller proceeds normally)
  return null
}
