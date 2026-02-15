"use client"

import { UserButton, SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import Link from "next/link"
import { Library, BookOpen, Home, Globe, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "@/lib/language-context"
import { SettingsSheet } from "@/components/settings-sheet"
import Image from "next/image"

export function AppHeader() {
  const { t, language, setGuestLanguage } = useTranslation()
  const { isLoaded } = useAuth()
  // Admin check must live here — Clerk UserButton.MenuItems only accepts
  // UserButton.Link/Action, not custom components with hooks (they don't render as live React components)
  const isAdmin = useQuery(api.siteConfig.getIsAdmin)

  const handleHomeNavigation = () => {
    // Clear preview session and force full page reload to reset all state
    localStorage.removeItem("tentagen-preview-session")
    window.location.href = "/"
  }

  return (
    <header className="border-b border-border bg-white/50 backdrop-blur-sm dark:bg-black/50 sticky top-0 z-10">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo — icon only on mobile, icon+text on desktop */}
        <div
          onClick={handleHomeNavigation}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.svg"
            alt="TentaGen"
            width={28}
            height={28}
            className="text-foreground"
          />
          <h1 className="hidden sm:block text-lg font-semibold tracking-tight">
            {t("appTitle")}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 px-2 sm:px-3"
            aria-label={t("home")}
            onClick={handleHomeNavigation}
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline text-xs font-medium">{t("home")}</span>
          </Button>
          <Link href="/docs" prefetch={false}>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 px-2 sm:px-3"
              aria-label={t("documentation")}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline text-xs font-medium">{t("docs")}</span>
            </Button>
          </Link>
          {/* Auth-dependent nav: show skeleton while Clerk loads to prevent CLS */}
          {!isLoaded ? (
            <>
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </>
          ) : (
            <>
              <SignedIn>
                <Link href="/library" prefetch={false} data-tour="library-link">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 px-2 sm:px-3"
                    aria-label={t("myLibrary")}
                  >
                    <Library className="h-4 w-4" />
                    <span className="hidden md:inline text-xs font-medium">{t("library")}</span>
                  </Button>
                </Link>
                <SettingsSheet />
                <UserButton afterSignOutUrl="/">
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label={t("myLibrary")}
                      labelIcon={<Library className="h-4 w-4" />}
                      href="/library"
                    />
                    {isAdmin && (
                      <UserButton.Link
                        label={t("adminTitle")}
                        labelIcon={<Settings className="h-4 w-4" />}
                        href="/admin"
                      />
                    )}
                  </UserButton.MenuItems>
                </UserButton>
              </SignedIn>
              <SignedOut>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 px-2 sm:px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setGuestLanguage(language === "sv" ? "en" : "sv")}
                  aria-label={language === "sv" ? "Switch to English" : "Byt till svenska"}
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium">{language === "sv" ? "EN" : "SV"}</span>
                </Button>
                <SignInButton mode="modal">
                  <Button size="sm" className="h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium">
                    {t("signIn")}
                  </Button>
                </SignInButton>
              </SignedOut>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
