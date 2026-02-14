"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, ChevronRight, BookOpen, FileText, Sparkles, Library, Upload } from "lucide-react"
import { useTranslation } from "@/lib/language-context"

const TOUR_STORAGE_KEY = "tentagen-tour-completed"

interface TourStep {
  targetSelector: string
  titleKey: keyof ReturnType<typeof useTranslation>["t"] extends (k: infer K) => string ? K : never
  descKey: string
  icon: React.ReactNode
  position: "bottom" | "top" | "left" | "right"
}

const TOUR_STEPS: Array<{
  targetSelector: string
  titleKey: string
  descKey: string
  icon: React.ReactNode
  position: "bottom" | "top"
}> = [
  {
    targetSelector: "[data-tour='welcome']",
    titleKey: "tourWelcomeTitle",
    descKey: "tourWelcomeDesc",
    icon: <Sparkles className="h-5 w-5 text-warm" />,
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='subject-topic']",
    titleKey: "tourSubjectTitle",
    descKey: "tourSubjectDesc",
    icon: <BookOpen className="h-5 w-5 text-blue-500" />,
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='question-types']",
    titleKey: "tourTypesTitle",
    descKey: "tourTypesDesc",
    icon: <FileText className="h-5 w-5 text-purple-500" />,
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='upload-section']",
    titleKey: "tourUploadTitle",
    descKey: "tourUploadDesc",
    icon: <Upload className="h-5 w-5 text-green-500" />,
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='generate-button']",
    titleKey: "tourGenerateTitle",
    descKey: "tourGenerateDesc",
    icon: <Sparkles className="h-5 w-5 text-warm" />,
    position: "top",
  },
  {
    targetSelector: "[data-tour='library-link']",
    titleKey: "tourLibraryTitle",
    descKey: "tourLibraryDesc",
    icon: <Library className="h-5 w-5 text-teal-500" />,
    position: "bottom",
  },
]

export function OnboardingTour() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

  // Check if tour should show on mount
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!completed) {
      // Delay tour start to let page render fully
      const timer = setTimeout(() => setIsActive(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Position tooltip relative to target element
  const positionTooltip = useCallback(() => {
    if (!isActive) return
    const step = TOUR_STEPS[currentStep]
    const target = document.querySelector(step.targetSelector)
    if (!target) {
      // If target not found, skip to next step or finish
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        completeTour()
      }
      return
    }

    const rect = target.getBoundingClientRect()
    const tooltipWidth = 340
    const tooltipHeight = 180
    const padding = 12

    let top: number
    let left: number

    if (step.position === "bottom") {
      top = rect.bottom + padding + window.scrollY
      left = Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2)
    } else {
      top = rect.top - tooltipHeight - padding + window.scrollY
      left = Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2)
    }

    // Keep tooltip within viewport
    left = Math.min(left, window.innerWidth - tooltipWidth - 16)

    setTooltipPos({ top, left })

    // Scroll target into view if needed
    target.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [currentStep, isActive])

  useEffect(() => {
    positionTooltip()
    window.addEventListener("resize", positionTooltip)
    return () => window.removeEventListener("resize", positionTooltip)
  }, [positionTooltip])

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true")
    setIsActive(false)
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }

  if (!isActive) return null

  const step = TOUR_STEPS[currentStep]
  const isLast = currentStep === TOUR_STEPS.length - 1

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[998] transition-opacity duration-300"
        onClick={completeTour}
      />

      {/* Highlight current target */}
      <HighlightRing selector={step.targetSelector} />

      {/* Tooltip card */}
      <Card
        className="fixed z-[1000] w-[340px] shadow-2xl border-2 border-warm/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <CardContent className="p-4">
          {/* Header with step counter and close */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {currentStep + 1} {t("tourStepOf")} {TOUR_STEPS.length}
            </span>
            <button
              onClick={completeTour}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              aria-label="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step content */}
          <div className="flex gap-3 mb-3">
            <div className="flex-shrink-0 mt-0.5">{step.icon}</div>
            <div>
              <h3 className="font-semibold text-sm mb-1">
                {t(step.titleKey as Parameters<typeof t>[0])}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(step.descKey as Parameters<typeof t>[0])}
              </p>
            </div>
          </div>

          {/* Progress dots + actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "w-4 bg-warm"
                      : idx < currentStep
                        ? "w-1.5 bg-warm/40"
                        : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={completeTour} className="text-xs h-7 px-2">
                {t("tourSkip")}
              </Button>
              <Button size="sm" onClick={nextStep} className="text-xs h-7 px-3 bg-warm hover:bg-warm/90 text-white">
                {isLast ? t("tourFinish") : t("tourNext")}
                {!isLast && <ChevronRight className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// Highlight ring around target element
function HighlightRing({ selector }: { selector: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const el = document.querySelector(selector)
    if (el) {
      const r = el.getBoundingClientRect()
      setRect(r)
    }
  }, [selector])

  if (!rect) return null

  return (
    <div
      className="fixed z-[999] pointer-events-none rounded-lg ring-2 ring-warm ring-offset-2 ring-offset-background transition-all duration-300"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      }}
    />
  )
}
