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
import Link from "next/link"

export default function SettingsPage() {
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

      toast.success("Inställningar sparade!", {
        description: result.action === "created"
          ? "Din profil har skapats."
          : "Dina inställningar har uppdaterats.",
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast.error("Misslyckades att spara", {
        description: "Kunde inte spara inställningar. Försök igen.",
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
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profilinställningar
          </CardTitle>
          <CardDescription>
            Ställ in dina personliga inställningar för frågegenereringen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Tutor Initials */}
            <div className="space-y-2">
              <Label htmlFor="tutorInitials">
                Lärarinitialer *
              </Label>
              <Input
                id="tutorInitials"
                placeholder="t.ex. AB, JD, eller id:pma"
                value={tutorInitials}
                onChange={(e) => setTutorInitials(e.target.value)}
                maxLength={20}
                autoComplete="off"
                required
              />
              <p className="text-sm text-muted-foreground">
                Dessa initialer läggs automatiskt till som tagg på alla dina genererade frågor.
                Detta hjälper dig att hitta dina frågor i Wiseflow.
              </p>
            </div>

            {/* UI Language */}
            <div className="space-y-2">
              <Label htmlFor="uiLanguage">Gränssnittsspråk</Label>
              <Select
                value={uiLanguage}
                onValueChange={(value: "sv" | "en") => setUiLanguage(value)}
              >
                <SelectTrigger id="uiLanguage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sv">Svenska</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Välj vilket språk du vill använda i gränssnittet
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
                  Sparar...
                </>
              ) : (
                <>Spara inställningar</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
