"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Info, ListChecks, Lock } from "lucide-react"
import { useTranslation } from "@/lib/language-context"
import {
  QUESTION_TYPES,
  getTypesByTier,
  getCoreTypeIds,
  getDefaultEnabledTypes,
  normalizeEnabledTypes,
} from "@/lib/question-types"
import type { QuestionTypeDefinition } from "@/lib/question-types"
import type { Translations } from "@/lib/translations"

// Map type IDs to translation keys for labels and tooltips
const TYPE_LABEL_KEYS: Record<string, keyof Translations> = {
  mcq: "questionType_mcq",
  multiple_response: "questionType_multipleResponse",
  true_false: "questionType_trueFalse",
  longtextV2: "questionType_essay",
  short_answer: "questionType_shortAnswer",
  fill_blank: "questionType_fillBlank",
  matching: "questionType_matching",
  ordering: "questionType_ordering",
  choicematrix: "questionType_choicematrix",
  clozetext: "questionType_clozetext",
  clozedropdown: "questionType_clozedropdown",
  orderlist: "questionType_orderlist",
  tokenhighlight: "questionType_tokenhighlight",
  clozeassociation: "questionType_clozeassociation",
  imageclozeassociationV2: "questionType_imageclozeassociationV2",
  plaintext: "questionType_plaintext",
  formulaessayV2: "questionType_formulaessayV2",
  chemistryessayV2: "questionType_chemistryessayV2",
}

const TYPE_DESC_KEYS: Record<string, keyof Translations> = {
  mcq: "typeDesc_mcq",
  multiple_response: "typeDesc_multiple_response",
  true_false: "typeDesc_true_false",
  longtextV2: "typeDesc_longtextV2",
  short_answer: "typeDesc_short_answer",
  fill_blank: "typeDesc_fill_blank",
  matching: "typeDesc_matching",
  ordering: "typeDesc_ordering",
  choicematrix: "typeDesc_choicematrix",
  clozetext: "typeDesc_clozetext",
  clozedropdown: "typeDesc_clozedropdown",
  orderlist: "typeDesc_orderlist",
  tokenhighlight: "typeDesc_tokenhighlight",
  clozeassociation: "typeDesc_clozeassociation",
  imageclozeassociationV2: "typeDesc_imageclozeassociationV2",
  plaintext: "typeDesc_plaintext",
  formulaessayV2: "typeDesc_formulaessayV2",
  chemistryessayV2: "typeDesc_chemistryessayV2",
}

export default function QuestionTypeSettings() {
  const { t } = useTranslation()
  const profile = useQuery(api.profiles.getUserProfile)
  const upsertProfile = useMutation(api.profiles.upsertProfile)
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(new Set())
  const [initialLoaded, setInitialLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const coreTypes = getTypesByTier("core")
  const extendedTypes = getTypesByTier("extended")
  const specializedTypes = getTypesByTier("specialized")
  const coreIds = getCoreTypeIds()

  // Load enabled types from profile ONCE
  useEffect(() => {
    if (profile && !initialLoaded) {
      const profileTypes = profile.enabledQuestionTypes as string[] | undefined
      const normalized = normalizeEnabledTypes(profileTypes)
      setEnabledTypes(new Set(normalized))
      setInitialLoaded(true)
    }
  }, [profile, initialLoaded])

  const handleToggle = async (typeId: string, checked: boolean) => {
    // Core types cannot be toggled
    if (coreIds.includes(typeId)) return

    const newEnabled = new Set(enabledTypes)
    if (checked) {
      newEnabled.add(typeId)
    } else {
      newEnabled.delete(typeId)
    }
    // Always keep core types
    for (const coreId of coreIds) {
      newEnabled.add(coreId)
    }
    setEnabledTypes(newEnabled)

    // Auto-save to profile
    setIsSaving(true)
    try {
      const saveArgs: {
        tutorInitials: string
        uiLanguage: "sv" | "en"
        enabledQuestionTypes: string[]
      } = {
        tutorInitials: profile?.tutorInitials ?? "",
        uiLanguage: profile?.uiLanguage as "sv" | "en" ?? "sv",
        enabledQuestionTypes: Array.from(newEnabled).filter(
          (id) => id in QUESTION_TYPES
        ),
      }
      await upsertProfile(saveArgs)
      toast.success(t("typesUpdated"))
    } catch {
      toast.error(t("typesUpdateFailed"))
      // Revert on failure
      setEnabledTypes(enabledTypes)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefaults = async () => {
    const defaults = new Set(getDefaultEnabledTypes())
    setEnabledTypes(defaults)
    setIsSaving(true)
    try {
      await upsertProfile({
        tutorInitials: profile?.tutorInitials ?? "",
        uiLanguage: profile?.uiLanguage as "sv" | "en" ?? "sv",
        enabledQuestionTypes: Array.from(defaults),
      })
      toast.success(t("typesUpdated"))
    } catch {
      toast.error(t("typesUpdateFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  // Renders one question type row with switch + info icon
  function TypeRow({ typeDef, isCore }: { typeDef: QuestionTypeDefinition; isCore: boolean }) {
    const labelKey = TYPE_LABEL_KEYS[typeDef.id]
    const descKey = TYPE_DESC_KEYS[typeDef.id]
    const label = labelKey ? t(labelKey) : typeDef.id
    const description = descKey ? t(descKey) : ""

    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[250px]">
                <p className="text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isCore ? (
          <Badge variant="secondary" className="text-xs gap-1">
            <Lock className="h-3 w-3" />
            {t("alwaysOn")}
          </Badge>
        ) : (
          <Switch
            checked={enabledTypes.has(typeDef.id)}
            onCheckedChange={(checked) => handleToggle(typeDef.id, checked)}
            disabled={isSaving}
            size="sm"
          />
        )}
      </div>
    )
  }

  if (!initialLoaded) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-primary" />
          {t("questionTypesTitle")}
        </CardTitle>
        <CardDescription>
          {t("questionTypesDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core types — always on */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{t("tierCore")}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t("tierCoreDesc")}</p>
          <div className="space-y-1">
            {coreTypes.map((typeDef) => (
              <TypeRow key={typeDef.id} typeDef={typeDef} isCore />
            ))}
          </div>
        </div>

        <Separator />

        {/* Extended types — toggleable */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{t("tierExtended")}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t("tierExtendedDesc")}</p>
          <div className="space-y-1">
            {extendedTypes.map((typeDef) => (
              <TypeRow key={typeDef.id} typeDef={typeDef} isCore={false} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Specialized types — toggleable, off by default */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{t("tierSpecialized")}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t("tierSpecializedDesc")}</p>
          <div className="space-y-1">
            {specializedTypes.map((typeDef) => (
              <TypeRow key={typeDef.id} typeDef={typeDef} isCore={false} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Reset to defaults */}
        <button
          type="button"
          onClick={handleResetDefaults}
          disabled={isSaving}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          {t("resetToDefaults")}
        </button>
      </CardContent>
    </Card>
  )
}