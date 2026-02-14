"use client"

import { useTranslation } from "@/lib/language-context"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function PrivacyPage() {
  const { t } = useTranslation()

  const sections = [
    { title: t("privacyDataCollectionTitle"), text: t("privacyDataCollectionText") },
    { title: t("privacyAIProcessingTitle"), text: t("privacyAIProcessingText") },
    { title: t("privacyAuthTitle"), text: t("privacyAuthText") },
    { title: t("privacyStorageTitle"), text: t("privacyStorageText") },
    { title: t("privacyCookiesTitle"), text: t("privacyCookiesText") },
    { title: t("privacyRightsTitle"), text: t("privacyRightsText") },
    { title: t("privacyContactTitle"), text: t("privacyContactText") },
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
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("privacyPolicyTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("privacyPolicyLastUpdated")}
          </p>
        </div>

        {/* Intro */}
        <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto leading-relaxed">
          {t("privacyPolicyIntro")}
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
