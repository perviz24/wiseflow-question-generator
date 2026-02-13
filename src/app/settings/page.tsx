"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Settings, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/language-context"

export default function SettingsPage() {
  const { t, language } = useTranslation()
  const router = useRouter()
  // Settings page for tutor profile configuration
  const profile = useQuery(api.profiles.getUserProfile)
  const upsertProfile = useMutation(api.profiles.upsertProfile)

  const [tutorInitials, setTutorInitials] = useState("")
  const [uiLanguage, setUiLanguage] = useState<"sv" | "en">("sv")
  const [isSaving, setIsSaving] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  // Load profile data ONCE when first available — not on every Convex re-fire
  // (Convex subscriptions re-fire frequently, which would reset unsaved form changes)
  useEffect(() => {
    if (profile && !initialLoaded) {
      setTutorInitials(profile.tutorInitials)
      setUiLanguage(profile.uiLanguage)
      setInitialLoaded(true)
    }
  }, [profile, initialLoaded])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Preserve enabledQuestionTypes when saving other settings
      // Build args explicitly — Convex needs optional fields omitted, not undefined
      const saveArgs: {
        tutorInitials: string
        uiLanguage: "sv" | "en"
        enabledQuestionTypes?: string[]
      } = {
        tutorInitials: tutorInitials.trim(),
        uiLanguage,
      }
      // Only include enabledQuestionTypes if profile actually has them set
      if (profile?.enabledQuestionTypes && profile.enabledQuestionTypes.length > 0) {
        saveArgs.enabledQuestionTypes = profile.enabledQuestionTypes as string[]
      }
      const result = await upsertProfile(saveArgs)

      toast.success(t("settingsSaved"), {
        description: result?.action === "created"
          ? t("settingsSavedDescCreated")
          : t("settingsSavedDescUpdated"),
      })
    } catch (error: unknown) {
      console.error("Failed to save settings:", error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      // Show specific message for auth errors
      const isAuthError = errorMsg.includes("Not authenticated") || errorMsg.includes("auth") || errorMsg.includes("Unauthorized")
      toast.error(t("settingsSaveFailed"), {
        description: isAuthError
          ? (language === "sv" ? "Logga ut och logga in igen för att lösa detta." : "Sign out and sign in again to fix this.")
          : (language === "sv" ? `Fel: ${errorMsg}` : `Error: ${errorMsg}`),
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (profile === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-6 w-6" />
          {t("back")}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            {t("profileSettings")}
          </CardTitle>
          <CardDescription>
            {t("profileSettingsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Tutor Initials */}
            <div className="space-y-2">
              <Label htmlFor="tutorInitials">
                {t("tutorInitials")} *
              </Label>
              <Input
                id="tutorInitials"
                placeholder={t("tutorInitialsPlaceholder")}
                value={tutorInitials}
                onChange={(e) => setTutorInitials(e.target.value)}
                maxLength={20}
                autoComplete="off"
                required
              />
              <p className="text-sm text-muted-foreground">
                {t("tutorInitialsHelp")}
              </p>
            </div>

            {/* UI Language */}
            <div className="space-y-2">
              <Label htmlFor="uiLanguage">{t("uiLanguage")}</Label>
              <Select
                value={uiLanguage}
                onValueChange={(value: "sv" | "en") => setUiLanguage(value)}
              >
                <SelectTrigger id="uiLanguage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sv">{t("swedish")}</SelectItem>
                  <SelectItem value="en">{t("english")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t("uiLanguageHelp")}
              </p>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSaving || !tutorInitials.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>{t("saveSettings")}</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
