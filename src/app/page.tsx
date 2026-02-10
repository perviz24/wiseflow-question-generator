"use client"

import { QuestionGeneratorForm } from "@/components/question-generator-form"
import { AppHeader } from "@/components/app-header"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"
import { Sparkles, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <AppHeader />

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
              {/* Hero Benefits */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t("heroSaveTime")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t("heroReviewEdit")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t("heroMultipleFormats")}</span>
                </div>
              </div>
              {/* Generate Button at Top */}
              <Button
                size="lg"
                onClick={() => {
                  const form = document.querySelector('form')
                  form?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="mt-2"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t("generateQuestions")}
              </Button>
              {/* Instruction Manual Button */}
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="mt-2"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t("instructionManual")}
                </Button>
              </Link>
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
            {/* Hero Benefits */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("heroSaveTime")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("heroReviewEdit")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("heroMultipleFormats")}</span>
              </div>
            </div>
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
