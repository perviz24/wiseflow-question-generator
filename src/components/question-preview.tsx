"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, FileText, Save, Download, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

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
  isSaving?: boolean
  isExporting?: boolean
}

export function QuestionPreview({ questions, metadata, onSave, onExport, isSaving, isExporting }: QuestionPreviewProps) {
  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      mcq: "Multiple Choice",
      true_false: "True/False",
      longtextV2: "Essay",
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
      {questions.map((question, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                  <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                </div>
                <CardTitle className="text-lg leading-relaxed">{question.stimulus}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* MCQ and True/False options */}
            {(question.type === "mcq" || question.type === "true_false") && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = question.correctAnswer?.includes(option.label)
                  return (
                    <div
                      key={optionIndex}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        isCorrect
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                          : "border-border"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="font-medium">{option.label}.</span>{" "}
                        <span>{option.value}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Essay guidance */}
            {question.type === "longtextV2" && question.instructorStimulus && (
              <>
                <Separator />
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Instructor Guidance
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {question.instructorStimulus}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
