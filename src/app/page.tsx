"use client"

import { QuestionGeneratorForm } from "@/components/question-generator-form"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { FeedbackButton } from "@/components/feedback-button"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary dark:from-background dark:to-background flex flex-col">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-full overflow-x-hidden">
        <SignedIn>
          <div className="flex flex-col items-center gap-6 sm:gap-8 w-full">
            <div className="text-center px-2">
              {/* TentaGen Logo + Brand Name */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Image
                  src="/logo.svg"
                  alt="TentaGen"
                  width={56}
                  height={56}
                  className="text-foreground dark:invert"
                  priority
                />
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">TentaGen</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight pb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("createQuestionsTitle")}
              </h2>
              {/* Start Over — positioned right below title */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const form = document.querySelector('form')
                  if (form) {
                    form.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  } else {
                    localStorage.removeItem("wiseflow-preview-session")
                    window.location.href = "/"
                  }
                }}
                className="mt-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                {t("startOver")}
              </Button>
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
              {/* Instruction Manual — centered below benefits */}
              <div className="mt-4 flex justify-center">
                <Link href="/docs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                    {t("instructionManual")}
                  </Button>
                </Link>
              </div>
            </div>
            <QuestionGeneratorForm />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
            {/* TentaGen Logo + Brand Name */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="TentaGen"
                width={72}
                height={72}
                className="text-foreground dark:invert"
                priority
              />
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">TentaGen</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight pb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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
      <AppFooter />
      <FeedbackButton />
    </div>
  )
}
