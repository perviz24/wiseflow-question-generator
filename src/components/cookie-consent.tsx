"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useTranslation } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Cookie } from "lucide-react"

const COOKIE_CONSENT_KEY = "tentagen_cookie_consent"

export function CookieConsent() {
  const { t } = useTranslation()
  const launchReady = useQuery(api.siteConfig.getLaunchStatus)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if launch is on AND user hasn't already decided
    if (launchReady && typeof window !== "undefined") {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (!stored) setVisible(true)
    }
  }, [launchReady])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted")
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto max-w-xl">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
            {t("cookieMessage")}
          </p>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="flex-1 sm:flex-none"
            >
              {t("cookieDecline")}
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="flex-1 sm:flex-none"
            >
              {t("cookieAccept")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
