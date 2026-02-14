"use client"

import { useTranslation } from "@/lib/language-context"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function TermsPage() {
  const { t } = useTranslation()

  const sections = [
    { title: t("termsAcceptanceTitle"), text: t("termsAcceptanceText") },
    { title: t("termsDescriptionTitle"), text: t("termsDescriptionText") },
    { title: t("termsUserAccountTitle"), text: t("termsUserAccountText") },
    { title: t("termsAcceptableUseTitle"), text: t("termsAcceptableUseText") },
    { title: t("termsIPTitle"), text: t("termsIPText") },
    { title: t("termsAIContentTitle"), text: t("termsAIContentText") },
    { title: t("termsLiabilityTitle"), text: t("termsLiabilityText") },
    { title: t("termsChangesTitle"), text: t("termsChangesText") },
    { title: t("termsContactTitle"), text: t("termsContactText") },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary dark:from-background dark:to-background flex flex-col">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-3xl flex-1">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("termsTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("termsLastUpdated")}
          </p>
        </div>

        {/* Intro */}
        <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto leading-relaxed">
          {t("termsIntro")}
        </p>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {section.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
