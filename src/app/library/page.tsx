"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, BookOpen, Calendar, Tag, Download, Edit2, Check, X, CheckCircle2, Circle, Trash2, Filter, FileText } from "lucide-react"
import { useTranslation } from "@/lib/language-context"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { sanitizeHtml } from "@/lib/sanitize"
import { FeedbackButton } from "@/components/feedback-button"
import Link from "next/link"
import { toast } from "sonner"
import { Id } from "../../../convex/_generated/dataModel"
import { exportToWiseflowJSON } from "@/lib/wiseflow-export"
import { exportToQti21, exportToQti22 } from "@/lib/qti-export"
import { exportToWord } from "@/lib/word-export"
import { downloadCSV } from "@/lib/csv-export"

interface EditState {
  questionId: string
  stimulus: string
  options?: Array<{ label: string; value: string }>
  correctAnswer?: string[]
  instructorStimulus?: string
  tags?: string[]
}

export default function LibraryPage() {
  const { t, language: uiLanguage } = useTranslation()
  const questions = useQuery(api.questions.getUserQuestions)
  const updateQuestion = useMutation(api.questions.updateQuestion)
  const deleteQuestion = useMutation(api.questions.deleteQuestion)
  const deleteQuestionsBulk = useMutation(api.questions.deleteQuestions)
  const updateDifficulty = useMutation(api.questions.updateDifficulty)
  const updateScore = useMutation(api.questions.updateScore)
  const updateTutorInitials = useMutation(api.questions.updateTutorInitials)

  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null)
  const [newTagInput, setNewTagInput] = useState("")
  const [editingDifficultyId, setEditingDifficultyId] = useState<string | null>(null)
  const [editingPointsId, setEditingPointsId] = useState<string | null>(null)
  const [pointsInput, setPointsInput] = useState("")
  const [editingInitialsId, setEditingInitialsId] = useState<string | null>(null)
  const [initialsInput, setInitialsInput] = useState("")

  // Filter state
  const [filterTag, setFilterTag] = useState<string>("")
  const [filterType, setFilterType] = useState<string>("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("")
  const [filterSearch, setFilterSearch] = useState<string>("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")

  const toggleQuestion = (id: string) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedQuestions(newSelected)
  }

  const toggleAll = () => {
    if (!questions) return
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map(q => q._id)))
    }
  }

  const startEditing = (question: any) => {
    setEditingId(question._id)
    setEditState({
      questionId: question._id,
      stimulus: question.stimulus,
      options: question.options,
      correctAnswer: question.correctAnswer,
      instructorStimulus: question.instructorStimulus,
      tags: question.tags || [],
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditState(null)
  }

  const saveEdit = async () => {
    if (!editState) return

    try {
      await updateQuestion({
        questionId: editState.questionId as Id<"questions">,
        stimulus: editState.stimulus,
        options: editState.options,
        correctAnswer: editState.correctAnswer,
        instructorStimulus: editState.instructorStimulus,
        tags: editState.tags,
      })
      toast.success(t("tagsUpdated"))
      setEditingId(null)
      setEditState(null)
    } catch (error) {
      toast.error(t("tagsUpdateFailed"))
    }
  }

  const updateEditOption = (optionIndex: number, field: 'label' | 'value', newValue: string) => {
    if (!editState?.options) return
    const updatedOptions = [...editState.options]
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: newValue
    }
    setEditState({ ...editState, options: updatedOptions })
  }

  const toggleCorrectAnswer = (label: string) => {
    if (!editState) return
    const currentAnswers = editState.correctAnswer || []
    const isCurrentlyCorrect = currentAnswers.includes(label)
    setEditState({
      ...editState,
      correctAnswer: isCurrentlyCorrect
        ? currentAnswers.filter(a => a !== label)
        : [...currentAnswers, label]
    })
  }

  const addTag = (questionId: string) => {
    if (!newTagInput.trim()) return

    if (editState && editState.questionId === questionId) {
      const currentTags = editState.tags || []
      if (!currentTags.includes(newTagInput.trim())) {
        setEditState({
          ...editState,
          tags: [...currentTags, newTagInput.trim()]
        })
      }
    }
    setNewTagInput("")
  }

  const removeTag = (questionId: string, tagToRemove: string) => {
    if (editState && editState.questionId === questionId) {
      setEditState({
        ...editState,
        tags: (editState.tags || []).filter(tag => tag !== tagToRemove)
      })
    }
  }

  const handleDifficultyUpdate = async (questionId: string, difficulty: "easy" | "medium" | "hard") => {
    try {
      await updateDifficulty({
        questionId: questionId as Id<"questions">,
        difficulty
      })
      toast.success(t("difficultyUpdated"))
      setEditingDifficultyId(null)
    } catch (error) {
      toast.error(t("updateFailed"))
    }
  }

  const handlePointsUpdate = async (questionId: string) => {
    const points = parseFloat(pointsInput)
    if (isNaN(points) || points <= 0) {
      toast.error(t("updateFailed"), {
        description: "Poäng måste vara ett positivt tal"
      })
      return
    }

    try {
      await updateScore({
        questionId: questionId as Id<"questions">,
        score: points
      })
      toast.success(t("pointsUpdated"))
      setEditingPointsId(null)
      setPointsInput("")
    } catch (error) {
      toast.error(t("updateFailed"))
    }
  }

  const handleInitialsUpdate = async (questionId: string) => {
    const initials = initialsInput.trim()
    if (!initials) {
      toast.error(t("updateFailed"), {
        description: "Lärarinitialer kan inte vara tomma"
      })
      return
    }

    if (initials.length > 10) {
      toast.error(t("updateFailed"), {
        description: "Lärarinitialer får max vara 10 tecken"
      })
      return
    }

    try {
      await updateTutorInitials({
        questionId: questionId as Id<"questions">,
        tutorInitials: initials
      })
      toast.success("Lärarinitialer uppdaterade")
      setEditingInitialsId(null)
      setInitialsInput("")
    } catch (error) {
      toast.error(t("updateFailed"))
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm(uiLanguage === "sv" ? "Är du säker på att du vill ta bort denna fråga?" : "Are you sure you want to delete this question?")) {
      return
    }

    setDeletingId(questionId)
    try {
      await deleteQuestion({ id: questionId as Id<"questions"> })
      toast.success(uiLanguage === "sv" ? "Fråga borttagen" : "Question deleted", {
        description: uiLanguage === "sv" ? "Frågan har tagits bort från biblioteket" : "Question has been removed from the library"
      })
      // Remove from selected if it was selected
      const newSelected = new Set(selectedQuestions)
      newSelected.delete(questionId)
      setSelectedQuestions(newSelected)
    } catch (error) {
      toast.error(uiLanguage === "sv" ? "Misslyckades att ta bort" : "Deletion failed", {
        description: uiLanguage === "sv" ? "Kunde inte ta bort frågan" : "Could not delete the question"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedQuestions.size === 0) return
    const count = selectedQuestions.size
    if (!confirm(uiLanguage === "sv"
      ? `Är du säker på att du vill ta bort ${count} valda frågor? Detta kan inte ångras.`
      : `Are you sure you want to delete ${count} selected questions? This cannot be undone.`)) {
      return
    }
    try {
      await deleteQuestionsBulk({
        ids: Array.from(selectedQuestions) as Id<"questions">[],
      })
      setSelectedQuestions(new Set())
      toast.success(uiLanguage === "sv" ? `${count} frågor borttagna` : `${count} questions deleted`, {
        description: uiLanguage === "sv" ? "Frågorna har tagits bort från biblioteket" : "Questions have been removed from the library",
      })
    } catch {
      toast.error(uiLanguage === "sv" ? "Misslyckades att ta bort" : "Deletion failed", {
        description: uiLanguage === "sv" ? "Kunde inte ta bort de valda frågorna" : "Could not delete the selected questions",
      })
    }
  }

  const exportSelected = async (format: "legacy" | "utg" | "qti21" | "qti22" | "word" | "csv") => {
    if (!questions || selectedQuestions.size === 0) {
      toast.error(uiLanguage === "sv" ? "Ingen fråga vald" : "No question selected", {
        description: uiLanguage === "sv" ? "Välj minst en fråga att exportera" : "Select at least one question to export"
      })
      return
    }

    setIsExporting(true)
    try {
      const selected = questions.filter(q => selectedQuestions.has(q._id))
      const metadata = {
        subject: selected[0]?.subject || "Export",
        topic: selected[0]?.tags?.[0] || "",
        difficulty: selected[0]?.difficulty || "medium",
        language: uiLanguage,
        tutorInitials: selected[0]?.tutorInitials || "",
        includeAITag: selected[0]?.tags?.some((t: string) => t === "TentaGen" || t === "AI-genererad" || t === "AI-generated") || false,
        includeLanguageTag: selected[0]?.tags?.some((t: string) => t === "Svenska" || t === "English") || false,
      }

      // Helper to trigger download
      const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      if (format === "csv") {
        // CSV export — downloadCSV handles blob creation and download
        downloadCSV(selected, metadata)
        toast.success(uiLanguage === "sv" ? "CSV-export lyckades!" : "CSV export succeeded!", {
          description: uiLanguage === "sv"
            ? `${selectedQuestions.size} frågor exporterade som .csv`
            : `${selectedQuestions.size} questions exported as .csv`
        })
      } else if (format === "word") {
        // Word (.docx) export
        const blob = await exportToWord(selected, metadata)
        const timestamp = new Date().toISOString().split("T")[0]
        const fileLabel = uiLanguage === "sv" ? "tentafragor" : "exam_questions"
        downloadBlob(blob, `${metadata.subject}_${fileLabel}_${timestamp}.docx`)
        toast.success(uiLanguage === "sv" ? "Word-export lyckades!" : "Word export succeeded!", {
          description: uiLanguage === "sv"
            ? `${selectedQuestions.size} frågor exporterade som .docx`
            : `${selectedQuestions.size} questions exported as .docx`
        })
      } else if (format === "qti21" || format === "qti22") {
        // QTI export as ZIP
        const JSZip = (await import("jszip")).default
        const zip = new JSZip()
        const files = format === "qti21" ? exportToQti21(selected, metadata) : exportToQti22(selected, metadata)

        files.forEach(file => {
          zip.file(file.name, file.content)
        })

        const blob = await zip.generateAsync({ type: "blob" })
        const timestamp = new Date().toISOString().split("T")[0]
        downloadBlob(blob, `library_export_${format}_${timestamp}.zip`)
        toast.success(`${format.toUpperCase()} export ${uiLanguage === "sv" ? "lyckades" : "succeeded"}!`, {
          description: uiLanguage === "sv"
            ? `${selectedQuestions.size} frågor exporterade som ZIP`
            : `${selectedQuestions.size} questions exported as ZIP`
        })
      } else {
        // Wiseflow JSON export
        const jsonContent = exportToWiseflowJSON(selected, {
          ...metadata,
          exportFormat: format === "legacy" ? "legacy" : "utgaende"
        })
        // Map internal format codes to descriptive filename labels
        // "legacy" = new Learnosity format, "utg" = old utgående format
        const formatLabel = format === "legacy" ? "ny_json" : "utgaende_json"
        const filename = `library-export-${formatLabel}-${Date.now()}.json`
        const blob = new Blob([jsonContent], { type: "application/json" })
        downloadBlob(blob, filename)
        toast.success(uiLanguage === "sv" ? "Export lyckades!" : "Export succeeded!", {
          description: uiLanguage === "sv"
            ? `${selectedQuestions.size} frågor exporterade`
            : `${selectedQuestions.size} questions exported`
        })
      }
    } catch (error) {
      toast.error(uiLanguage === "sv" ? "Export misslyckades" : "Export failed", {
        description: uiLanguage === "sv" ? "Kunde inte exportera frågor" : "Could not export questions"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      // Core
      mcq: "Flerval",
      true_false: "Sant/Falskt",
      longtextV2: "Essä",
      short_answer: "Kort svar",
      fill_blank: "Ifyllnad",
      // Extended
      multiple_response: "Flera rätt",
      matching: "Matchning",
      ordering: "Ordningsföljd",
      // Specialized
      choicematrix: "Valmatris",
      clozetext: "Lucktext",
      clozedropdown: "Rullgardinslucka",
      orderlist: "Ordningslista",
      tokenhighlight: "Tokenmarkering",
      clozeassociation: "Dra-och-släpp lucka",
      imageclozeassociationV2: "Bildlucka",
      plaintext: "Fritext",
      formulaessayV2: "Formeluppsats",
      chemistryessayV2: "Kemiuppsats",
      // Legacy (kept for DB compatibility)
      hotspot: "Bildmarkering",
      rating_scale: "Betygsskala",
    }
    return labels[type] || type
  }

  // Filter questions based on active filters
  const filteredQuestions = questions?.filter((question) => {
    // Filter by tag
    if (filterTag && !question.tags?.includes(filterTag)) {
      return false
    }

    // Filter by type
    if (filterType && question.type !== filterType) {
      return false
    }

    // Filter by difficulty
    if (filterDifficulty && question.difficulty !== filterDifficulty) {
      return false
    }

    // Filter by search (title or stimulus)
    if (filterSearch) {
      const searchLower = filterSearch.toLowerCase()
      const titleMatch = question.title.toLowerCase().includes(searchLower)
      const stimulusMatch = question.stimulus.toLowerCase().includes(searchLower)
      if (!titleMatch && !stimulusMatch) {
        return false
      }
    }

    return true
  }).sort((a, b) => {
    return sortBy === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
  }) || []

  // Get unique tags from all questions for filter dropdown
  const allTags = Array.from(
    new Set(
      questions?.flatMap((q) => q.tags || []) || []
    )
  ).sort()

  // Get unique question types that actually exist in the library
  const allTypes = Array.from(
    new Set(
      questions?.map((q) => q.type).filter(Boolean) || []
    )
  ).sort((a, b) => getQuestionTypeLabel(a).localeCompare(getQuestionTypeLabel(b), "sv"))

  // Check if any filters are active
  const hasActiveFilters = Boolean(filterTag || filterType || filterDifficulty || filterSearch)

  // Clear all filters
  const clearAllFilters = () => {
    setFilterTag("")
    setFilterType("")
    setFilterDifficulty("")
    setFilterSearch("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary dark:from-background dark:to-background flex flex-col">
      <AppHeader />

      <main className="container mx-auto max-w-6xl py-8 px-3 sm:px-4">
        <SignedOut>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-3xl font-bold">{t("questionLibrary")}</h2>
            <p className="max-w-md text-lg text-muted-foreground">
              Logga in för att se dina sparade frågor
            </p>
            <SignInButton mode="modal">
              <Button size="lg">Logga in</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-6">
            {/* Page Title and Subtitle */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("questionLibrary")}
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                {t("librarySubtitle")}
              </p>
            </div>

            {/* Actions bar */}
            {questions && questions.length > 0 && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={questions.length > 0 && selectedQuestions.size === questions.length}
                        onCheckedChange={toggleAll}
                        id="select-all"
                      />
                      <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                        {t("selectAll")} ({selectedQuestions.size}/{questions.length})
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => exportSelected("legacy")}
                        disabled={selectedQuestions.size === 0 || isExporting}
                        variant="outline"
                        size="sm"
                      >
                        {isExporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        New Wiseflow JSON
                      </Button>
                      <Button
                        onClick={() => exportSelected("utg")}
                        disabled={selectedQuestions.size === 0 || isExporting}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Legacy JSON
                      </Button>
                      <Button
                        onClick={() => exportSelected("word")}
                        disabled={selectedQuestions.size === 0 || isExporting}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Word (.docx)
                      </Button>
                      <Button
                        onClick={() => exportSelected("csv")}
                        disabled={selectedQuestions.size === 0 || isExporting}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        CSV
                      </Button>
                      <Button
                        onClick={() => exportSelected("qti21")}
                        disabled={selectedQuestions.size === 0 || isExporting}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        QTI 2.1
                      </Button>
                      <Button
                        onClick={() => exportSelected("qti22")}
                        disabled={selectedQuestions.size === 0 || isExporting}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        QTI 2.2 Inspera
                      </Button>
                      <Button
                        onClick={handleDeleteSelected}
                        disabled={selectedQuestions.size === 0}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("deleteSelected")} ({selectedQuestions.size})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            {questions && questions.length > 0 && (
              <Card>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">{uiLanguage === "sv" ? "Filter" : "Filters"}</h3>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="ml-auto text-xs"
                        >
                          {t("clearFilters")}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Search filter — full width */}
                      <Input
                        placeholder={uiLanguage === "sv" ? "Sök frågor..." : "Search questions..."}
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="text-sm"
                      />

                      {/* Filter dropdowns row */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                      {/* Tag filter */}
                      <Select value={filterTag || "all"} onValueChange={(value) => setFilterTag(value === "all" ? "" : value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder={t("filterByTag")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{uiLanguage === "sv" ? "Alla taggar" : "All tags"}</SelectItem>
                          {allTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Type filter — dynamic, shows only types in library */}
                      <Select value={filterType || "all"} onValueChange={(value) => setFilterType(value === "all" ? "" : value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder={t("filterByType")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("allTypes")}</SelectItem>
                          {allTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {getQuestionTypeLabel(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Difficulty filter */}
                      <Select value={filterDifficulty || "all"} onValueChange={(value) => setFilterDifficulty(value === "all" ? "" : value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder={t("filterByDifficulty")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("allDifficulties")}</SelectItem>
                          <SelectItem value="easy">{uiLanguage === "sv" ? "Lätt" : "Easy"}</SelectItem>
                          <SelectItem value="medium">{uiLanguage === "sv" ? "Medel" : "Medium"}</SelectItem>
                          <SelectItem value="hard">{uiLanguage === "sv" ? "Svår" : "Hard"}</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Sort dropdown */}
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest")}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder={t("sortBy")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">{t("sortNewest")}</SelectItem>
                          <SelectItem value="oldest">{t("sortOldest")}</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>
                    </div>

                    {/* Results count */}
                    {hasActiveFilters && (
                      <p className="text-sm text-muted-foreground">
                        {t("showing")} {filteredQuestions.length} {t("of")} {questions.length} {t("questions")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading state */}
            {questions === undefined ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : questions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Inga sparade frågor än</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Skapa och spara frågor från huvudsidan för att se dem här
                  </p>
                  <Link href="/">
                    <Button>Skapa frågor</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No questions match filters</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  <Button onClick={clearAllFilters}>{t("clearFilters")}</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredQuestions.map((question) => {
                  const isEditing = editingId === question._id
                  const displayQuestion = isEditing && editState ? editState : question

                  return (
                    <Card key={question._id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedQuestions.has(question._id)}
                            onCheckedChange={() => toggleQuestion(question._id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-lg leading-tight mb-2">
                                  {question.title}
                                </CardTitle>
                                {isEditing ? (
                                  <Textarea
                                    value={editState?.stimulus || ""}
                                    onChange={(e) => setEditState(editState ? { ...editState, stimulus: e.target.value } : null)}
                                    className="min-h-[80px] mb-2"
                                  />
                                ) : (
                                  <div
                                    className="prose prose-sm max-w-none mb-2"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.stimulus) }}
                                  />
                                )}
                              </div>
                              <div className="flex gap-2">
                                {isEditing ? (
                                  <>
                                    <Button size="sm" variant="default" aria-label="Save changes" onClick={saveEdit}>
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" aria-label="Cancel editing" onClick={cancelEditing}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" variant="ghost" aria-label="Edit question" onClick={() => startEditing(question)}>
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      aria-label="Delete question"
                                      onClick={() => handleDelete(question._id)}
                                      disabled={deletingId === question._id}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      {deletingId === question._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Tags - Show ALL tags */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">
                                  <Tag className="mr-1 h-3 w-3" />
                                  {question.subject}
                                </Badge>
                                <Badge variant={
                                  question.type === "mcq" ? "default" :
                                  question.type === "true_false" ? "secondary" :
                                  "outline"
                                }>
                                  {getQuestionTypeLabel(question.type)}
                                </Badge>
                                {/* Difficulty Badge - Editable */}
                                {editingDifficultyId === question._id ? (
                                  <Select
                                    value={question.difficulty}
                                    onValueChange={(value) => handleDifficultyUpdate(question._id, value as "easy" | "medium" | "hard")}
                                  >
                                    <SelectTrigger className="w-32 h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="easy">{t("easy")}</SelectItem>
                                      <SelectItem value="medium">{t("medium")}</SelectItem>
                                      <SelectItem value="hard">{t("hard")}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className={`cursor-pointer hover:opacity-80 ${
                                      question.difficulty === "easy" ? "bg-green-100 dark:bg-green-950" :
                                      question.difficulty === "medium" ? "bg-yellow-100 dark:bg-yellow-950" :
                                      "bg-red-100 dark:bg-red-950"
                                    }`}
                                    onClick={() => setEditingDifficultyId(question._id)}
                                    title={t("editDifficulty")}
                                  >
                                    {question.difficulty === "easy" ? t("easy") :
                                     question.difficulty === "medium" ? t("medium") :
                                     t("hard")}
                                  </Badge>
                                )}

                                {/* Points Badge - Editable */}
                                {editingPointsId === question._id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      value={pointsInput}
                                      onChange={(e) => setPointsInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handlePointsUpdate(question._id)
                                        if (e.key === "Escape") {
                                          setEditingPointsId(null)
                                          setPointsInput("")
                                        }
                                      }}
                                      className="w-20 h-7 text-sm"
                                      placeholder={String(question.score)}
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      onClick={() => handlePointsUpdate(question._id)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      onClick={() => {
                                        setEditingPointsId(null)
                                        setPointsInput("")
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:opacity-80 bg-warm-muted/50 dark:bg-warm/15 text-warm-foreground dark:text-warm border-warm/30"
                                    onClick={() => {
                                      setEditingPointsId(question._id)
                                      setPointsInput(String(question.score))
                                    }}
                                    title={t("editPoints")}
                                  >
                                    {question.score} {t("points").toLowerCase()}
                                  </Badge>
                                )}
                                {editingInitialsId === question._id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      value={initialsInput}
                                      onChange={(e) => setInitialsInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleInitialsUpdate(question._id)
                                        }
                                      }}
                                      className="w-24 h-7"
                                      maxLength={10}
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleInitialsUpdate(question._id)}
                                      className="h-7 px-2"
                                    >
                                      ✓
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingInitialsId(null)
                                        setInitialsInput("")
                                      }}
                                      className="h-7 px-2"
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                ) : (
                                  question.tutorInitials && question.tutorInitials !== "N/A" && question.tutorInitials.trim() !== "" && (
                                    <Badge
                                      variant="outline"
                                      className="bg-warm-muted/50 dark:bg-warm/15 text-warm-foreground dark:text-warm border-warm/30 cursor-pointer hover:bg-warm-muted/70 dark:hover:bg-warm/25"
                                      onClick={() => {
                                        setEditingInitialsId(question._id)
                                        setInitialsInput(question.tutorInitials || "")
                                      }}
                                      title="Klicka för att redigera lärarinitialer"
                                    >
                                      {question.tutorInitials}
                                    </Badge>
                                  )
                                )}
                                {(() => {
                                  // Tags already visible as metadata badges — exclude to avoid duplicates
                                  // Map question.type to its full translated tag name (e.g., "mcq" → "Flervalsfråga")
                                  const typeToTagKey: Record<string, string> = {
                                    mcq: "questionType_mcq", true_false: "questionType_trueFalse",
                                    longtextV2: "questionType_essay", short_answer: "questionType_shortAnswer",
                                    fill_blank: "questionType_fillBlank", multiple_response: "questionType_multipleResponse",
                                    matching: "questionType_matching", ordering: "questionType_ordering",
                                    choicematrix: "questionType_choicematrix", clozetext: "questionType_clozetext",
                                    clozedropdown: "questionType_clozedropdown", orderlist: "questionType_orderlist",
                                    tokenhighlight: "questionType_tokenhighlight", clozeassociation: "questionType_clozeassociation",
                                    imageclozeassociationV2: "questionType_imageclozeassociationV2",
                                    plaintext: "questionType_plaintext", formulaessayV2: "questionType_formulaessayV2",
                                    chemistryessayV2: "questionType_chemistryessayV2",
                                  }
                                  const fullTypeName = typeToTagKey[question.type]
                                    ? t(typeToTagKey[question.type] as Parameters<typeof t>[0])
                                    : ""
                                  const metadataValues = new Set([
                                    question.subject?.toLowerCase(),
                                    getQuestionTypeLabel(question.type)?.toLowerCase(),
                                    fullTypeName?.toLowerCase(),
                                    question.difficulty === "easy" ? t("easy").toLowerCase() :
                                    question.difficulty === "medium" ? t("medium").toLowerCase() :
                                    question.difficulty === "hard" ? t("hard").toLowerCase() : "",
                                  ].filter(Boolean))
                                  return [...new Set(
                                    (isEditing ? editState?.tags : question.tags)
                                      ?.filter(tag => tag && tag.trim().length > 0 && !metadataValues.has(tag.toLowerCase())) ?? []
                                  )]
                                })().map((tag) => {
                                  const isAITag = tag === "TentaGen" || tag === "AI-genererad" || tag === "AI-generated"
                                  return (
                                    <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                                      {tag}
                                      {isEditing && (
                                        <button
                                          type="button"
                                          onClick={() => removeTag(question._id, tag)}
                                          className="ml-1 hover:text-destructive"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </Badge>
                                  )
                                })}
                              </div>
                              {isEditing && (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={newTagInput}
                                    onChange={(e) => setNewTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault()
                                        addTag(question._id)
                                      }
                                    }}
                                    placeholder={t("addTagPlaceholder")}
                                    className="max-w-xs text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addTag(question._id)}
                                    disabled={!newTagInput.trim()}
                                  >
                                    {t("addTag")}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6">
                        {/* Options */}
                        {displayQuestion.options && displayQuestion.options.length > 0 && (
                          <div className="space-y-2 mb-4">
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
                                        onChange={(e) => updateEditOption(optionIndex, 'value', e.target.value)}
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

                        {/* Instructor guidance */}
                        {displayQuestion.instructorStimulus && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10 mb-4">
                            <div className="text-sm font-medium text-foreground mb-2">
                              Lärarhandledning
                            </div>
                            {isEditing ? (
                              <Textarea
                                value={editState?.instructorStimulus || ""}
                                onChange={(e) => setEditState(editState ? { ...editState, instructorStimulus: e.target.value } : null)}
                                className="text-sm bg-white dark:bg-card"
                              />
                            ) : (
                              <p className="text-sm text-foreground/80">
                                {question.instructorStimulus}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(question.createdAt).toLocaleDateString("sv-SE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          <span>
                            Poäng: {question.score} ({question.minScore}-{question.maxScore})
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </SignedIn>
      </main>
      <AppFooter />
      <FeedbackButton />
    </div>
  )
}
