"use client"

import { useTranslation } from "@/lib/language-context"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { FeedbackButton } from "@/components/feedback-button"
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary dark:from-background dark:to-background flex flex-col">
      <AppHeader />

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

          {/* Key Benefits */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-center">
              {isSv ? "Varför Wiseflow Fr\u00e5gegenerator?" : "Why Wiseflow Question Generator?"}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">
                    {isSv ? "Spara tid" : "Save Time"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {isSv
                      ? "Generera pedagogiskt genomt\u00e4nkta tentafr\u00e5gor p\u00e5 sekunder ist\u00e4llet för timmar. AI hanterar det tidsrevan arbetet med att skapa varierade och v\u00e4lformulerade fr\u00e5gor."
                      : "Generate pedagogically sound exam questions in seconds instead of hours. AI handles the time-consuming work of creating varied and well-formulated questions."}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">
                    {isSv ? "H\u00f6g kvalitet" : "High Quality"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {isSv
                      ? "AI-genererade fr\u00e5gor baserade p\u00e5 ditt specifika kursmaterial. Granska och redigera alla fr\u00e5gor innan export f\u00f6r att s\u00e4kerst\u00e4lla perfekt anpassning till dina behov."
                      : "AI-generated questions based on your specific course material. Review and edit all questions before export to ensure perfect alignment with your needs."}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <FileJson className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">
                    {isSv ? "Flexibel export" : "Flexible Export"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {isSv
                      ? "Stöd för flera exportformat: Wiseflow JSON (Ny/Legacy), QTI 2.1 och QTI 2.2 Inspera. Fungerar med de flesta LMS-plattformar."
                      : "Support for multiple export formats: Wiseflow JSON (New/Legacy), QTI 2.1, and QTI 2.2 Inspera. Works with most LMS platforms."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isSv ? "Ytterligare f\u00f6rdelar" : "Additional Benefits"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      {isSv
                        ? <><strong>Dokumentbaserad generering:</strong> Ladda upp Word, PowerPoint, video/YouTube eller URL:er för frågor baserade på specifikt material</>
                        : <><strong>Document-based generation:</strong> Upload Word, PowerPoint, video/YouTube, or URLs for questions based on specific material</>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      {isSv
                        ? <><strong>10+ frågetyper:</strong> Flerval, Sant/Falskt, Essay, Kort svar, Matchning, Ifyllnad, och mer</>
                        : <><strong>10+ question types:</strong> Multiple Choice, True/False, Essay, Short Answer, Matching, Fill Blank, and more</>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      {isSv
                        ? <><strong>Fullständig kontroll:</strong> Redigera frågetext, svarsalternativ, poäng och svårighetsgrad innan export</>
                        : <><strong>Complete control:</strong> Edit question text, answer options, points, and difficulty before export</>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      {isSv
                        ? <><strong>Frågebibliotek:</strong> Spara och organisera alla dina frågor med taggar för enkel återanvändning</>
                        : <><strong>Question library:</strong> Save and organize all your questions with tags for easy reuse</>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      {isSv
                        ? <><strong>Kontextprioritet:</strong> Välj hur AI balanserar mellan ämne och uppladdad kontext</>
                        : <><strong>Context priority:</strong> Choose how AI balances between subject and uploaded context</>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      {isSv
                        ? <><strong>Generera fler:</strong> Lägg till nya frågor till befintligt set utan att starta om</>
                        : <><strong>Generate more:</strong> Add new questions to existing set without starting over</>}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      ? "Ladda upp dokument, video/YouTube eller URL:er för frågor från specifikt material"
                      : "Upload documents, video/YouTube, or URLs for questions from specific material"}
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
                          <strong>Video:</strong> {isSv ? "Ladda upp videofiler eller klistra in YouTube-URL:er för automatisk transkription" : "Upload video files or paste YouTube URLs for automatic transcription"}
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
                        <Badge>{isSv ? "Lärarinitialer" : "Tutor Initials"}</Badge>
                        <span className="text-muted-foreground">{isSv ? "T.ex. AB, JD" : "E.g., AB, JD"}</span>
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
                        <Badge variant="outline">{isSv ? "Ny Wiseflow JSON" : "New Wiseflow JSON"}</Badge>
                        <span>
                          {isSv
                            ? "Aktuellt format med labels som har ID-fält. Rekommenderas för de flesta tentacenter."
                            : "Current format with labels that have ID fields. Recommended for most exam centers."}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline">Legacy JSON</Badge>
                        <span>
                          {isSv
                            ? "Äldre format med tags-array istället för labels. Används av äldre tentacenter."
                            : "Older format with tags array instead of labels. Used by older exam centers."}
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
                      <li className="flex items-start gap-2">
                        <Badge variant="outline">QTI 2.2 Inspera</Badge>
                        <span>
                          {isSv
                            ? "Optimerat QTI 2.2-format specifikt för Inspera tentamensplattform med förbättrad kompatibilitet."
                            : "Optimized QTI 2.2 format specifically for Inspera exam platform with improved compatibility."}
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
                              ? "Ladda upp dokument, video eller URL:er för mer fokuserade frågor"
                              : "Upload documents, videos, or URLs for more focused questions"}
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
      <AppFooter />
      <FeedbackButton />
    </div>
  )
}
