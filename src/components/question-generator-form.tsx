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

type QuestionType = "mcq" | "true_false" | "longtextV2"
type Difficulty = "easy" | "medium" | "hard"
type Language = "sv" | "en"

interface FormData {
  subject: string
  topic: string
  difficulty: Difficulty
  numQuestions: number
  questionTypes: QuestionType[]
  language: Language
  context?: string
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
  })
  const [isGenerating, setIsGenerating] = useState(false)

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
      // TODO: Call AI generation API
      console.log("Generating questions with:", formData)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
    } catch (error) {
      console.error("Generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
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
          </div>

          {/* Question Types */}
          <div className="space-y-2">
            <Label>Question Types *</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={formData.questionTypes.includes("mcq") ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleQuestionType("mcq")}
              >
                Multiple Choice
              </Badge>
              <Badge
                variant={formData.questionTypes.includes("true_false") ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleQuestionType("true_false")}
              >
                True/False
              </Badge>
              <Badge
                variant={formData.questionTypes.includes("longtextV2") ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleQuestionType("longtextV2")}
              >
                Essay
              </Badge>
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

          {/* Context (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Add any specific instructions, learning outcomes, or context for the questions..."
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              rows={4}
            />
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
