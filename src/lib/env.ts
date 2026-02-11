// Environment variable validation
// Always import from this file, never use process.env directly

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Convex
export const CONVEX_DEPLOYMENT = getEnvVar("CONVEX_DEPLOYMENT")
export const NEXT_PUBLIC_CONVEX_URL = getEnvVar("NEXT_PUBLIC_CONVEX_URL")

// Clerk
export const NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = getEnvVar("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
export const CLERK_SECRET_KEY = getEnvVar("CLERK_SECRET_KEY")

// Anthropic
export const ANTHROPIC_API_KEY = getEnvVar("ANTHROPIC_API_KEY")

// AssemblyAI (optional - for YouTube and video transcription)
export const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || ""

// Bunny.net (optional - for video transcription)
export const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY || ""
export const BUNNY_ACCOUNT_API_KEY = process.env.BUNNY_ACCOUNT_API_KEY || ""
export const BUNNY_VIDEO_LIBRARY_ID = process.env.BUNNY_VIDEO_LIBRARY_ID || ""

// Optional: Convex HTTP Actions URL
export const NEXT_PUBLIC_CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || ""
