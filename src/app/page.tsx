"use client"

import { QuestionGeneratorForm } from "@/components/question-generator-form"
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"
import Link from "next/link"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold tracking-tight">
            {t("appTitle")}
          </h1>
          <div className="flex items-center gap-3">
            <SignedIn>
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t("settings")}</span>
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
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
      <main className="container mx-auto px-4 py-12">
        <SignedIn>
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                {t("createQuestionsTitle")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("createQuestionsSubtitle")}
              </p>
            </div>
            <QuestionGeneratorForm />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight">
              {t("welcomeTitle")}
            </h2>
            <p className="max-w-md text-lg text-muted-foreground">
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
