"use client"

import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ConvexReactClient } from "convex/react"
import { ReactNode, useState, useEffect } from "react"
import { LanguageProvider } from "@/lib/language-context"
import { svSE } from "@clerk/localizations"

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable")
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

function ClerkWithDynamicLocale({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<typeof svSE | undefined>(undefined)

  useEffect(() => {
    // Read language preference from localStorage (set by LanguageProvider)
    const checkLanguage = () => {
      const stored = localStorage.getItem("tentagen_ui_language")
      setLocale(stored === "sv" ? svSE : undefined)
    }

    // Initial check
    checkLanguage()

    // Listen for storage events (when language changes in Settings)
    window.addEventListener("storage", checkLanguage)

    // Custom event for same-tab language changes
    window.addEventListener("languageChanged", checkLanguage)

    return () => {
      window.removeEventListener("storage", checkLanguage)
      window.removeEventListener("languageChanged", checkLanguage)
    }
  }, [])

  return (
    <ClerkProvider localization={locale}>
      {children}
    </ClerkProvider>
  )
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkWithDynamicLocale>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ConvexProviderWithClerk>
    </ClerkWithDynamicLocale>
  )
}
