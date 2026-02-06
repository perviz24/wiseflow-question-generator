"use client"

import { createContext, useContext, ReactNode } from "react"
import { useQuery } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { api } from "../../convex/_generated/api"
import { translations, type Language, type Translations } from "./translations"

interface LanguageContextType {
  language: Language
  t: (key: keyof Translations, replacements?: Record<string, string | number>) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth()
  const profile = useQuery(
    api.profiles.getUserProfile,
    isSignedIn ? undefined : "skip"
  )

  // Default to Swedish, use profile language if available
  const language: Language = profile?.uiLanguage || "sv"
  const isLoading = Boolean(isSignedIn && profile === undefined)

  const t = (
    key: keyof Translations,
    replacements?: Record<string, string | number>
  ): string => {
    let text = translations[language][key]

    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, String(value))
      })
    }

    return text
  }

  return (
    <LanguageContext.Provider value={{ language, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}
