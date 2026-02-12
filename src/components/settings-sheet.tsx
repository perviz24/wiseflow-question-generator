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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Settings, Loader2, User, Languages, Save } from "lucide-react"
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
      <SheetContent className="sm:max-w-sm">
        <SheetHeader className="pb-1">
          <SheetTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            {t("profileSettings")}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {t("profileSettingsDescription")}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-3" />

        {profile === undefined ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Tutor Initials Section */}
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <Label htmlFor="tutorInitials" className="text-sm font-medium">
                  {t("tutorInitials")} *
                </Label>
              </div>
              <Input
                id="tutorInitials"
                placeholder={t("tutorInitialsPlaceholder")}
                value={tutorInitials}
                onChange={(e) => setTutorInitials(e.target.value)}
                maxLength={20}
                autoComplete="off"
                required
                className="h-9 text-sm"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("tutorInitialsHelp")}
              </p>
            </div>

            {/* UI Language Section */}
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                <Label htmlFor="uiLanguage" className="text-sm font-medium">
                  {t("uiLanguage")}
                </Label>
              </div>
              <Select
                value={uiLanguage}
                onValueChange={(value: "sv" | "en") => setUiLanguage(value)}
              >
                <SelectTrigger id="uiLanguage" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sv" className="py-2 text-sm">{t("swedish")}</SelectItem>
                  <SelectItem value="en" className="py-2 text-sm">{t("english")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("uiLanguageHelp")}
              </p>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              size="default"
              className="w-full h-9 text-sm font-medium"
              disabled={isSaving || !tutorInitials.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  {t("saveSettings")}
                </>
              )}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
