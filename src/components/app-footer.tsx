"use client"

import { useTranslation } from "@/lib/language-context"

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-center sm:text-left">
              {t("footerDeveloper")} <span className="font-medium">Parviz Mammadzada, MD, PhD</span>
            </p>
            <span className="hidden sm:inline">•</span>
            <a
              href={`mailto:${t("footerEmail")}`}
              className="hover:text-foreground transition-colors"
            >
              {t("footerEmail")}
            </a>
          </div>
          <p className="text-center">
            {t("footerBeta")}
          </p>
        </div>
      </div>
    </footer>
  )
}
