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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"
import { QuestionPreview } from "./question-preview"
import { ContentUpload } from "./content-upload"
import { toast } from "sonner"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { downloadWiseflowJSON } from "@/lib/wiseflow-export"

type QuestionType = "mcq" | "true_false" | "longtextV2"
type Difficulty = "easy" | "medium" | "hard"
type Language = "sv" | "en"
type ExportFormat = "legacy" | "utgaende"

interface FormData {
  subject: string
  topic: string
  difficulty: Difficulty
  numQuestions: number
  questionTypes: QuestionType[]
  language: Language
  context?: string
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
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    topic: "",
    difficulty: "medium",
    numQuestions: 5,
    questionTypes: ["mcq"],
    language: "sv",
    context: "",
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
    // Append uploaded content to the context field
    setFormData((prev) => ({
      ...prev,
      context: prev.context
        ? `${prev.context}\n\n---\nContent from ${source}:\n${content}`
        : `Content from ${source}:\n${content}`,
    }))
    setUploadedContentSource(source)
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
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      setGeneratedQuestions(data.questions)
      setMetadata(data.metadata)

      toast.success("Questions generated!", {
        description: `Successfully generated ${data.questions.length} questions.`,
      })
    } catch (error) {
      console.error("Generation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate questions. Please try again."
      toast.error("Generation failed", {
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

      toast.success("Questions saved!", {
        description: `Successfully saved ${result.count} questions to your library.`,
      })
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("Save failed", {
        description: "Failed to save questions. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
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

      downloadWiseflowJSON(generatedQuestions, exportMetadata)
      toast.success("Export successful!", {
        description: `Questions exported to Wiseflow JSON (${formData.exportFormat === "legacy" ? "Legacy" : "Utgående"} format).`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Export failed", {
        description: "Failed to export questions. Please try again.",
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
            Generate New Questions
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
          Generate Questions
        </CardTitle>
        <CardDescription>
          Create pedagogically sound exam questions using AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="e.g., Biology, Mathematics, History"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              autoComplete="off"
              required
            />
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Cell division, Algebra, World War II"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              autoComplete="off"
              required
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
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
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Questions */}
          <div className="space-y-2">
            <Label htmlFor="numQuestions">Number of Questions</Label>
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
            <p className="text-sm text-muted-foreground">Choose between 1 and 20 questions</p>
          </div>

          {/* Question Types */}
          <div className="space-y-2">
            <Label>Question Types *</Label>
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
                Multiple Choice
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
                True/False
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
                Essay
              </button>
            </div>
            {formData.questionTypes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Select at least one question type
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
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
                <SelectItem value="sv">Swedish</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Upload */}
          <ContentUpload onContentExtracted={handleContentExtracted} />

          {/* Context (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Add any specific instructions, learning outcomes, or context for the questions..."
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              maxLength={2000}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              {formData.context?.length || 0} / 2000 characters
            </p>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="exportFormat">Export Format</Label>
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
                <SelectItem value="legacy">Legacy (tags array)</SelectItem>
                <SelectItem value="utgaende">Utgående (labels with IDs)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the Wiseflow JSON format for your exam center
            </p>
          </div>

          {/* Tagging Section */}
          <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-medium">Tags & Organization</h3>
              <p className="text-xs text-muted-foreground">
                Auto-tags: Subject, Topic, Question Type, Difficulty, Language, Timestamp
              </p>
            </div>

            {/* Exam Center Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">Term/Period</Label>
                <Input
                  id="term"
                  placeholder="e.g., T3"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  placeholder="e.g., HT25"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examType">Exam Type</Label>
                <Input
                  id="examType"
                  placeholder="e.g., Ordinarie"
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  placeholder="e.g., BIO101"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Additional Tags */}
            <div className="space-y-2">
              <Label htmlFor="additionalTags">Additional Tags (Optional)</Label>
              <Input
                id="additionalTags"
                placeholder="e.g., Ögon, Makula, LO1 (comma-separated)"
                value={formData.additionalTags}
                onChange={(e) => setFormData({ ...formData, additionalTags: e.target.value })}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isGenerating ||
              !formData.subject ||
              !formData.topic ||
              formData.questionTypes.length === 0
            }
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
