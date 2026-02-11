"use client"

import { useTranslation } from "@/lib/language-context"

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-white/50 backdrop-blur-sm dark:bg-black/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-base">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <p className="text-center sm:text-left text-foreground">
              {t("footerDeveloper")} <span className="font-semibold text-primary">Parviz Mammadzada, MD, PhD</span>
            </p>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a
              href={`mailto:${t("footerEmail")}`}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {t("footerEmail")}
            </a>
          </div>
          <p className="text-center text-muted-foreground text-sm">
            {t("footerBeta")}
          </p>
        </div>
      </div>
    </footer>
  )
}
