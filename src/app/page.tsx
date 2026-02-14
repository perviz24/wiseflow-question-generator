"use client"

import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { FeedbackButton } from "@/components/feedback-button"
import dynamic from "next/dynamic"

// Lazy-load heavy components (loaded after initial paint)
const QuestionGeneratorForm = dynamic(
  () => import("@/components/question-generator-form").then(mod => mod.QuestionGeneratorForm),
  { loading: () => <div className="w-full max-w-4xl mx-auto animate-pulse space-y-4"><div className="h-64 bg-muted rounded-lg" /><div className="h-48 bg-muted rounded-lg" /></div> }
)
const OnboardingTour = dynamic(
  () => import("@/components/onboarding-tour").then(mod => mod.OnboardingTour),
  { ssr: false }
)
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"

function QuickStartSteps() {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <p className="text-center text-sm font-medium text-muted-foreground mb-4">
        {t("quickStartTitle")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-4">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-bold">1</div>
          <p className="text-sm font-medium text-foreground">{t("quickStartStep1Title")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("quickStartStep1Desc")}</p>
        </div>
        <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-4">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-warm/10 text-warm-foreground text-sm font-bold">2</div>
          <p className="text-sm font-medium text-foreground">{t("quickStartStep2Title")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("quickStartStep2Desc")}</p>
        </div>
        <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-4">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-bold">3</div>
          <p className="text-sm font-medium text-foreground">{t("quickStartStep3Title")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("quickStartStep3Desc")}</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary dark:from-background dark:to-background flex flex-col">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-full overflow-x-hidden">
        <SignedIn>
          <OnboardingTour />
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight pb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-balance">
                {t("createQuestionsTitle")}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("createQuestionsSubtitle")}
              </p>
              {/* Hero Benefits */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{t("heroSaveTime")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-warm" />
                  <span>{t("heroReviewEdit")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{t("heroMultipleFormats")}</span>
                </div>
              </div>
              {/* Instruction Manual — centered below benefits */}
              <div className="mt-4 flex justify-center">
                <Link href="/docs" prefetch={false}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-warm-foreground dark:text-warm border-warm/30 hover:bg-warm-muted/40 dark:hover:bg-warm/10"
                  >
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                    {t("instructionManual")}
                  </Button>
                </Link>
              </div>
              {/* Quick Start Steps */}
              <QuickStartSteps />
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight pb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-balance">
              {t("welcomeTitle")}
            </h1>
            <p className="max-w-md text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {t("welcomeSubtitle")}
            </p>
            {/* Hero Benefits */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{t("heroSaveTime")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-warm" />
                <span>{t("heroReviewEdit")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{t("heroMultipleFormats")}</span>
              </div>
            </div>
            {/* Quick Start Steps (also visible to signed-out visitors) */}
            <QuickStartSteps />
            <SignInButton mode="modal">
              <Button size="lg" className="mt-2 text-base px-6">
                {t("signInToContinue")}
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
      <AppFooter />
      <FeedbackButton />
    </div>
  )
}
