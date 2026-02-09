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
  const { t } = useTranslation()
  const router = useRouter()
  // Settings page for tutor profile configuration
  const profile = useQuery(api.profiles.getUserProfile)
  const upsertProfile = useMutation(api.profiles.upsertProfile)

  const [tutorInitials, setTutorInitials] = useState("")
  const [uiLanguage, setUiLanguage] = useState<"sv" | "en">("sv")
  const [isSaving, setIsSaving] = useState(false)

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setTutorInitials(profile.tutorInitials)
      setUiLanguage(profile.uiLanguage)
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await upsertProfile({
        tutorInitials: tutorInitials.trim(),
        uiLanguage,
      })

      toast.success(t("settingsSaved"), {
        description: result.action === "created"
          ? t("settingsSavedDescCreated")
          : t("settingsSavedDescUpdated"),
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast.error(t("settingsSaveFailed"), {
        description: t("settingsSaveFailedDesc"),
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
          <ArrowLeft className="mr-2 h-5 w-5" />
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
