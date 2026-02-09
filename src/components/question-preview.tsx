"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Circle, FileText, Save, Download, Loader2, Edit2, Check, X, RefreshCw, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useTranslation } from "@/lib/language-context"

interface Question {
  type: "mcq" | "true_false" | "longtextV2" | "short_answer" | "fill_blank" | "multiple_response" | "matching" | "ordering" | "hotspot" | "rating_scale"
  stimulus: string
  options?: Array<{
    label: string
    value: string
  }>
  correctAnswer?: string[]
  instructorStimulus?: string
}

interface QuestionPreviewProps {
  questions: Question[]
  metadata: {
    subject: string
    topic: string
    difficulty: string
    language: string
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
  const [additionalTypes, setAdditionalTypes] = useState<string[]>(["mcq"])
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [showMoreTypes, setShowMoreTypes] = useState(false)

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      mcq: "Multiple Choice",
      true_false: "True/False",
      longtextV2: "Essay",
      short_answer: "Short Answer",
      fill_blank: "Fill-in-the-blank",
      multiple_response: "Multiple Response",
      matching: "Matching",
      ordering: "Ordering/Sequencing",
      hotspot: "Hotspot",
      rating_scale: "Rating Scale",
    }
    return labels[type as keyof typeof labels] || type
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
              <Button onClick={onSave} variant="default" disabled={isSaving || isExporting}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Library
                  </>
                )}
              </Button>
              <Button onClick={onExport} variant="outline" disabled={isSaving || isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </>
                )}
              </Button>
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
