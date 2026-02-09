"use client"

import { QuestionGeneratorForm } from "@/components/question-generator-form"
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"
import Link from "next/link"
import { Settings, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/50 sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-base sm:text-xl font-semibold tracking-tight truncate max-w-[180px] sm:max-w-none">
            {t("appTitle")}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SignedIn>
              <Link href="/library">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 sm:h-10 sm:w-10"
                  aria-label={t("myLibrary")}
                >
                  <Library className="h-6 w-6" />
                  <span className="sr-only">{t("myLibrary")}</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-9 sm:w-9"
                  aria-label={t("settings")}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t("settings")}</span>
                </Button>
              </Link>
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

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-full overflow-x-hidden">
        <SignedIn>
          <div className="flex flex-col items-center gap-6 sm:gap-8 w-full">
            <div className="text-center px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight pb-2 bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                {t("createQuestionsTitle")}
              </h2>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("createQuestionsSubtitle")}
              </p>
            </div>
            <QuestionGeneratorForm />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight pb-2 bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
              {t("welcomeTitle")}
            </h2>
            <p className="max-w-md text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {t("welcomeSubtitle")}
            </p>
            <SignInButton mode="modal">
              <button className="mt-4 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90">
                {t("signInToContinue")}
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </div>
  )
}
