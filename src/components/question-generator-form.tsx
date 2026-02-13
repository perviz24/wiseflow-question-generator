"use client"

import { useState, useEffect } from "react"

// Generate a concise 2-3 word title from question text (e.g. "Vitreous structure")
function generateQuestionTitle(stimulus: string, type: string): string {
  const plainText = stimulus.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()

  // Broad stop words: common EN + SV words + question phrasing words
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up',
    'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'what',
    'it', 'its', 'my', 'your', 'his', 'her', 'our', 'their', 'me', 'him',
    'she', 'he', 'we', 'they', 'them', 'i', 'you',
    'en', 'ett', 'den', 'det', 'de', 'och', 'eller', 'men', 'som', 'att',
    'är', 'var', 'har', 'hade', 'kan', 'ska', 'vill', 'med', 'för', 'på',
    'av', 'till', 'från', 'om', 'inte', 'vid', 'efter', 'under', 'över',
    'mellan', 'utan', 'inom', 'bland', 'hos', 'mot', 'genom', 'sedan',
    'denna', 'detta', 'dessa', 'vilken', 'vilket', 'vilka', 'vad', 'hur',
    'när', 'där', 'här', 'varför', 'alla', 'andra', 'några', 'också',
    'sig', 'sin', 'sitt', 'sina', 'dig', 'mig', 'oss', 'dem',
    'following', 'statement', 'statements', 'correct', 'correctly',
    'true', 'false', 'answer', 'answers', 'question', 'questions',
    'explain', 'describe', 'select', 'choose', 'identify', 'regarding',
    'concerning', 'associated', 'directly', 'primarily', 'typically',
    'förklara', 'beskriv', 'välj', 'ange', 'fråga', 'svar', 'rätt',
    'sant', 'falskt', 'påstående', 'följande', 'avseende', 'gällande',
    'direkt', 'strukturer', 'fenomen',
  ])

  // Extract meaningful words (4+ chars to skip short common words)
  const words = plainText
    .split(/[\s,.:;!?()\[\]{}'"\/\\]+/)
    .map(w => w.replace(/[^a-zA-ZåäöÅÄÖéèêüû0-9-]/g, ''))
    .filter(w => w.length >= 4 && !stopWords.has(w.toLowerCase()) && !/^\d+$/.test(w))

  // Prioritize longer words (likely domain-specific terms like "vitreous", "presbyopi")
  const scored = words.map((w, i) => ({
    word: w,
    score: w.length + (i < 5 ? 3 - i * 0.5 : 0), // bonus for appearing early
  }))
  scored.sort((a, b) => b.score - a.score)

  // Take top 2-3 unique terms, max 40 chars total
  const seen = new Set<string>()
  const keywords: string[] = []
  for (const item of scored) {
    const lower = item.word.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    keywords.push(item.word)
    if (keywords.length >= 3) break
    if (keywords.join(' ').length > 35) break
  }

  if (keywords.length === 0) {
    const typeLabels: Record<string, string> = {
      mcq: 'MCQ', true_false: 'T/F', longtextV2: 'Essä',
      short_answer: 'Kort svar', fill_blank: 'Ifyllnad', multiple_response: 'Flera rätt',
      matching: 'Matchning', ordering: 'Ordning', hotspot: 'Hotspot', rating_scale: 'Skala',
    }
    return `${typeLabels[type] || type} - ${plainText.substring(0, 30)}`
  }

  // Capitalize first keyword
  return keywords.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ')
}

// Calculate default score based on difficulty
function getDefaultScore(difficulty: "easy" | "medium" | "hard"): number {
  switch (difficulty) {
    case "easy":
      return 1
    case "medium":
      return 2
    case "hard":
      return 3
    default:
      return 1
  }
}
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
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, Sparkles, Info, ChevronDown, ChevronUp, Upload, RotateCcw } from "lucide-react"
import { QuestionPreview } from "./question-preview"
import { ContentUpload } from "./content-upload"
import { toast } from "sonner"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { downloadWiseflowJSON } from "@/lib/wiseflow-export"
import { downloadQti21 } from "@/lib/qti-export"
import { useTranslation } from "@/lib/language-context"
import type { Translations } from "@/lib/translations"
import { QUESTION_TYPES, normalizeEnabledTypes } from "@/lib/question-types"

// Map question type IDs to their translation keys
const TYPE_TRANSLATION_KEY: Record<string, string> = {
  mcq: "questionType_mcq",
  true_false: "questionType_trueFalse",
  longtextV2: "questionType_essay",
  short_answer: "questionType_shortAnswer",
  fill_blank: "questionType_fillBlank",
  multiple_response: "questionType_multipleResponse",
  matching: "questionType_matching",
  ordering: "questionType_ordering",
  hotspot: "questionType_hotspot",
  rating_scale: "questionType_ratingScale",
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

type QuestionType = string // Question type ID from question-types.ts registry
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
  includeAITag: boolean // Whether to include "AI-generated" tag
  includeLanguageTag: boolean // Whether to include language tag (e.g., "Svenska")
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

// Core type IDs shown before "show more" toggle
const PRIMARY_TYPE_IDS = ["mcq", "true_false", "longtextV2"]

/** Renders type toggle buttons from the QUESTION_TYPES registry, filtered by user profile */
function QuestionTypeSelector({
  selectedTypes,
  onToggleType,
  enabledTypes,
  showMore,
  onToggleShowMore,
  t,
}: {
  selectedTypes: string[]
  onToggleType: (type: string) => void
  enabledTypes: string[]
  showMore: boolean
  onToggleShowMore: () => void
  t: (key: keyof Translations, params?: Record<string, string | number>) => string
}) {
  // Split enabled types into primary (always visible) and secondary (under "show more")
  const primaryTypes = enabledTypes.filter((id) => PRIMARY_TYPE_IDS.includes(id))
  const secondaryTypes = enabledTypes.filter((id) => !PRIMARY_TYPE_IDS.includes(id))

  const tierBorderClass = (typeId: string) => {
    const def = QUESTION_TYPES[typeId]
    if (!def) return ""
    if (def.tier === "specialized") return "ring-1 ring-amber-400/50"
    if (def.tier === "extended") return "ring-1 ring-blue-400/50"
    return ""
  }

  const renderTypeButton = (typeId: string) => {
    const translationKey = TYPE_TRANSLATION_KEY[typeId]
    const label = translationKey ? t(translationKey as keyof Translations) : typeId

    return (
      <button
        key={typeId}
        type="button"
        onClick={() => onToggleType(typeId)}
        className={`inline-flex items-center justify-center rounded-full px-3 sm:px-2.5 py-1.5 sm:py-0.5 text-xs font-semibold transition-colors touch-action-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${tierBorderClass(typeId)} ${
          selectedTypes.includes(typeId)
            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        }`}
        aria-pressed={selectedTypes.includes(typeId)}
      >
        {label}
      </button>
    )
  }

  return (
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
              {t("questionTypesHelp") || "Select one or more question types to generate. You can mix different types in the same set."}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="space-y-3">
        {/* Primary types — always visible */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Question type selection">
          {primaryTypes.map(renderTypeButton)}
        </div>

        {/* Secondary types — collapsible */}
        {showMore && secondaryTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Additional question types">
            {secondaryTypes.map(renderTypeButton)}
          </div>
        )}

        {/* Toggle button */}
        {secondaryTypes.length > 0 && (
          <button
            type="button"
            onClick={onToggleShowMore}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showMore ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                {t("showLessTypes")}
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                {t("showMoreTypes")} (+{secondaryTypes.length})
              </>
            )}
          </button>
        )}
      </div>
      {selectedTypes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("questionTypesHelp")}
        </p>
      )}
    </div>
  )
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
    includeAITag: true, // Default to true (include AI-generated tag)
    includeLanguageTag: true, // Default to true (include language tag like "Svenska")
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
  const [generationProgress, setGenerationProgress] = useState(0)

  // Simulate progress bar during generation
  useEffect(() => {
    if (!isGenerating) {
      setGenerationProgress(0)
      return
    }
    setGenerationProgress(5)
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) return prev // cap at 90%, jump to 100% when done
        return prev + Math.random() * 8 + 2
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [isGenerating])

  const saveQuestionsMutation = useMutation(api.questions.saveQuestions)
  const userProfile = useQuery(api.profiles.getUserProfile)

  // Load persisted preview session on mount
  useEffect(() => {
    const savedPreview = localStorage.getItem("wiseflow-preview-session")
    if (savedPreview) {
      try {
        const { questions, metadata: savedMetadata } = JSON.parse(savedPreview)
        if (questions && savedMetadata) {
          setGeneratedQuestions(questions)
          setMetadata(savedMetadata)
        }
      } catch (error) {
        console.error("Failed to load preview session:", error)
        localStorage.removeItem("wiseflow-preview-session")
      }
    }
  }, [])

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

    // Clear previous preview session when generating new questions
    localStorage.removeItem("wiseflow-preview-session")

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

      // Persist preview session to localStorage
      localStorage.setItem("wiseflow-preview-session", JSON.stringify({
        questions: data.questions,
        metadata: data.metadata
      }))

      setGenerationProgress(100)
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
      const isSv = metadata.language === "sv"

      // Translate difficulty to display name (single language, not raw "hard"/"easy")
      const difficultyMap: Record<string, [string, string]> = {
        easy: ["Easy", "Lätt"], medium: ["Medium", "Medel"], hard: ["Hard", "Svår"],
      }
      const diffEntry = difficultyMap[metadata.difficulty]
      const difficultyTag = diffEntry ? (isSv ? diffEntry[1] : diffEntry[0]) : metadata.difficulty

      // Translate question type to display name using translation keys (all 18+ types)
      const getTypeTag = (typeId: string): string => {
        const key = TYPE_TRANSLATION_KEY[typeId]
        return key ? t(key as keyof Translations) : typeId
      }

      // Build base auto-tags with TRANSLATED values (same for all questions)
      const languageTag = formData.includeLanguageTag ? (isSv ? "Svenska" : "English") : null
      const baseAutoTags = [
        metadata.subject,
        metadata.topic,
        difficultyTag,
        languageTag,
        formData.term,
        formData.semester,
        formData.examType,
        formData.courseCode,
      ].filter((tag): tag is string => Boolean(tag)) // Remove empty strings

      // Parse custom tags from comma-separated string
      const customTags = formData.additionalTags
        ? formData.additionalTags.split(',').map(tag => tag.trim()).filter((tag): tag is string => Boolean(tag))
        : []

      // Add AI-generated tag if requested
      const aiTag = formData.includeAITag ? (isSv ? 'AI-genererad' : 'AI-generated') : null

      // Transform questions to match Convex schema
      const questionsToSave = generatedQuestions.map((q) => {
        // Translate type to display name for tags (e.g., "Sant/Falskt" not "true_false")
        const typeTag = getTypeTag(q.type)
        // Combine all tags with translated display names only
        const allTags = [...baseAutoTags, typeTag, ...customTags, ...(aiTag ? [aiTag] : [])]

        return {
          title: generateQuestionTitle(q.stimulus, q.type),
          subject: metadata.subject,
          difficulty: metadata.difficulty as "easy" | "medium" | "hard",
          language: metadata.language as "sv" | "en",
          tags: allTags,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: q.type as any, // Type validated by question-types.ts registry
          stimulus: q.stimulus,
          options: q.options,
          correctAnswer: q.correctAnswer,
          shuffleOptions: q.type === "mcq",
          maxLength: q.type === "longtextV2" ? 5000 : undefined,
          formattingOptions: q.type === "longtextV2" ? ["bold", "italic", "underline"] : undefined,
          instructorStimulus: q.instructorStimulus,
          submitOverLimit: false,
          score: getDefaultScore(metadata.difficulty as "easy" | "medium" | "hard"),
          minScore: 0,
          maxScore: getDefaultScore(metadata.difficulty as "easy" | "medium" | "hard"),
          tutorInitials: userProfile?.tutorInitials || "N/A",
          generatedBy: "ai" as const,
        }
      })

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
        tutorInitials: userProfile?.tutorInitials || "N/A",
        includeAITag: formData.includeAITag,
        includeLanguageTag: formData.includeLanguageTag,
      }

      // Choose export format based on user selection
      if (formData.exportFormat === "qti21") {
        await downloadQti21(generatedQuestions, exportMetadata)
      } else {
        downloadWiseflowJSON(generatedQuestions, exportMetadata)
      }

      const formatLabel = formData.exportFormat === "legacy" ? "New Wiseflow JSON" : formData.exportFormat === "utgaende" ? "Legacy JSON" : "QTI 2.1"
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
    // Clear persisted preview session
    localStorage.removeItem("wiseflow-preview-session")
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
          metadata={{
            ...metadata,
            includeAITag: formData.includeAITag,
            includeLanguageTag: formData.includeLanguageTag,
            tutorInitials: userProfile?.tutorInitials || "N/A",
            term: formData.term,
            semester: formData.semester,
            examType: formData.examType,
            courseCode: formData.courseCode,
            additionalTags: formData.additionalTags,
          }}
          onSave={handleSave}
          onExport={handleExport}
          onUpdateQuestions={handleUpdateQuestions}
          isSaving={isSaving}
          isExporting={isExporting}
        />
        <div className="flex justify-center">
          <Button
            onClick={() => {
              localStorage.removeItem("wiseflow-preview-session")
              window.location.href = "/"
            }}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("startOver")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-border hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 drop-shadow-sm" />
            <span className="truncate bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{t("generateQuestions")}</span>
          </CardTitle>
          <div className="mt-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              ℹ️ {t("aiModeInfo")}
            </p>
          </div>
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
                <SelectItem value="easy">
                  <span className="flex items-center justify-between w-full gap-4">
                    <span>{t("easy")}</span>
                    <span className="text-xs text-muted-foreground">1 poäng</span>
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center justify-between w-full gap-4">
                    <span>{t("medium")}</span>
                    <span className="text-xs text-muted-foreground">2 {t("points").toLowerCase()}</span>
                  </span>
                </SelectItem>
                <SelectItem value="hard">
                  <span className="flex items-center justify-between w-full gap-4">
                    <span>{t("hard")}</span>
                    <span className="text-xs text-muted-foreground">3 {t("points").toLowerCase()}</span>
                  </span>
                </SelectItem>
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

          {/* Question Types — dynamically rendered from registry, filtered by profile */}
          <QuestionTypeSelector
            selectedTypes={formData.questionTypes}
            onToggleType={toggleQuestionType}
            enabledTypes={normalizeEnabledTypes(userProfile?.enabledQuestionTypes as string[] | undefined)}
            showMore={showMoreQuestionTypes}
            onToggleShowMore={() => setShowMoreQuestionTypes(!showMoreQuestionTypes)}
            t={t}
          />

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

          {/* Content Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">{t("uploadSectionTitle")}</Label>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("combineSources")}
            </p>
            <ContentUpload
              onContentExtracted={handleContentExtracted}
              onContentRemoved={handleContentRemoved}
            />
          </div>

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
              <p
                className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900"
                dangerouslySetInnerHTML={{ __html: t("contextGuidanceTip") }}
              />
            )}
            <div className="text-xs text-muted-foreground whitespace-pre-line bg-muted/50 p-3 rounded-md border border-border">
              {t("additionalContextTips")}
            </div>
          </div>


          {/* Tagging Section */}
          <div className="space-y-4 rounded-lg border-2 border-border bg-muted/50 p-4 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground">{t("tagsOrganization")}</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="h-3.5 w-3.5" />
                      <span className="sr-only">Tagging information</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      These tags help organize your exported questions. All fields are optional and will be included in the export.
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

            {/* Optional Tag Toggles */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAITag"
                  checked={formData.includeAITag}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, includeAITag: checked as boolean })
                  }
                />
                <Label
                  htmlFor="includeAITag"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t("includeAITag")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeLanguageTag"
                  checked={formData.includeLanguageTag}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, includeLanguageTag: checked as boolean })
                  }
                />
                <Label
                  htmlFor="includeLanguageTag"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t("includeLanguageTag")}
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Button with Progress */}
          <div className="space-y-2">
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
            {isGenerating && (
              <div className="space-y-1.5">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground animate-pulse">
                  {t("generatingProgress")}
                </p>
              </div>
            )}
            {/* Start Over — reset form and preview */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem("wiseflow-preview-session")
                window.location.href = "/"
              }}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {t("startOver")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}
