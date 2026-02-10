"use client"

import { useState } from "react"

// Calculate points based on difficulty
function getPointsForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case "easy":
      return 1
    case "medium":
      return 1.5
    case "hard":
      return 2
    default:
      return 1
  }
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Circle, FileText, Save, Download, Loader2, Edit2, Check, X, RefreshCw, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useTranslation } from "@/lib/language-context"
import type { Translations } from "@/lib/translations"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { downloadWiseflowJSON } from "@/lib/wiseflow-export"
import { downloadQti21, downloadQti22 } from "@/lib/qti-export"
import { downloadCSV } from "@/lib/csv-export"

interface Question {
  type: "mcq" | "true_false" | "longtextV2" | "short_answer" | "fill_blank" | "multiple_response" | "matching" | "ordering" | "hotspot" | "rating_scale"
  stimulus: string
  options?: Array<{
    label: string
    value: string
  }>
  correctAnswer?: string[]
  instructorStimulus?: string
  points?: number
}

interface QuestionPreviewProps {
  questions: Question[]
  metadata: {
    subject: string
    topic: string
    difficulty: string
    language: string
    exportFormat?: "legacy" | "utgaende" | "qti21"
    term?: string
    semester?: string
    examType?: string
    courseCode?: string
    additionalTags?: string
    tutorInitials?: string
    includeAITag?: boolean
  }
  onSave?: () => void
  onExport?: () => void
  onUpdateQuestions?: (updatedQuestions: Question[]) => void
  isSaving?: boolean
  isExporting?: boolean
}

export function QuestionPreview({ questions, metadata, onSave, onExport, onUpdateQuestions, isSaving, isExporting }: QuestionPreviewProps) {
  const { t } = useTranslation()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const [additionalCount, setAdditionalCount] = useState(5)
  const [additionalTypes, setAdditionalTypes] = useState<string[]>([])
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [showMoreTypes, setShowMoreTypes] = useState(false)
  const [newAnswerInput, setNewAnswerInput] = useState("")
  const [isExportingFormat, setIsExportingFormat] = useState(false)
  const [editingPointsIndex, setEditingPointsIndex] = useState<number | null>(null)
  const [tempPoints, setTempPoints] = useState<string>("")

  const getQuestionTypeLabel = (type: string) => {
    const translationKeys: Record<string, keyof Translations> = {
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
    }
    const key = translationKeys[type]
    return key ? t(key) : type
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
      hard: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    }
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const handleEditClick = (index: number) => {
    setEditingIndex(index)
    setEditedQuestion({ ...questions[index] })
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditedQuestion(null)
  }

  const handlePointsEditClick = (index: number) => {
    const question = questions[index]
    const currentPoints = question.points ?? getPointsForDifficulty(metadata.difficulty)
    setEditingPointsIndex(index)
    setTempPoints(currentPoints.toString())
  }

  const handlePointsSave = (index: number) => {
    const parsedPoints = parseFloat(tempPoints)
    if (isNaN(parsedPoints) || parsedPoints <= 0) {
      toast.error("Invalid points", {
        description: "Please enter a valid positive number for points."
      })
      return
    }

    if (onUpdateQuestions) {
      const updatedQuestions = [...questions]
      updatedQuestions[index] = {
        ...questions[index],
        points: parsedPoints
      }
      onUpdateQuestions(updatedQuestions)
    }

    setEditingPointsIndex(null)
    setTempPoints("")
  }

  const handlePointsCancel = () => {
    setEditingPointsIndex(null)
    setTempPoints("")
  }

  const handleSaveEdit = () => {
    if (editingIndex === null || !editedQuestion || !onUpdateQuestions) return

    const updatedQuestions = [...questions]
    updatedQuestions[editingIndex] = editedQuestion
    onUpdateQuestions(updatedQuestions)

    setEditingIndex(null)
    setEditedQuestion(null)
  }

  const updateEditedOption = (optionIndex: number, field: 'label' | 'value', newValue: string) => {
    if (!editedQuestion || !editedQuestion.options) return

    const updatedOptions = [...editedQuestion.options]
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: newValue
    }

    setEditedQuestion({
      ...editedQuestion,
      options: updatedOptions
    })
  }

  const toggleCorrectAnswer = (label: string) => {
    if (!editedQuestion) return

    const currentAnswers = editedQuestion.correctAnswer || []
    const isCurrentlyCorrect = currentAnswers.includes(label)

    setEditedQuestion({
      ...editedQuestion,
      correctAnswer: isCurrentlyCorrect
        ? currentAnswers.filter(a => a !== label)
        : [...currentAnswers, label]
    })
  }

  const updateCorrectAnswerAtIndex = (index: number, value: string) => {
    if (!editedQuestion || !editedQuestion.correctAnswer) return

    const updatedAnswers = [...editedQuestion.correctAnswer]
    updatedAnswers[index] = value

    setEditedQuestion({
      ...editedQuestion,
      correctAnswer: updatedAnswers
    })
  }

  const removeCorrectAnswerAtIndex = (index: number) => {
    if (!editedQuestion || !editedQuestion.correctAnswer) return

    const updatedAnswers = editedQuestion.correctAnswer.filter((_, i) => i !== index)

    setEditedQuestion({
      ...editedQuestion,
      correctAnswer: updatedAnswers
    })
  }

  const addCorrectAnswer = (value: string) => {
    if (!editedQuestion || !value.trim()) return

    const currentAnswers = editedQuestion.correctAnswer || []

    setEditedQuestion({
      ...editedQuestion,
      correctAnswer: [...currentAnswers, value.trim()]
    })
  }

  const handleRegenerateAlternatives = async (index: number) => {
    const question = questions[index]

    // Only regenerate for MCQ and True/False questions
    if (question.type === "longtextV2") {
      toast.error("Cannot regenerate", {
        description: "Essay questions don't have answer options to regenerate."
      })
      return
    }

    setRegeneratingIndex(index)

    try {
      const response = await fetch("/api/regenerate-alternatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionType: question.type,
          questionText: question.stimulus,
          currentOptions: question.options,
          subject: metadata.subject,
          topic: metadata.topic,
          difficulty: metadata.difficulty,
          language: metadata.language,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Regeneration failed")
      }

      // Update the question with new options
      if (onUpdateQuestions) {
        const updatedQuestions = [...questions]
        updatedQuestions[index] = {
          ...question,
          options: data.options,
          correctAnswer: data.correctAnswer,
        }
        onUpdateQuestions(updatedQuestions)
      }

      toast.success("Alternatives regenerated!", {
        description: "New answer options have been generated for this question."
      })
    } catch (error) {
      console.error("Regeneration failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to regenerate alternatives"
      toast.error("Regeneration failed", {
        description: errorMessage
      })
    } finally {
      setRegeneratingIndex(null)
    }
  }

  const toggleAdditionalType = (type: string) => {
    setAdditionalTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleGenerateMore = async () => {
    if (additionalTypes.length === 0) {
      toast.error("No question types selected", {
        description: "Please select at least one question type to generate."
      })
      return
    }

    if (additionalCount < 1 || additionalCount > 20) {
      toast.error("Invalid number of questions", {
        description: "Please enter a number between 1 and 20."
      })
      return
    }

    setIsGeneratingMore(true)

    try {
      const response = await fetch("/api/generate-more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: metadata.subject,
          topic: metadata.topic,
          difficulty: metadata.difficulty,
          language: metadata.language,
          count: additionalCount,
          questionTypes: additionalTypes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate additional questions")
      }

      // Add new questions to existing ones
      if (onUpdateQuestions && data.questions) {
        const updatedQuestions = [...questions, ...data.questions]
        onUpdateQuestions(updatedQuestions)
        toast.success(`${data.questions.length} questions added!`, {
          description: "New questions have been added to your set."
        })
      }
    } catch (error) {
      console.error("Generate more failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate additional questions"
      toast.error("Generation failed", {
        description: errorMessage
      })
    } finally {
      setIsGeneratingMore(false)
    }
  }

  const handleExport = async (format: "wiseflow-legacy" | "wiseflow-utgaende" | "qti21" | "qti22" | "csv") => {
    setIsExportingFormat(true)

    try {
      if (format === "csv") {
        downloadCSV(questions, metadata)
        toast.success("CSV exported!", {
          description: "Questions exported in CSV format for Excel/Google Sheets."
        })
      } else if (format === "qti21") {
        await downloadQti21(questions, metadata)
        toast.success("QTI 2.1 exported!", {
          description: "Questions exported in QTI 2.1 format (ZIP file)."
        })
      } else if (format === "qti22") {
        await downloadQti22(questions, metadata)
        toast.success("QTI 2.2 Inspera exported!", {
          description: "Questions exported in QTI 2.2 Inspera format (ZIP file)."
        })
      } else {
        // Wiseflow JSON formats
        const exportFormat = format === "wiseflow-legacy" ? "legacy" : "utgaende"
        downloadWiseflowJSON(questions, {
          ...metadata,
          exportFormat
        })
        const formatName = exportFormat === "legacy" ? "Legacy" : "Utgående"
        toast.success(`Wiseflow JSON (${formatName}) exported!`, {
          description: "Questions exported in Wiseflow innehållsbank format."
        })
      }
    } catch (error) {
      console.error("Export failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to export questions"
      toast.error("Export failed", {
        description: errorMessage
      })
    } finally {
      setIsExportingFormat(false)
    }
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header with metadata */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Generated Questions</CardTitle>
              <CardDescription>
                {questions.length} {questions.length === 1 ? "question" : "questions"} about{" "}
                {metadata.topic}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSave} variant="default" disabled={isSaving || isExportingFormat} size="sm" className="h-9">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Save to Library</span>
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isSaving || isExportingFormat} size="sm" className="h-9">
                    {isExportingFormat ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                        <span className="hidden sm:inline">Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                        <ChevronDown className="ml-2 h-4 w-4 hidden sm:inline" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("wiseflow-legacy")}>
                    Wiseflow JSON (Legacy)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("wiseflow-utgaende")}>
                    Wiseflow JSON (Utgående)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("qti21")}>
                    QTI 2.1 (ZIP)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("qti22")}>
                    QTI 2.2 Inspera (ZIP)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    CSV (Excel/Sheets)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <FileText className="mr-1 h-3 w-3" />
              {metadata.subject}
            </Badge>
            <Badge className={getDifficultyColor(metadata.difficulty)}>
              {metadata.difficulty}
            </Badge>
            <Badge variant="secondary">
              {metadata.language === "sv" ? "Swedish" : "English"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Question cards */}
      {questions.map((question, index) => {
        const isEditing = editingIndex === index
        const displayQuestion = isEditing && editedQuestion ? editedQuestion : question

        return (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                    {editingPointsIndex === index ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={tempPoints}
                          onChange={(e) => setTempPoints(e.target.value)}
                          className="h-6 w-16 text-xs px-2"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handlePointsSave(index)
                            } else if (e.key === "Escape") {
                              handlePointsCancel()
                            }
                          }}
                        />
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handlePointsSave(index)}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handlePointsCancel}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-purple-100 dark:bg-purple-950 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900"
                        onClick={() => handlePointsEditClick(index)}
                      >
                        {question.points ?? getPointsForDifficulty(metadata.difficulty)} {t("points").toLowerCase()}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                  </div>
                  {isEditing ? (
                    <Textarea
                      value={editedQuestion?.stimulus || ""}
                      onChange={(e) => setEditedQuestion(editedQuestion ? { ...editedQuestion, stimulus: e.target.value } : null)}
                      className="text-lg leading-relaxed min-h-[80px]"
                    />
                  ) : (
                    <CardTitle className="text-lg leading-relaxed">{question.stimulus}</CardTitle>
                  )}
                </div>
                <div className="ml-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditClick(index)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {(question.type === "mcq" || question.type === "true_false") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRegenerateAlternatives(index)}
                          disabled={regeneratingIndex === index}
                        >
                          {regeneratingIndex === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* MCQ and True/False options */}
              {(displayQuestion.type === "mcq" || displayQuestion.type === "true_false") && displayQuestion.options && (
                <div className="space-y-2">
                  {displayQuestion.options.map((option, optionIndex) => {
                    const isCorrect = displayQuestion.correctAnswer?.includes(option.label)
                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-start gap-3 rounded-lg border p-3 ${
                          isCorrect
                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                            : "border-border"
                        }`}
                      >
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => toggleCorrectAnswer(option.label)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        ) : (
                          isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          )
                        )}
                        <div className="flex-1 flex items-center gap-2">
                          <span className="font-medium flex-shrink-0">{option.label}.</span>
                          {isEditing ? (
                            <Input
                              value={option.value}
                              onChange={(e) => updateEditedOption(optionIndex, 'value', e.target.value)}
                              className="flex-1"
                            />
                          ) : (
                            <span>{option.value}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Essay guidance */}
              {displayQuestion.type === "longtextV2" && displayQuestion.instructorStimulus && (
                <>
                  <Separator />
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Instructor Guidance
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={editedQuestion?.instructorStimulus || ""}
                        onChange={(e) => setEditedQuestion(editedQuestion ? { ...editedQuestion, instructorStimulus: e.target.value } : null)}
                        className="text-sm bg-white dark:bg-blue-950"
                      />
                    ) : (
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {question.instructorStimulus}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Multiple Response - show options with multiple correct answers */}
              {displayQuestion.type === "multiple_response" && displayQuestion.options && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {displayQuestion.options.map((option, optionIndex) => {
                      const isCorrect = displayQuestion.correctAnswer?.includes(option.label)
                      return (
                        <div
                          key={optionIndex}
                          className={`flex items-start gap-3 rounded-lg border p-3 ${
                            isCorrect
                              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                              : "border-border"
                          }`}
                        >
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => toggleCorrectAnswer(option.label)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                isCorrect ? "bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700" : ""
                              }`}>
                                {isCorrect && (
                                  <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ) : (
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border mt-0.5 ${
                              isCorrect ? "bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700" : ""
                            }`}>
                              {isCorrect && (
                                <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          )}
                          <div className="flex-1 flex items-center gap-2">
                            <span className="font-medium flex-shrink-0">{option.label}.</span>
                            {isEditing ? (
                              <Input
                                value={option.value}
                                onChange={(e) => updateEditedOption(optionIndex, 'value', e.target.value)}
                                className="flex-1"
                              />
                            ) : (
                              <span>{option.value}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <p className="text-xs text-muted-foreground mt-2">
                      ✓ Multiple correct answers possible
                    </p>
                  </div>
                </>
              )}

              {/* Matching - show pairs of terms and definitions */}
              {displayQuestion.type === "matching" && displayQuestion.options && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium mb-3">Match the following pairs:</p>
                    <div className="grid grid-cols-1 gap-3">
                      {displayQuestion.options.map((option, optionIndex) => (
                        <Card key={optionIndex} className="p-3 bg-muted/50">
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium shrink-0">Term:</span>
                                <Input
                                  value={option.label}
                                  onChange={(e) => updateEditedOption(optionIndex, 'label', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium shrink-0">Match:</span>
                                <Input
                                  value={option.value}
                                  onChange={(e) => updateEditedOption(optionIndex, 'value', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0">{option.label}</Badge>
                              <p className="text-sm">{option.value}</p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                    {displayQuestion.correctAnswer && displayQuestion.correctAnswer.length > 0 && (
                      <Card className="p-3 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800 mt-2">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                          ✓ Correct pairs:
                        </p>
                        {isEditing ? (
                          <Textarea
                            value={displayQuestion.correctAnswer.join(", ")}
                            onChange={(e) => setEditedQuestion(editedQuestion ? {
                              ...editedQuestion,
                              correctAnswer: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                            } : null)}
                            className="text-sm bg-white dark:bg-gray-950 min-h-[60px]"
                            placeholder="e.g., A-1, B-2, C-3"
                          />
                        ) : (
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {displayQuestion.correctAnswer.join(", ")}
                          </p>
                        )}
                      </Card>
                    )}
                  </div>
                </>
              )}

              {/* Ordering - show sequence of items */}
              {displayQuestion.type === "ordering" && displayQuestion.options && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium mb-3">Arrange in correct order:</p>
                    {displayQuestion.options.map((option, optionIndex) => {
                      const correctPosition = displayQuestion.correctAnswer?.indexOf(option.label)
                      return (
                        <Card key={optionIndex} className="p-3 bg-muted/50">
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="1"
                                max={displayQuestion.options?.length || 1}
                                value={correctPosition !== undefined && correctPosition !== -1 ? correctPosition + 1 : ""}
                                onChange={(e) => {
                                  const newPosition = parseInt(e.target.value) - 1
                                  if (!editedQuestion || !editedQuestion.correctAnswer || !editedQuestion.options) return

                                  const newOrder = [...editedQuestion.correctAnswer]
                                  const currentIndex = newOrder.indexOf(option.label)

                                  if (currentIndex !== -1) {
                                    newOrder.splice(currentIndex, 1)
                                  }

                                  if (newPosition >= 0 && newPosition < editedQuestion.options.length) {
                                    newOrder.splice(newPosition, 0, option.label)
                                  }

                                  setEditedQuestion({
                                    ...editedQuestion,
                                    correctAnswer: newOrder
                                  })
                                }}
                                className="w-16 shrink-0"
                              />
                            ) : (
                              <Badge variant="default" className="shrink-0 bg-blue-600">
                                {correctPosition !== undefined && correctPosition !== -1 ? correctPosition + 1 : "?"}
                              </Badge>
                            )}
                            {isEditing ? (
                              <Input
                                value={option.value}
                                onChange={(e) => updateEditedOption(optionIndex, 'value', e.target.value)}
                                className="flex-1"
                              />
                            ) : (
                              <p className="text-sm flex-1">{option.value}</p>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                    <p className="text-xs text-muted-foreground mt-2">
                      {isEditing ? "Enter position numbers (1, 2, 3...)" : "Numbers show the correct sequence"}
                    </p>
                  </div>
                </>
              )}

              {/* Hotspot - show description of image/diagram */}
              {displayQuestion.type === "hotspot" && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                            Image-based question
                          </p>
                          {isEditing ? (
                            <Textarea
                              value={editedQuestion?.instructorStimulus || ""}
                              onChange={(e) => setEditedQuestion(editedQuestion ? { ...editedQuestion, instructorStimulus: e.target.value } : null)}
                              className="text-sm bg-white dark:bg-amber-950"
                            />
                          ) : (
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              {displayQuestion.instructorStimulus || "Click or tap on the correct area of the image/diagram"}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                    {displayQuestion.correctAnswer && displayQuestion.correctAnswer.length > 0 && (
                      <Card className="p-3 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                          ✓ Correct area(s):
                        </p>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {displayQuestion.correctAnswer.map((area, index) => (
                                <Badge key={index} variant="outline" className="bg-white dark:bg-gray-950">
                                  {area}
                                  <button
                                    type="button"
                                    onClick={() => removeCorrectAnswerAtIndex(index)}
                                    className="ml-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                value={newAnswerInput}
                                onChange={(e) => setNewAnswerInput(e.target.value)}
                                placeholder="Add area name..."
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    addCorrectAnswer(newAnswerInput)
                                    setNewAnswerInput("")
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  addCorrectAnswer(newAnswerInput)
                                  setNewAnswerInput("")
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {displayQuestion.correctAnswer.join(", ")}
                          </p>
                        )}
                      </Card>
                    )}
                  </div>
                </>
              )}

              {/* Fill-in-the-blank - show blanks with answers */}
              {displayQuestion.type === "fill_blank" && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <Card className="p-4 bg-muted/50">
                      <p className="text-sm whitespace-pre-wrap">
                        {displayQuestion.stimulus.split("[___]").map((part, index, array) => (
                          <span key={index}>
                            {part}
                            {index < array.length - 1 && (
                              <span className="inline-block mx-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded text-blue-700 dark:text-blue-300 font-medium">
                                [{index + 1}]
                              </span>
                            )}
                          </span>
                        ))}
                      </p>
                    </Card>
                    {displayQuestion.correctAnswer && displayQuestion.correctAnswer.length > 0 && (
                      <Card className="p-3 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                          ✓ Correct answers:
                        </p>
                        {isEditing ? (
                          <div className="space-y-2">
                            {displayQuestion.correctAnswer.map((answer, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-white dark:bg-gray-950 shrink-0">
                                  [{index + 1}]
                                </Badge>
                                <Input
                                  value={answer}
                                  onChange={(e) => updateCorrectAnswerAtIndex(index, e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeCorrectAnswerAtIndex(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <div className="flex items-center gap-2">
                              <Input
                                value={newAnswerInput}
                                onChange={(e) => setNewAnswerInput(e.target.value)}
                                placeholder="Add new answer..."
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    addCorrectAnswer(newAnswerInput)
                                    setNewAnswerInput("")
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  addCorrectAnswer(newAnswerInput)
                                  setNewAnswerInput("")
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {displayQuestion.correctAnswer.map((answer, index) => (
                              <Badge key={index} variant="outline" className="bg-white dark:bg-gray-950">
                                [{index + 1}] {answer}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                </>
              )}

              {/* Short Answer - show text input field */}
              {displayQuestion.type === "short_answer" && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <Card className="p-4 bg-muted/50">
                      <Textarea
                        readOnly
                        placeholder="Student writes 1-3 sentence answer here..."
                        className="min-h-[80px] resize-none"
                      />
                    </Card>
                    {displayQuestion.correctAnswer && displayQuestion.correctAnswer.length > 0 && (
                      <Card className="p-3 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                          ✓ Sample answer:
                        </p>
                        {isEditing ? (
                          <Textarea
                            value={displayQuestion.correctAnswer.join(", ")}
                            onChange={(e) => setEditedQuestion(editedQuestion ? {
                              ...editedQuestion,
                              correctAnswer: [e.target.value]
                            } : null)}
                            className="text-sm bg-white dark:bg-gray-950 min-h-[60px]"
                          />
                        ) : (
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {displayQuestion.correctAnswer.join(", ")}
                          </p>
                        )}
                      </Card>
                    )}
                  </div>
                </>
              )}

              {/* Rating Scale - show Likert scale */}
              {displayQuestion.type === "rating_scale" && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center justify-between gap-4">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const isCorrect = displayQuestion.correctAnswer?.includes(rating.toString())
                          return (
                            <div key={rating} className="flex flex-col items-center gap-2">
                              {isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => toggleCorrectAnswer(rating.toString())}
                                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 ${
                                    isCorrect
                                      ? "bg-green-100 border-green-500 dark:bg-green-900/50 dark:border-green-600"
                                      : "border-gray-300 dark:border-gray-700"
                                  }`}
                                >
                                  <span className={`font-semibold ${isCorrect ? "text-green-700 dark:text-green-300" : ""}`}>
                                    {rating}
                                  </span>
                                </button>
                              ) : (
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                  isCorrect
                                    ? "bg-green-100 border-green-500 dark:bg-green-900/50 dark:border-green-600"
                                    : "border-gray-300 dark:border-gray-700"
                                }`}>
                                  <span className={`font-semibold ${isCorrect ? "text-green-700 dark:text-green-300" : ""}`}>
                                    {rating}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {rating === 1 ? "Low" : rating === 5 ? "High" : ""}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                    {displayQuestion.correctAnswer && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ Expected rating: {displayQuestion.correctAnswer.join(", ")}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Generate More Questions Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">{t("generateMoreTitle")}</CardTitle>
          <CardDescription>
            {t("generateMoreDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number of questions */}
            <div className="space-y-2">
              <label htmlFor="additional-count" className="text-sm font-medium">
                {t("howManyMore")}
              </label>
              <Input
                id="additional-count"
                type="number"
                min="1"
                max="20"
                value={additionalCount}
                onChange={(e) => setAdditionalCount(parseInt(e.target.value) || 1)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">{t("chooseBetween")}</p>
            </div>

            {/* Question types */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("questionTypes")}</label>
              <div className="flex flex-wrap gap-2">
                {/* First 3 classic types - always visible */}
                <Button
                  type="button"
                  variant={additionalTypes.includes("mcq") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAdditionalType("mcq")}
                  className="flex-1 min-w-[100px]"
                >
                  {t("questionType_mcq")}
                </Button>
                <Button
                  type="button"
                  variant={additionalTypes.includes("true_false") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAdditionalType("true_false")}
                  className="flex-1 min-w-[100px]"
                >
                  {t("questionType_trueFalse")}
                </Button>
                <Button
                  type="button"
                  variant={additionalTypes.includes("longtextV2") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAdditionalType("longtextV2")}
                  className="flex-1 min-w-[100px]"
                >
                  {t("questionType_essay")}
                </Button>

                {/* Expandable additional types */}
                {showMoreTypes && (
                  <>
                    <Button
                      type="button"
                      variant={additionalTypes.includes("short_answer") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAdditionalType("short_answer")}
                      className="flex-1 min-w-[100px]"
                    >
                      {t("questionType_shortAnswer")}
                    </Button>
                    <Button
                      type="button"
                      variant={additionalTypes.includes("fill_blank") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAdditionalType("fill_blank")}
                      className="flex-1 min-w-[100px]"
                    >
                      {t("questionType_fillBlank")}
                    </Button>
                    <Button
                      type="button"
                      variant={additionalTypes.includes("multiple_response") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAdditionalType("multiple_response")}
                      className="flex-1 min-w-[100px]"
                    >
                      {t("questionType_multipleResponse")}
                    </Button>
                    <Button
                      type="button"
                      variant={additionalTypes.includes("matching") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAdditionalType("matching")}
                      className="flex-1 min-w-[100px]"
                    >
                      {t("questionType_matching")}
                    </Button>
                    <Button
                      type="button"
                      variant={additionalTypes.includes("ordering") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAdditionalType("ordering")}
                      className="flex-1 min-w-[100px]"
                    >
                      {t("questionType_ordering")}
                    </Button>
                    <Button
                      type="button"
                      variant={additionalTypes.includes("hotspot") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAdditionalType("hotspot")}
                      className="flex-1 min-w-[100px]"
                    >
                      {t("questionType_hotspot")}
                    </Button>
                    <Button
                      type="button"
                      variant={additionalTypes.includes("rating_scale") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAdditionalType("rating_scale")}
                      className="flex-1 min-w-[100px]"
                    >
                      {t("questionType_ratingScale")}
                    </Button>
                  </>
                )}
              </div>

              {/* Toggle button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMoreTypes(!showMoreTypes)}
                className="w-full mt-2"
              >
                {showMoreTypes ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    {t("showLessTypes")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    {t("showMoreTypes")}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">{t("selectOneOrMore")}</p>
            </div>
          </div>

          <Button
            onClick={handleGenerateMore}
            disabled={isGeneratingMore || additionalTypes.length === 0}
            className="w-full"
            size="lg"
          >
            {isGeneratingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("generatingMore", { count: additionalCount })}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {t("generateNew")} ({additionalCount})
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
