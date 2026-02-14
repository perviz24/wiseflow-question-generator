"use client"

import { useConvexAuth, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useEffect, useRef } from "react"

/**
 * Invisible component that tracks first-time user logins.
 * Calls trackFirstLogin mutation once per session when authenticated.
 * Renders nothing — placed in layout.tsx inside ConvexClientProvider.
 */
export function AuthTracker() {
  const { isAuthenticated } = useConvexAuth()
  const trackFirstLogin = useMutation(api.userEvents.trackFirstLogin)
  const hasTracked = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !hasTracked.current) {
      hasTracked.current = true
      trackFirstLogin().catch((err) => {
        // Silent fail — don't disrupt user experience
        console.error("AuthTracker: failed to track login", err)
      })
    }
  }, [isAuthenticated, trackFirstLogin])

  return null // Renders nothing
}
