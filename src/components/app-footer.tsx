"use client"

import { useTranslation } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-muted/40 dark:bg-muted/20 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-6">
          {/* Beta badge */}
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1 bg-warm-muted/60 dark:bg-warm/15 text-warm-foreground dark:text-warm border border-warm/20"
          >
            🚧 {t("footerBeta")}
          </Badge>

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
