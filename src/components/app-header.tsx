"use client"

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Library, BookOpen, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"
import { SettingsSheet } from "@/components/settings-sheet"
import Image from "next/image"

export function AppHeader() {
  const { t } = useTranslation()
  const router = useRouter()

  const handleHomeNavigation = () => {
    // Clear preview session and force full page reload to reset all state
    localStorage.removeItem("wiseflow-preview-session")
    window.location.href = "/"
  }

  return (
    <header className="border-b border-border bg-white/50 backdrop-blur-sm dark:bg-black/50 sticky top-0 z-10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div
          onClick={handleHomeNavigation}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.svg"
            alt="TentaGen"
            width={32}
            height={32}
            className="text-foreground"
          />
          <h1 className="text-base sm:text-xl font-semibold tracking-tight truncate max-w-[180px] sm:max-w-none">
            {t("appTitle")}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            aria-label={t("home")}
            onClick={handleHomeNavigation}
          >
            <Home className="h-7 w-7" />
            <span className="sr-only">{t("home")}</span>
          </Button>
          <Link href="/docs">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label={t("documentation")}
            >
              <BookOpen className="h-7 w-7" />
              <span className="sr-only">{t("documentation")}</span>
            </Button>
          </Link>
          <SignedIn>
            <Link href="/library">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                aria-label={t("myLibrary")}
              >
                <Library className="h-7 w-7" />
                <span className="sr-only">{t("myLibrary")}</span>
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
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {t("signIn")}
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  )
}
