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
  const [targetReady, setTargetReady] = useState(false)

  // Wait for the first tour target to exist in the DOM before starting.
  // Tour only runs for fresh users — no completed tour AND no existing preview session
  // (preview session means form shows results view where data-tour targets don't exist)
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY)
    if (completed) return

    const hasPreviewSession = localStorage.getItem("tentagen-preview-session")
    if (hasPreviewSession) return // Form shows results view — tour targets won't exist

    let cancelled = false
    let attempts = 0
    const maxAttempts = 30 // ~15 seconds max wait

    const poll = () => {
      if (cancelled) return
      attempts++
      const firstTarget = document.querySelector(TOUR_STEPS[0].targetSelector)
      if (firstTarget) {
        setIsActive(true)
        return
      }
      if (attempts < maxAttempts) {
        setTimeout(poll, 500)
      }
      // After 15s give up silently — user can trigger tour later if needed
    }

    // Start polling after a short initial delay
    const timer = setTimeout(poll, 1000)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [])

  // Position tooltip relative to target element (viewport-relative for fixed positioning)
  const positionTooltip = useCallback(() => {
    if (!isActive) return
    const step = TOUR_STEPS[currentStep]
    const target = document.querySelector(step.targetSelector)
    if (!target) {
      setTargetReady(false)
      // Poll for dynamically loaded targets instead of immediately skipping
      let pollCount = 0
      const pollForTarget = () => {
        pollCount++
        const el = document.querySelector(step.targetSelector)
        if (el) {
          setTargetReady(true)
          positionTooltip() // re-run now that target exists
        } else if (pollCount < 10) {
          setTimeout(pollForTarget, 300)
        } else {
          // Target genuinely missing after 3s — skip this step
          if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
          } else {
            completeTour()
          }
        }
      }
      setTimeout(pollForTarget, 300)
      return
    }

    setTargetReady(true)

    // Only scroll if element is not already mostly visible
    const rect = target.getBoundingClientRect()
    const headerHeight = 64 // sticky header ~56px + padding
    const isVisible = rect.top >= headerHeight && rect.bottom <= window.innerHeight - 100
    if (!isVisible) {
      target.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    // Calculate viewport-relative position for fixed tooltip
    const updatePosition = () => {
      const r = target.getBoundingClientRect()
      const tooltipWidth = 340
      const padding = 12

      let top: number
      let left = Math.max(16, r.left + r.width / 2 - tooltipWidth / 2)

      if (step.position === "bottom") {
        top = r.bottom + padding
      } else {
        // "top" — anchor point is element's top edge, CSS transform moves tooltip up
        top = r.top - padding
      }

      // Clamp horizontal within viewport
      left = Math.min(left, window.innerWidth - tooltipWidth - 16)

      // Clamp vertical so tooltip stays on screen
      if (step.position === "bottom") {
        top = Math.max(headerHeight + 8, Math.min(top, window.innerHeight - 220))
      }
      // For "top": translateY(-100%) in CSS handles upward offset, but clamp minimum
      if (step.position === "top") {
        top = Math.max(220, top) // Ensure enough room above for tooltip card
      }

      setTooltipPos({ top, left })
    }

    // Position after scroll settles, then refine again shortly after
    setTimeout(updatePosition, 350)
    setTimeout(updatePosition, 700)
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

  if (!isActive || !targetReady) return null

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
        style={{
          left: tooltipPos.left,
          ...(step.position === "top"
            ? { top: tooltipPos.top, transform: "translateY(-100%)" }
            : { top: tooltipPos.top }),
        }}
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

// Highlight ring around target element — updates after scroll settles
function HighlightRing({ selector }: { selector: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const update = () => {
      const el = document.querySelector(selector)
      if (el) setRect(el.getBoundingClientRect())
    }

    // Initial position after scroll settles — poll in case element is lazy-loaded
    let pollCount = 0
    const pollTimer = setInterval(() => {
      pollCount++
      update()
      if (document.querySelector(selector) || pollCount > 10) {
        clearInterval(pollTimer)
      }
    }, 300)

    const timer = setTimeout(update, 450)
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)

    return () => {
      clearTimeout(timer)
      clearInterval(pollTimer)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
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
