"use client"

import { useTranslation } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-white/50 backdrop-blur-sm dark:bg-black/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-base">
          {/* Beta badge — centered */}
          <Badge variant="secondary" className="text-sm px-3 py-1">
            🚧 {t("footerBeta")}
          </Badge>

          {/* Developer info */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <p className="text-center sm:text-left text-foreground">
              {t("footerDeveloper")}{" "}
              <a
                href="https://www.linkedin.com/in/parvizmammadzada/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Parviz Mammadzada, MD, PhD
              </a>
            </p>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a
              href={`mailto:${t("footerEmail")}`}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {t("footerEmail")}
            </a>
          </div>

          {/* Permission note */}
          <p className="text-center text-muted-foreground text-xs max-w-md">
            {t("footerPermission")}
          </p>
        </div>
      </div>
    </footer>
  )
}
