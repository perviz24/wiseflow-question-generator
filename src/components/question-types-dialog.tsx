"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Layers, Lock, RotateCcw } from "lucide-react"
import { useTranslation } from "@/lib/language-context"
import {
  QUESTION_TYPES,
  getTypesByTier,
  getDefaultEnabledTypes,
  getCoreTypeIds,
  type QuestionTier,
} from "@/lib/question-types"

// Translation key mapping for type names
const TYPE_TRANSLATION_KEYS: Record<string, string> = {
  mcq: "questionType_mcq",
  true_false: "questionType_trueFalse",
  longtextV2: "questionType_essay",
  short_answer: "questionType_shortAnswer",
  fill_blank: "questionType_fillBlank",
  multiple_response: "questionType_multipleResponse",
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

// Category translation keys
const CATEGORY_KEYS: Record<string, string> = {
  choice: "categoryGeneral",
  text: "categoryGeneral",
  cloze: "categoryLanguage",
  interactive: "categoryGeneral",
  scientific: "categoryScience",
}

// Tier config: order and colors
const TIER_CONFIG: { tier: QuestionTier; badge: string }[] = [
  { tier: "core", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { tier: "extended", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  { tier: "specialized", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
]

interface QuestionTypesDialogProps {
  enabledTypes: string[]
  onTypesChange: (types: string[]) => void
}

export function QuestionTypesDialog({ enabledTypes, onTypesChange }: QuestionTypesDialogProps) {
  const { t } = useTranslation()
  const [localEnabled, setLocalEnabled] = useState<Set<string>>(new Set(enabledTypes))
  const [isOpen, setIsOpen] = useState(false)
  const coreIds = getCoreTypeIds()

  // Sync local state when props change or dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalEnabled(new Set(enabledTypes))
    }
  }, [enabledTypes, isOpen])

  const toggleType = useCallback((typeId: string) => {
    setLocalEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(typeId)) {
        next.delete(typeId)
      } else {
        next.add(typeId)
      }
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setLocalEnabled(new Set(getDefaultEnabledTypes()))
  }, [])

  const handleSave = useCallback(() => {
    // Always include core types
    const finalTypes = Array.from(new Set([...coreIds, ...localEnabled]))
    onTypesChange(finalTypes)
    setIsOpen(false)
  }, [localEnabled, coreIds, onTypesChange])

  const tierTranslationKey = (tier: QuestionTier) => {
    const keys: Record<QuestionTier, string> = {
      core: "tierCore",
      extended: "tierExtended",
      specialized: "tierSpecialized",
    }
    return keys[tier]
  }

  const tierDescKey = (tier: QuestionTier) => {
    const keys: Record<QuestionTier, string> = {
      core: "tierCoreDesc",
      extended: "tierExtendedDesc",
      specialized: "tierSpecializedDesc",
    }
    return keys[tier]
  }

  // Count enabled types (excluding core which are always on)
  const enabledCount = localEnabled.size
  const totalCount = Object.keys(QUESTION_TYPES).length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-9 text-sm justify-between"
          type="button"
        >
          <span className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" />
            {t("manageQuestionTypes")}
          </span>
          <Badge variant="secondary" className="text-xs">
            {enabledCount}/{totalCount}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {t("questionTypesTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("questionTypesDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {TIER_CONFIG.map(({ tier, badge }, tierIndex) => {
            const types = getTypesByTier(tier)
            if (types.length === 0) return null

            return (
              <div key={tier}>
                {tierIndex > 0 && <Separator className="mb-4" />}

                {/* Tier header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-medium ${badge} border-0`}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(tierTranslationKey(tier) as any)}
                      </Badge>
                      {tier === "core" && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          {t("alwaysOn")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {t(tierDescKey(tier) as any)}
                    </p>
                  </div>
                </div>

                {/* Type toggles */}
                <div className="space-y-1">
                  {types.map((typeDef) => {
                    const isCore = coreIds.includes(typeDef.id)
                    const isEnabled = isCore || localEnabled.has(typeDef.id)
                    const translationKey = TYPE_TRANSLATION_KEYS[typeDef.id]

                    return (
                      <div
                        key={typeDef.id}
                        className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                          isEnabled
                            ? "bg-accent/50"
                            : "hover:bg-accent/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {translationKey ? t(translationKey as any) : typeDef.id}
                          </span>
                          {typeDef.category === "scientific" && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1.5"
                            >
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {t(CATEGORY_KEYS[typeDef.category] as any)}
                            </Badge>
                          )}
                        </div>
                        {isCore ? (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => toggleType(typeDef.id)}
                            className="scale-90"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            <RotateCcw className="mr-1.5 h-3 w-3" />
            {t("resetToDefaults")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
          >
            {t("saveSettings")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
