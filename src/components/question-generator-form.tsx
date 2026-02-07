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
import { Loader2, Sparkles } from "lucide-react"
import { QuestionPreview } from "./question-preview"
import { ContentUpload } from "./content-upload"
import { toast } from "sonner"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { downloadWiseflowJSON } from "@/lib/wiseflow-export"
import { downloadQti21 } from "@/lib/qti-export"
import { useTranslation } from "@/lib/language-context"

type QuestionType = "mcq" | "true_false" | "longtextV2"
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
  type: "mcq" | "true_false" | "longtextV2"
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
    // Clear uploaded context so it doesn't carry over to new generation
    setFormData(prev => ({ ...prev, context: "" }))
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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("generateQuestions")}
        </CardTitle>
        <CardDescription>
          {t("createQuestionsSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              {t("subject")} {formData.contextPriority !== "context_only" || !formData.uploadedContext ? "*" : "(Optional)"}
            </Label>
            <Input
              id="subject"
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
              type="number"
              min={1}
              max={20}
              value={formData.numQuestions}
              onChange={(e) =>
                setFormData({ ...formData, numQuestions: parseInt(e.target.value) || 1 })
              }
            />
            <p className="text-sm text-muted-foreground">{t("numQuestionsHelp")}</p>
          </div>

          {/* Question Types */}
          <div className="space-y-2">
            <Label>{t("questionTypes")} *</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Question type selection">
              <button
                type="button"
                onClick={() => toggleQuestionType("mcq")}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  formData.questionTypes.includes("mcq")
                    ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
                aria-pressed={formData.questionTypes.includes("mcq")}
              >
                {t("multipleChoice")}
              </button>
              <button
                type="button"
                onClick={() => toggleQuestionType("true_false")}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  formData.questionTypes.includes("true_false")
                    ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
                aria-pressed={formData.questionTypes.includes("true_false")}
              >
                {t("trueFalse")}
              </button>
              <button
                type="button"
                onClick={() => toggleQuestionType("longtextV2")}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  formData.questionTypes.includes("longtextV2")
                    ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
                aria-pressed={formData.questionTypes.includes("longtextV2")}
              >
                {t("essay")}
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
              placeholder={t("additionalContextPlaceholder")}
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              maxLength={2000}
              rows={4}
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
            <Label htmlFor="exportFormat">{t("exportFormat")}</Label>
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
          <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-medium">{t("tagsOrganization")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("tagsOrganizationHelp")}
              </p>
            </div>

            {/* Exam Center Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">{t("termPeriod")}</Label>
                <Input
                  id="term"
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
            className="w-full"
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
  )
}
