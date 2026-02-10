"use client"

import { useTranslation } from "@/lib/language-context"
import Link from "next/link"
import { ArrowLeft, BookOpen, Zap, Settings, Library, Upload, Tag, FileJson, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function DocsPage() {
  const { t, language } = useTranslation()

  const isSv = language === "sv"

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/50 sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <h1 className="text-base sm:text-xl font-semibold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              {t("appTitle")}
            </h1>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              {isSv ? "Användarguide" : "User Guide"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isSv
                ? "Lär dig hur du skapar pedagogiskt genomtänkta tentafrågor med AI för dina Wiseflow-tentor"
                : "Learn how to create pedagogically sound exam questions with AI for your Wiseflow exams"}
            </p>
          </div>

          <Separator />

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>{isSv ? "Snabbstart" : "Quick Start"}</CardTitle>
              </div>
              <CardDescription>
                {isSv
                  ? "Kom igång på 3 enkla steg"
                  : "Get started in 3 easy steps"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      1
                    </div>
                    <h3 className="font-semibold">
                      {isSv ? "Fyll i grundinfo" : "Fill basic info"}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isSv
                      ? "Ange ämne, ämnesområde, svårighetsgrad och antal frågor"
                      : "Enter subject, topic, difficulty level, and number of questions"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      2
                    </div>
                    <h3 className="font-semibold">
                      {isSv ? "Lägg till kontext (valfritt)" : "Add context (optional)"}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isSv
                      ? "Ladda upp dokument eller URL:er för att generera frågor från specifikt material"
                      : "Upload documents or URLs to generate questions from specific material"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      3
                    </div>
                    <h3 className="font-semibold">
                      {isSv ? "Generera & Exportera" : "Generate & Export"}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isSv
                      ? "Granska frågorna, spara till bibliotek, och exportera till Wiseflow JSON"
                      : "Review questions, save to library, and export to Wiseflow JSON"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {isSv ? "Huvudfunktioner" : "Main Features"}
            </h2>

            {/* Question Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {isSv ? "Frågegenerering" : "Question Generation"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Grundläggande fält" : "Basic Fields"}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Ämne" : "Subject"}:</strong>{" "}
                          {isSv
                            ? "Huvudämnet för frågorna (t.ex. Biologi, Matematik)"
                            : "The main subject for questions (e.g., Biology, Mathematics)"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Ämnesområde" : "Topic"}:</strong>{" "}
                          {isSv
                            ? "Specifikt område inom ämnet (t.ex. Celldelning, Algebra)"
                            : "Specific area within the subject (e.g., Cell division, Algebra)"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Svårighetsgrad" : "Difficulty"}:</strong>{" "}
                          {isSv
                            ? "Lätt (1 poäng), Medium (2 poäng), eller Svår (3 poäng)"
                            : "Easy (1 point), Medium (2 points), or Hard (3 points)"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Frågetyper" : "Question Types"}</h4>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">MCQ</Badge>
                        <span className="text-muted-foreground">{isSv ? "Flervalsfråga" : "Multiple Choice"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">T/F</Badge>
                        <span className="text-muted-foreground">{isSv ? "Sant/Falskt" : "True/False"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Essay</Badge>
                        <span className="text-muted-foreground">{isSv ? "Essäfråga" : "Essay Question"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">+7 {isSv ? "fler" : "more"}</Badge>
                        <span className="text-muted-foreground">{isSv ? "Kort svar, ifyllnad, m.m." : "Short answer, fill blank, etc."}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {isSv ? "Ladda upp kontext" : "Upload Context"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Stödda filformat" : "Supported File Formats"}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>Word:</strong> .docx {isSv ? "dokument" : "documents"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>PowerPoint:</strong> .pptx {isSv ? "presentationer" : "presentations"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>Web:</strong> {isSv ? "Valfri URL (webbsidor, Wikipedia, etc.)" : "Any URL (web pages, Wikipedia, etc.)"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">{isSv ? "Kontextprioritet" : "Context Priority"}</h4>
                        <p className="text-sm text-muted-foreground">
                          {isSv
                            ? "När du laddar upp dokument eller URL:er, välj hur AI ska hantera kontexten:"
                            : "When uploading documents or URLs, choose how AI should handle context:"}
                        </p>
                        <ul className="space-y-1 text-sm text-muted-foreground mt-2">
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-foreground">{isSv ? "Hybrid (Rekommenderas):" : "Hybrid (Recommended):"}</span>
                            {isSv
                              ? "AI prioriterar uppladdad kontext men behåller ämne/ämnesområde som referens"
                              : "AI prioritizes uploaded context but keeps subject/topic as reference"}
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-foreground">{isSv ? "Endast Kontext:" : "Context Only:"}</span>
                            {isSv
                              ? "Strikt baserat på uppladdad kontext, ignorerar ämne/ämnesområde"
                              : "Strictly based on uploaded context, ignores subject/topic"}
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-foreground">{isSv ? "Respektera Ämne:" : "Respect Subject:"}</span>
                            {isSv
                              ? "Använder både ämne/ämnesområde och uppladdad kontext (kan blanda)"
                              : "Uses both subject/topic and uploaded context (may mix)"}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags & Organization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {isSv ? "Taggar & Organisation" : "Tags & Organization"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Automatiska taggar" : "Automatic Tags"}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isSv
                        ? "Följande taggar läggs till automatiskt på alla frågor:"
                        : "The following tags are added automatically to all questions:"}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge>Ämne</Badge>
                        <span className="text-muted-foreground">{isSv ? "T.ex. Biologi" : "E.g., Biology"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Ämnesområde</Badge>
                        <span className="text-muted-foreground">{isSv ? "T.ex. Celldelning" : "E.g., Cell division"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Frågetyp</Badge>
                        <span className="text-muted-foreground">{isSv ? "T.ex. MCQ" : "E.g., MCQ"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Svårighetsgrad</Badge>
                        <span className="text-muted-foreground">{isSv ? "T.ex. Medium" : "E.g., Medium"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Språk</Badge>
                        <span className="text-muted-foreground">{isSv ? "T.ex. Svenska" : "E.g., Swedish"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Tidsstämpel</Badge>
                        <span className="text-muted-foreground">{isSv ? "T.ex. 2024-02-10" : "E.g., 2024-02-10"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Anpassade taggar" : "Custom Tags"}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Termin/Period" : "Term/Period"}:</strong> {isSv ? "T.ex. T3" : "E.g., T3"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Läsår" : "Semester"}:</strong> {isSv ? "T.ex. HT25" : "E.g., HT25"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Tentaform" : "Exam Type"}:</strong> {isSv ? "T.ex. Ordinarie" : "E.g., Regular"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Kurskod" : "Course Code"}:</strong> {isSv ? "T.ex. BIO101" : "E.g., BIO101"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Ytterligare taggar" : "Additional Tags"}:</strong> {isSv ? "Kommaseparerade (t.ex. Ögon, Makula, LO1)" : "Comma-separated (e.g., Eyes, Macula, LO1)"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Library Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  {isSv ? "Bibliotekshantering" : "Library Management"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Filtrera & Sortera" : "Filter & Sort"}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{isSv ? "Filtrera frågor på tagg, typ, svårighetsgrad eller datum" : "Filter questions by tag, type, difficulty, or date"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{isSv ? "Sortera efter nyast eller äldst först" : "Sort by newest or oldest first"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{isSv ? "Redigera poäng och svårighetsgrad direkt i biblioteket" : "Edit points and difficulty directly in library"}</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Redigera frågor" : "Edit Questions"}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{isSv ? "Lägg till eller ta bort taggar (inklusive AI-genererad tagg)" : "Add or remove tags (including AI-generated tag)"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{isSv ? "Redigera frågetext, svarsalternativ och rätt svar" : "Edit question text, answer options, and correct answer"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{isSv ? "Justera poäng (1-10) och svårighetsgrad" : "Adjust points (1-10) and difficulty level"}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  {isSv ? "Exportalternativ" : "Export Options"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Wiseflow JSON-format" : "Wiseflow JSON Formats"}</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Badge variant="outline">Legacy</Badge>
                        <span>
                          {isSv
                            ? "Utgående format med labels som har ID-fält. Används av äldre tentacenter."
                            : "Outgoing format with labels that have ID fields. Used by older exam centers."}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline">Utgående</Badge>
                        <span>
                          {isSv
                            ? "Nyare format med tags-array istället för labels. Används av modernare tentacenter."
                            : "Newer format with tags array instead of labels. Used by modern exam centers."}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline">QTI 2.1</Badge>
                        <span>
                          {isSv
                            ? "Universellt LMS-format som fungerar med de flesta lärplattformar (Canvas, Moodle, Blackboard)."
                            : "Universal LMS format that works with most learning platforms (Canvas, Moodle, Blackboard)."}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">{isSv ? "Tips" : "Tip"}</h4>
                        <p className="text-sm text-muted-foreground">
                          {isSv
                            ? "Du kan välja exportformat både i förhandsvisningen efter generering och i biblioteket. Alla frågor exporteras i valt format oavsett var de kommer ifrån."
                            : "You can choose export format both in the preview after generation and in the library. All questions are exported in the selected format regardless of their origin."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {isSv ? "Inställningar" : "Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Profilinställningar" : "Profile Settings"}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Lärarinitialer" : "Tutor Initials"}:</strong>{" "}
                          {isSv
                            ? "T.ex. AB, JD, eller id:pma. Läggs automatiskt till som tagg på alla dina frågor."
                            : "E.g., AB, JD, or id:pma. Automatically added as a tag to all your questions."}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          <strong>{isSv ? "Gränssnittsspråk" : "UI Language"}:</strong>{" "}
                          {isSv
                            ? "Välj mellan Svenska eller Engelska för gränssnittet (påverkar inte frågespråk)"
                            : "Choose between Swedish or English for the interface (doesn't affect question language)"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips & Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>{isSv ? "Tips & Bästa Praxis" : "Tips & Best Practices"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{isSv ? "För bästa resultat" : "For Best Results"}</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>{isSv ? "Var specifik i ämne och ämnesområde" : "Be specific in subject and topic"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {isSv
                              ? "Ladda upp relevanta dokument eller URL:er för mer fokuserade frågor"
                              : "Upload relevant documents or URLs for more focused questions"}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {isSv
                              ? "Använd 'Ytterligare kontext' för att specificera lärandemål eller särskilda instruktioner"
                              : "Use 'Additional Context' to specify learning outcomes or special instructions"}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {isSv
                              ? "Granska alltid frågorna innan export - AI kan göra misstag"
                              : "Always review questions before export - AI can make mistakes"}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {isSv
                              ? "Använd taggar konsekvent för att enkelt hitta och organisera dina frågor"
                              : "Use tags consistently to easily find and organize your questions"}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {isSv
                              ? "Spara alla genererade frågor till biblioteket för framtida användning"
                              : "Save all generated questions to the library for future use"}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="flex justify-center pt-4">
            <Link href="/">
              <Button size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isSv ? "Tillbaka till Frågegeneratorn" : "Back to Question Generator"}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
