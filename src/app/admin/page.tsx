"use client"

import { useTranslation } from "@/lib/language-context"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { ArrowLeft, Settings, ShieldAlert, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminPage() {
  const { t } = useTranslation()
  const isAdmin = useQuery(api.siteConfig.getIsAdmin)
  const launchReady = useQuery(api.siteConfig.getLaunchStatus)
  const setLaunchReady = useMutation(api.siteConfig.setLaunchReady)
  const userEvents = useQuery(api.userEvents.listUserEvents)

  // Loading state — wait for auth + admin check
  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary dark:from-background dark:to-background flex flex-col">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-3xl flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <AppFooter />
      </div>
    )
  }

  // Not authorized — show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary dark:from-background dark:to-background flex flex-col">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-3xl flex-1">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div className="text-center space-y-4 mt-12">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <ShieldAlert className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("adminNotAuthorized")}
            </h1>
          </div>
        </main>
        <AppFooter />
      </div>
    )
  }

  const handleToggle = async (checked: boolean) => {
    try {
      await setLaunchReady({ value: checked })
      toast.success(checked ? t("adminLaunchOn") : t("adminLaunchOff"))
    } catch {
      toast.error("Failed to update launch status")
    }
  }

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
              <Settings className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("adminTitle")}
          </h1>
        </div>

        <div className="space-y-6">
          {/* Launch toggle card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">
                    {t("adminLaunchToggleLabel")}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("adminLaunchToggleDesc")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={launchReady ? "default" : "secondary"}
                    className={
                      launchReady
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                        : ""
                    }
                  >
                    {launchReady ? "ON" : "OFF"}
                  </Badge>
                  <Switch
                    checked={launchReady ?? false}
                    onCheckedChange={handleToggle}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Users log */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  {t("adminNewUsersTitle")}
                </h2>
                {userEvents && userEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {userEvents.length}
                  </Badge>
                )}
              </div>

              {/* Loading state */}
              {userEvents === undefined && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Empty state */}
              {userEvents && userEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {t("adminNewUsersEmpty")}
                </p>
              )}

              {/* User table */}
              {userEvents && userEvents.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                          {t("adminNewUsersName")}
                        </th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                          {t("adminNewUsersEmail")}
                        </th>
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          {t("adminNewUsersDate")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userEvents.map((event) => (
                        <tr key={event._id} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 pr-4">
                            {event.name || "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground">
                            {event.email || "—"}
                          </td>
                          <td className="py-2.5 text-muted-foreground">
                            {new Date(event.createdAt).toLocaleDateString("sv-SE")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
