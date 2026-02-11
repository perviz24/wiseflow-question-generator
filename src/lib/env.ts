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

// Note: ASSEMBLYAI_API_KEY is read directly via process.env in API routes
// to avoid triggering eager validation of all vars during Next.js build
