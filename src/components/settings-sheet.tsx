"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { Settings, Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/language-context"

export function SettingsSheet() {
  const { t } = useTranslation()
  const profile = useQuery(api.profiles.getUserProfile)
  const upsertProfile = useMutation(api.profiles.upsertProfile)

  const [tutorInitials, setTutorInitials] = useState("")
  const [uiLanguage, setUiLanguage] = useState<"sv" | "en">("sv")
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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

      // Close sheet after successful save
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast.error(t("settingsSaveFailed"), {
        description: t("settingsSaveFailedDesc"),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          aria-label={t("settings")}
        >
          <Settings className="h-7 w-7" />
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            {t("profileSettings")}
          </SheetTitle>
          <SheetDescription>
            {t("profileSettingsDescription")}
          </SheetDescription>
        </SheetHeader>

        {profile === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 mt-6">
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
        )}
      </SheetContent>
    </Sheet>
  )
}
