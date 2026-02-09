"use client"

import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ConvexReactClient } from "convex/react"
import { ReactNode } from "react"
import { LanguageProvider, useTranslation } from "@/lib/language-context"
import { svSE } from "@clerk/localizations"

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable")
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

function ClerkWithLocale({ children }: { children: ReactNode }) {
  const { language } = useTranslation()

  return (
    <ClerkProvider localization={language === "sv" ? svSE : undefined}>
      {children}
    </ClerkProvider>
  )
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ClerkWithLocale>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkWithLocale>
    </LanguageProvider>
  )
}
