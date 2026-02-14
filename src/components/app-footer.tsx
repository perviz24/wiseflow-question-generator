"use client"

import { useTranslation } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-muted/40 dark:bg-muted/20 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-6">
          {/* Pilot badge */}
          <Badge
            variant="secondary"
            className="text-sm px-4 py-1.5 bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary/90 border border-primary/20 text-center whitespace-normal"
          >
            🎓 {t("footerBetaPilot")}
          </Badge>

          {/* Feedback nudge */}
          <p className="text-center text-muted-foreground text-sm max-w-md leading-relaxed">
            💬 {t("footerFeedback")}
          </p>

          {/* Privacy notice */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-md bg-muted/60 dark:bg-muted/30 rounded-lg px-4 py-3 border border-border/50">
            <Shield className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
            <p className="leading-relaxed">
              <span className="font-medium text-foreground/80">{t("privacyNoticeTitle")}:</span>{" "}
              {t("privacyNoticeText")}
            </p>
          </div>

          {/* Developer info */}
          <div className="flex flex-col items-center gap-2 text-sm">
            <p className="text-center text-muted-foreground">
              {t("footerDeveloper")}{" "}
              <a
                href="https://www.linkedin.com/in/parvizmammadzada/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Parviz Mammadzada, MD, PhD
              </a>
            </p>
            <a
              href={`mailto:${t("footerEmail")}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("footerEmail")}
            </a>
          </div>

          {/* Divider */}
          <div className="w-16 border-t border-border" />

          {/* Permission note */}
          <p className="text-center text-muted-foreground text-xs max-w-sm leading-relaxed">
            {t("footerPermission")}
          </p>
        </div>
      </div>
    </footer>
  )
}
