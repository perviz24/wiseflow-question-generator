"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useQuery } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { api } from "../../convex/_generated/api"
import { translations, type Language, type Translations } from "./translations"

const GUEST_LANG_KEY = "tentagen_guest_language"

interface LanguageContextType {
  language: Language
  setGuestLanguage: (lang: Language) => void
  t: (key: keyof Translations, replacements?: Record<string, string | number>) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getStoredGuestLang(): Language {
  if (typeof window === "undefined") return "sv"
  const stored = localStorage.getItem(GUEST_LANG_KEY)
  return stored === "en" ? "en" : "sv"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth()
  const profile = useQuery(
    api.profiles.getUserProfile,
    isSignedIn ? undefined : "skip"
  )

  // Guest language state for non-authenticated users
  const [guestLang, setGuestLang] = useState<Language>("sv")

  // Initialize guest language from localStorage on mount
  useEffect(() => {
    setGuestLang(getStoredGuestLang())
  }, [])

  const setGuestLanguage = (lang: Language) => {
    setGuestLang(lang)
    localStorage.setItem(GUEST_LANG_KEY, lang)
  }

  // Authenticated: use profile language; Guest: use localStorage-backed state
  const language: Language = isSignedIn ? (profile?.uiLanguage || "sv") : guestLang
  const isLoading = Boolean(isSignedIn && profile === undefined)

  // Save language to localStorage for Clerk localization
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tentagen_ui_language", language)
      // Dispatch custom event for same-tab language changes
      window.dispatchEvent(new Event("languageChanged"))
    }
  }, [language])

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
    <LanguageContext.Provider value={{ language, setGuestLanguage, t, isLoading }}>
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
