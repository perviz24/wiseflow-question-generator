"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, Sparkles, Info, ChevronDown, ChevronUp } from "lucide-react"
import { QuestionPreview } from "./question-preview"
import { ContentUpload } from "./content-upload"
import { toast } from "sonner"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { downloadWiseflowJSON } from "@/lib/wiseflow-export"
import { downloadQti21 } from "@/lib/qti-export"
import { useTranslation } from "@/lib/language-context"

type QuestionType = "mcq" | "true_false" | "longtextV2" | "short_answer" | "fill_blank" | "multiple_response" | "matching" | "ordering" | "hotspot" | "rating_scale"
type Difficulty = "easy" | "medium" | "hard"
type Language = "sv" | "en"
type ExportFormat = "legacy" | "utgaende" | "qti21"

type ContextPriority = "subject_topic" | "context_only" | "hybrid"

interface FormData {
  subject: string
  topic: string
  difficulty: Difficulty
  numQuestions: number
  questionTypes: QuestionType[]
  language: Language
  context?: string // Manual user instructions
  uploadedContext?: string // Content from uploaded files/URLs (stored separately)
  contextPriority: ContextPriority // How AI handles subject/topic vs context
  // Tagging fields
  exportFormat: ExportFormat
  term?: string // T1, T2, T3, T4
  semester?: string // HT25, VT26
  examType?: string // Ordinarie, Omtentamen, Quiz
  courseCode?: string // BIO101, MATH202
  additionalTags?: string // Comma-separated custom tags
}

interface Question {
  type: QuestionType
  stimulus: string
  options?: Array<{
    label: string
    value: string
  }>
  correctAnswer?: string[]
  instructorStimulus?: string
}

export function QuestionGeneratorForm() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    topic: "",
    difficulty: "medium",
    numQuestions: 5,
    questionTypes: ["mcq"],
    language: "sv",
    context: "", // Manual user instructions
    uploadedContext: "", // Content from files/URLs
    contextPriority: "subject_topic",
    exportFormat: "legacy",
    term: "",
    semester: "",
    examType: "",
    courseCode: "",
    additionalTags: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null)
  const [metadata, setMetadata] = useState<{
    subject: string
    topic: string
    difficulty: string
    language: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [uploadedContentSource, setUploadedContentSource] = useState<string>("")
  const [showMoreQuestionTypes, setShowMoreQuestionTypes] = useState(false)

  const saveQuestionsMutation = useMutation(api.questions.saveQuestions)
  const userProfile = useQuery(api.profiles.getUserProfile)

  const handleContentExtracted = (content: string, source: string) => {
    // Store uploaded content separately from manual context
    setFormData((prev) => ({
      ...prev,
      uploadedContext: prev.uploadedContext
        ? `${prev.uploadedContext}\n\n---\nContent from ${source}:\n${content}`
        : `Content from ${source}:\n${content}`,
    }))
    setUploadedContentSource(source)
  }

  const handleContentRemoved = () => {
    // Clear uploaded context and reset to default when all files/URLs removed
    setFormData((prev) => ({
      ...prev,
      uploadedContext: "",
      contextPriority: "subject_topic",
    }))
    setUploadedContentSource("")
  }

  const toggleQuestionType = (type: QuestionType) => {
    setFormData((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter((t) => t !== type)
        : [...prev.questionTypes, type],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      // Combine manual context and uploaded context for API submission
      const combinedContext = [formData.uploadedContext, formData.context]
        .filter(Boolean)
        .join("\n\n---\n\n")

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          context: combinedContext, // Send combined context to API
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      setGeneratedQuestions(data.questions)
      setMetadata(data.metadata)

      toast.success(t("questionsGenerated"), {
        description: t("questionsGeneratedDesc", { count: data.questions.length }),
      })
    } catch (error) {
      console.error("Generation failed:", error)
      const errorMessage = error instanceof Error ? error.message : t("generationFailedDesc")
      toast.error(t("generationFailed"), {
        description: errorMessage,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedQuestions || !metadata) return

    setIsSaving(true)
    try {
      // Transform questions to match Convex schema
      const questionsToSave = generatedQuestions.map((q) => ({
        title: q.stimulus.substring(0, 100), // Use first 100 chars as title
        subject: metadata.subject,
        difficulty: metadata.difficulty as "easy" | "medium" | "hard",
        language: metadata.language as "sv" | "en",
        tags: [metadata.topic],
        type: q.type,
        stimulus: q.stimulus,
        options: q.options,
        correctAnswer: q.correctAnswer,
        shuffleOptions: q.type === "mcq",
        maxLength: q.type === "longtextV2" ? 5000 : undefined,
        formattingOptions: q.type === "longtextV2" ? ["bold", "italic", "underline"] : undefined,
        instructorStimulus: q.instructorStimulus,
        submitOverLimit: false,
        score: 1,
        minScore: 0,
        maxScore: 1,
        generatedBy: "ai" as const,
      }))

      const result = await saveQuestionsMutation({ questions: questionsToSave })

      toast.success(t("questionsSaved"), {
        description: t("questionsSavedDesc", { count: result.count }),
      })
    } catch (error) {
      console.error("Save failed:", error)
      toast.error(t("saveFailed"), {
        description: t("saveFailedDesc"),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    if (!generatedQuestions || !metadata) return

    setIsExporting(true)
    try {
      // Pass complete metadata including tagging fields and tutor initials
      const exportMetadata = {
        ...metadata,
        exportFormat: formData.exportFormat,
        term: formData.term,
        semester: formData.semester,
        examType: formData.examType,
        courseCode: formData.courseCode,
        additionalTags: formData.additionalTags,
        tutorInitials: userProfile?.tutorInitials || "",
      }

      // Choose export format based on user selection
      if (formData.exportFormat === "qti21") {
        await downloadQti21(generatedQuestions, exportMetadata)
      } else {
        downloadWiseflowJSON(generatedQuestions, exportMetadata)
      }

      const formatLabel = formData.exportFormat === "legacy" ? "Legacy" : formData.exportFormat === "utgaende" ? "Utgående" : "QTI 2.1"
      toast.success(t("exportSuccessful"), {
        description: t("exportSuccessfulDesc", { format: formatLabel }),
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast.error(t("exportFailed"), {
        description: t("exportFailedDesc"),
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleGenerateNew = () => {
    setGeneratedQuestions(null)
    setMetadata(null)
    // Clear ALL context (both manual and uploaded) so it doesn't carry over
    setFormData(prev => ({
      ...prev,
      context: "",
      uploadedContext: "",
      contextPriority: "subject_topic"
    }))
    setUploadedContentSource("")
  }

  const handleUpdateQuestions = (updatedQuestions: Question[]) => {
    setGeneratedQuestions(updatedQuestions)
  }

  // Show preview if questions have been generated
  if (generatedQuestions && metadata) {
    return (
      <div className="space-y-4">
        <QuestionPreview
          questions={generatedQuestions}
          metadata={metadata}
          onSave={handleSave}
          onExport={handleExport}
          onUpdateQuestions={handleUpdateQuestions}
          isSaving={isSaving}
          isExporting={isExporting}
        />
        <div className="flex justify-center">
          <Button onClick={handleGenerateNew} variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            {t("generateNew")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 drop-shadow-sm" />
            <span className="truncate bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">{t("generateQuestions")}</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1.5">
            {t("createQuestionsSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              {t("subject")} {formData.contextPriority !== "context_only" || !formData.uploadedContext ? "*" : "(Optional)"}
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder={t("subjectPlaceholder")}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              autoComplete="off"
              required={formData.contextPriority !== "context_only" || !formData.uploadedContext}
            />
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              {t("topic")} {formData.contextPriority !== "context_only" || !formData.uploadedContext ? "*" : "(Optional)"}
            </Label>
            <Input
              id="topic"
              name="topic"
              placeholder={t("topicPlaceholder")}
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              autoComplete="off"
              required={formData.contextPriority !== "context_only" || !formData.uploadedContext}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">{t("difficulty")}</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value: Difficulty) =>
                setFormData({ ...formData, difficulty: value })
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">{t("easy")}</SelectItem>
                <SelectItem value="medium">{t("medium")}</SelectItem>
                <SelectItem value="hard">{t("hard")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Questions */}
          <div className="space-y-2">
            <Label htmlFor="numQuestions">{t("numQuestions")}</Label>
            <Input
              id="numQuestions"
              name="numQuestions"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={formData.numQuestions}
              onChange={(e) =>
                setFormData({ ...formData, numQuestions: parseInt(e.target.value) || 1 })
              }
              autoComplete="off"
            />
            <p className="text-sm text-muted-foreground">{t("numQuestionsHelp")}</p>
          </div>

          {/* Question Types */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label>{t("questionTypes")} *</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-3.5 w-3.5" />
                    <span className="sr-only">Question types information</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Select one or more question types to generate. You can mix different types in the same set.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-3">
              {/* Default visible question types */}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Question type selection">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleQuestionType("mcq")}
                      className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        formData.questionTypes.includes("mcq")
                          ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                          : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      }`}
                      aria-pressed={formData.questionTypes.includes("mcq")}
                    >
                      {t("multipleChoice")}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Fråga med flera svarsalternativ, ett rätt svar</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleQuestionType("true_false")}
                      className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        formData.questionTypes.includes("true_false")
                          ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                          : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      }`}
                      aria-pressed={formData.questionTypes.includes("true_false")}
                    >
                      {t("trueFalse")}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Fråga med två alternativ: Sant eller Falskt</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleQuestionType("longtextV2")}
                      className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        formData.questionTypes.includes("longtextV2")
                          ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                          : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      }`}
                      aria-pressed={formData.questionTypes.includes("longtextV2")}
                    >
                      {t("essay")}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Öppen fråga med längre textsvar (essä)</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Additional question types (collapsible) */}
              {showMoreQuestionTypes && (
                <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Additional question types">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleQuestionType("short_answer")}
                        className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          formData.questionTypes.includes("short_answer")
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                        aria-pressed={formData.questionTypes.includes("short_answer")}
                      >
                        Kortsvar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Öppen fråga med kort textsvar (1-3 meningar)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleQuestionType("fill_blank")}
                        className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          formData.questionTypes.includes("fill_blank")
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                        aria-pressed={formData.questionTypes.includes("fill_blank")}
                      >
                        Ifyllnad
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Text med luckor att fylla i</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleQuestionType("multiple_response")}
                        className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          formData.questionTypes.includes("multiple_response")
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                        aria-pressed={formData.questionTypes.includes("multiple_response")}
                      >
                        Flera rätt svar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Fråga med flera alternativ där flera kan vara rätt</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleQuestionType("matching")}
                        className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          formData.questionTypes.includes("matching")
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                        aria-pressed={formData.questionTypes.includes("matching")}
                      >
                        Matchning
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Para ihop begrepp eller termer med definitioner</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleQuestionType("ordering")}
                        className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          formData.questionTypes.includes("ordering")
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                        aria-pressed={formData.questionTypes.includes("ordering")}
                      >
                        Ordningsföljd
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Sortera element i rätt ordning eller sekvens</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleQuestionType("hotspot")}
                        className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          formData.questionTypes.includes("hotspot")
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                        aria-pressed={formData.questionTypes.includes("hotspot")}
                      >
                        Bildmarkering
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Markera rätt område på en bild eller diagram</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleQuestionType("rating_scale")}
                        className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          formData.questionTypes.includes("rating_scale")
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                        aria-pressed={formData.questionTypes.includes("rating_scale")}
                      >
                        Betygsskala
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Betygsätta eller värdera på en skala (t.ex. 1-5)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Toggle button */}
              <button
                type="button"
                onClick={() => setShowMoreQuestionTypes(!showMoreQuestionTypes)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {showMoreQuestionTypes ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Visa färre frågetyper
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    {t("showMoreTypes")} ({7} till)
                  </>
                )}
              </button>
            </div>
            {formData.questionTypes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("questionTypesHelp")}
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">{t("language")}</Label>
            <Select
              value={formData.language}
              onValueChange={(value: Language) =>
                setFormData({ ...formData, language: value })
              }
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sv">{t("swedish")}</SelectItem>
                <SelectItem value="en">{t("english")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Upload */}
          <ContentUpload
            onContentExtracted={handleContentExtracted}
            onContentRemoved={handleContentRemoved}
          />

          {/* Context Priority */}
          {formData.uploadedContext && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <Label className="text-sm font-semibold">{t("contextPriorityLabel")}</Label>
              <RadioGroup
                value={formData.contextPriority}
                onValueChange={(value: ContextPriority) => {
                  // Auto-clear subject/topic when selecting "context_only"
                  if (value === "context_only" && (formData.subject || formData.topic)) {
                    setFormData({ ...formData, contextPriority: value, subject: "", topic: "" })
                    toast.info(t("subjectTopicCleared") || "Subject and topic cleared - they won't influence question generation")
                  } else {
                    setFormData({ ...formData, contextPriority: value })
                  }
                }}
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="subject_topic" id="subject_topic" />
                  <div className="flex-1">
                    <Label htmlFor="subject_topic" className="cursor-pointer font-medium">
                      {t("prioritySubjectTopic")}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("prioritySubjectTopicDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="context_only" id="context_only" />
                  <div className="flex-1">
                    <Label htmlFor="context_only" className="cursor-pointer font-medium">
                      {t("priorityContextOnly")}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("priorityContextOnlyDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="hybrid" id="hybrid" />
                  <div className="flex-1">
                    <Label htmlFor="hybrid" className="cursor-pointer font-medium">
                      {t("priorityHybrid")}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("priorityHybridDesc")}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Context (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="context">{t("additionalContext")}</Label>
            <Textarea
              id="context"
              name="context"
              placeholder={t("additionalContextPlaceholder")}
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              maxLength={2000}
              rows={4}
              autoComplete="off"
            />
            <p className="text-sm text-muted-foreground">
              {formData.context?.length || 0} / 2000 {t("charactersCount")}
            </p>
            {formData.uploadedContext && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900">
                💡 <strong>Tip:</strong> You can guide AI here! Example: "Generate 5 questions from the file and 5 from the URL" or "Focus primarily on the uploaded document"
              </p>
            )}
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="exportFormat">{t("exportFormat")}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-3.5 w-3.5" />
                    <span className="sr-only">Export format information</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    <strong>Legacy:</strong> Original format with tags array<br />
                    <strong>Utgående:</strong> New format for Wiseflow exam center<br />
                    <strong>QTI 2.1:</strong> Standard format for LMS compatibility
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.exportFormat}
              onValueChange={(value: ExportFormat) =>
                setFormData({ ...formData, exportFormat: value })
              }
            >
              <SelectTrigger id="exportFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="legacy">{t("legacyFormat")}</SelectItem>
                <SelectItem value="utgaende">{t("utgaendeFormat")}</SelectItem>
                <SelectItem value="qti21">{t("qti21Format")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t("exportFormatHelp")}
            </p>
          </div>

          {/* Tagging Section */}
          <div className="space-y-4 rounded-lg border-2 border-zinc-200 bg-zinc-50/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("tagsOrganization")}</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="h-3.5 w-3.5" />
                      <span className="sr-only">Tagging information</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      These tags help organize questions in your Wiseflow exam center. All fields are optional and will be included in the export.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("tagsOrganizationHelp")}
              </p>
            </div>

            {/* Exam Center Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">{t("termPeriod")}</Label>
                <Input
                  id="term"
                  name="term"
                  placeholder={t("termPlaceholder")}
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">{t("semester")}</Label>
                <Input
                  id="semester"
                  name="semester"
                  placeholder={t("semesterPlaceholder")}
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examType">{t("examType")}</Label>
                <Input
                  id="examType"
                  name="examType"
                  placeholder={t("examTypePlaceholder")}
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseCode">{t("courseCode")}</Label>
                <Input
                  id="courseCode"
                  name="courseCode"
                  placeholder={t("courseCodePlaceholder")}
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Additional Tags */}
            <div className="space-y-2">
              <Label htmlFor="additionalTags">{t("additionalTags")}</Label>
              <Input
                id="additionalTags"
                name="additionalTags"
                placeholder={t("additionalTagsPlaceholder")}
                value={formData.additionalTags}
                onChange={(e) => setFormData({ ...formData, additionalTags: e.target.value })}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                {t("additionalTagsHelp")}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 sm:h-10 touch-action-manipulation shadow-md hover:shadow-lg transition-all duration-200"
            disabled={
              isGenerating ||
              formData.questionTypes.length === 0 ||
              // Subject/topic required UNLESS prioritizing uploaded context with content
              (formData.contextPriority !== "context_only" && (!formData.subject || !formData.topic)) ||
              (formData.contextPriority === "context_only" && !formData.uploadedContext)
            }
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t("generateQuestions")}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}
