"use client"

import { useTranslation } from "@/lib/language-context"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { FeedbackButton } from "@/components/feedback-button"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, BookOpen, Zap, Settings, Library, Upload, Tag, FileJson, CheckCircle2, AlertCircle, Info, FileUp, FileText, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
                ? "Lär dig hur du skapar pedagogiskt genomtänkta tentafrågor med AI med hjälp av TentaGen"
                : "Learn how to create pedagogically sound exam questions with AI using TentaGen"}
            </p>
          </div>

          <Separator />

          {/* Key Benefits */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-center">
              {isSv ? "Varför TentaGen?" : "Why TentaGen?"}
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
                      ? "Stöd för flera exportformat: Wiseflow JSON (Ny/Legacy), QTI 2.1, QTI 2.2 Inspera och Word (.docx). Fungerar med de flesta LMS-plattformar."
                      : "Support for multiple export formats: Wiseflow JSON (New/Legacy), QTI 2.1, QTI 2.2 Inspera, and Word (.docx). Works with most LMS platforms."}
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
                        ? <><strong>Dokumentbaserad generering:</strong> Ladda upp Word, PowerPoint, video eller URL:er för frågor baserade på specifikt material</>
                        : <><strong>Document-based generation:</strong> Upload Word, PowerPoint, video, or URLs for questions based on specific material</>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      {isSv
                        ? <><strong>20 frågetyper:</strong> Flerval, Sant/Falskt, Essay, Kort svar, Matchning, Ifyllnad, Lucktext, Ordningslista, och mer</>
                        : <><strong>20 question types:</strong> MCQ, True/False, Essay, Short Answer, Matching, Fill Blank, Cloze Text, Order List, and more</>}
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
                        ? <><strong>Generera fler:</strong> Lägg till nya frågor till befintligt set utan att starta om — välj bland alla 20 frågetyper</>
                        : <><strong>Generate more:</strong> Add new questions to existing set without starting over — choose from all 20 question types</>}
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
                      ? "Ladda upp dokument, video eller URL:er för frågor från specifikt material"
                      : "Upload documents, video, or URLs for questions from specific material"}
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
                      ? "Granska frågorna, spara till bibliotek, och exportera till Wiseflow JSON, QTI eller Word"
                      : "Review questions, save to library, and export to Wiseflow JSON, QTI, or Word"}
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
                            ? "Lätt (1p), Medel (2p), Svår (3p), eller Blandad (jämn fördelning med individuella svårighetsmarkeringar per fråga)"
                            : "Easy (1pt), Medium (2pt), Hard (3pt), or Mixed (balanced distribution with per-question difficulty badges)"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "20 Frågetyper (3 kategorier)" : "20 Question Types (3 tiers)"}</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-xs text-muted-foreground mb-1.5">{isSv ? "⭐ Grundläggande" : "⭐ Core"}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary">{isSv ? "Flerval (MCQ)" : "MCQ"}</Badge>
                          <Badge variant="secondary">{isSv ? "Sant/Falskt" : "True/False"}</Badge>
                          <Badge variant="secondary">{isSv ? "Essä" : "Essay"}</Badge>
                          <Badge variant="secondary">{isSv ? "Kort svar" : "Short Answer"}</Badge>
                          <Badge variant="secondary">{isSv ? "Ifyllnad" : "Fill Blank"}</Badge>
                          <Badge variant="secondary">{isSv ? "Flera rätt" : "Multiple Response"}</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-xs text-muted-foreground mb-1.5">{isSv ? "📚 Utökade" : "📚 Extended"}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary">{isSv ? "Matchning" : "Matching"}</Badge>
                          <Badge variant="secondary">{isSv ? "Ordningsföljd" : "Ordering"}</Badge>
                          <Badge variant="secondary">{isSv ? "Lucktext" : "Cloze Text"}</Badge>
                          <Badge variant="secondary">{isSv ? "Rullgardinslucka" : "Cloze Dropdown"}</Badge>
                          <Badge variant="secondary">{isSv ? "Ordningslista" : "Order List"}</Badge>
                          <Badge variant="secondary">{isSv ? "Valsmatris" : "Choice Matrix"}</Badge>
                          <Badge variant="secondary">{isSv ? "Tokenmarkering" : "Token Highlight"}</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-xs text-muted-foreground mb-1.5">{isSv ? "🔬 Specialiserade" : "🔬 Specialized"}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary">{isSv ? "Bildmarkering" : "Hotspot"}</Badge>
                          <Badge variant="secondary">{isSv ? "Betygsskala" : "Rating Scale"}</Badge>
                          <Badge variant="secondary">{isSv ? "Dra-och-släpp lucka" : "Cloze Association"}</Badge>
                          <Badge variant="secondary">{isSv ? "Bildlucka" : "Image Cloze"}</Badge>
                          <Badge variant="secondary">{isSv ? "Fritext" : "Plain Text"}</Badge>
                          <Badge variant="secondary">{isSv ? "Formeluppsats" : "Formula Essay"}</Badge>
                          <Badge variant="secondary">{isSv ? "Kemiuppsats" : "Chemistry Essay"}</Badge>
                        </div>
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
                          <strong>Video:</strong> {isSv ? "Ladda upp videofiler eller klistra in video-URL:er för automatisk transkription" : "Upload video files or paste video URLs for automatic transcription"}
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
                        <span className="text-muted-foreground">{isSv ? "T.ex. Medel" : "E.g., Medium"}</span>
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
                        <span>{isSv ? "Lägg till eller ta bort taggar (inklusive TentaGen-tagg)" : "Add or remove tags (including TentaGen tag)"}</span>
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
                      <li className="flex items-start gap-2">
                        <Badge variant="outline">Word (.docx)</Badge>
                        <span>
                          {isSv
                            ? "Professionellt Word-dokument med frågor, svarsalternativ, rätta svar och bedömningsanvisningar. Perfekt för utskrift, granskning eller arkivering."
                            : "Professional Word document with questions, answer options, correct answers, and grading guides. Perfect for printing, review, or archiving."}
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
                            ? "Du kan välja exportformat både i förhandsvisningen efter generering och i biblioteket. Word-export inkluderar TentaGen-märkning, metadata och bedömningsanvisningar."
                            : "You can choose export format both in the preview after generation and in the library. Word export includes TentaGen branding, metadata, and grading guides."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  {isSv ? "Så importerar du frågor" : "How to Import Questions"}
                </CardTitle>
                <CardDescription>
                  {isSv
                    ? "Steg-för-steg-guider för att importera dina exporterade frågor till olika plattformar"
                    : "Step-by-step guides for importing your exported questions into various platforms"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {/* Wiseflow Legacy JSON Import */}
                  <AccordionItem value="wiseflow-legacy">
                    <AccordionTrigger className="text-base font-semibold">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Legacy JSON</Badge>
                        {isSv ? "Importera till Wiseflow (Legacy/Utgående)" : "Import to Wiseflow (Legacy)"}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {isSv
                          ? "Följ dessa steg för att importera legacy JSON-frågor till Wiseflow:"
                          : "Follow these steps to import legacy JSON questions into Wiseflow:"}
                      </p>
                      <ol className="space-y-6 text-sm">
                        <li className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                              1
                            </div>
                            <div>
                              <p className="font-medium">
                                {isSv
                                  ? "Öppna huvudsidan och navigera till \"Uppgifter (utgående)\""
                                  : "Open the main page and navigate to \"Uppgifter (utgående)\""}
                              </p>
                              <p className="text-muted-foreground mt-1">
                                {isSv
                                  ? "Detta är den äldre uppgiftshanteringen i Wiseflow."
                                  : "This is the legacy task management section in Wiseflow."}
                              </p>
                            </div>
                          </div>
                          <div className="ml-9 rounded-lg border overflow-hidden">
                            <Image src="/guide-images/guide-step-1.png" alt={isSv ? "Författaröversikt med Uppgifter (utgående) markerat" : "Author overview with Uppgifter (utgående) highlighted"} width={600} height={400} className="w-full h-auto" />
                          </div>
                        </li>
                        <li className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                              2
                            </div>
                            <div>
                              <p className="font-medium">
                                {isSv
                                  ? "Navigera till \"Innehållsbank\""
                                  : "Navigate to \"Innehållsbank\" (Content Bank)"}
                              </p>
                            </div>
                          </div>
                          <div className="ml-9 rounded-lg border overflow-hidden">
                            <Image src="/guide-images/guide-step-2.png" alt={isSv ? "Författare-sida med Innehållsbank markerat" : "Author page with Innehållsbank highlighted"} width={600} height={400} className="w-full h-auto" />
                          </div>
                        </li>
                        <li className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                              3
                            </div>
                            <div>
                              <p className="font-medium">
                                {isSv
                                  ? "Klicka på importknappen"
                                  : "Click the import button"}
                              </p>
                            </div>
                          </div>
                          <div className="ml-9 rounded-lg border overflow-hidden">
                            <Image src="/guide-images/guide-step-3.png" alt={isSv ? "Innehållsbank med importknapp markerad" : "Content bank with import button highlighted"} width={600} height={400} className="w-full h-auto" />
                          </div>
                        </li>
                        <li className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                              4
                            </div>
                            <div>
                              <p className="font-medium">
                                {isSv
                                  ? "Välj \"Wiseflow\" i rullgardinsmenyn och klicka \"Välj fil\""
                                  : "Choose \"Wiseflow\" in the dropdown and click \"Välj fil\" (Choose file)"}
                              </p>
                              <p className="text-muted-foreground mt-1">
                                {isSv
                                  ? "Välj din exporterade .json-fil från TentaGen."
                                  : "Select your exported .json file from TentaGen."}
                              </p>
                            </div>
                          </div>
                          <div className="ml-9 rounded-lg border overflow-hidden">
                            <Image src="/guide-images/guide-step-4.png" alt={isSv ? "Importdialog med WISEflow valt och Välj fil-knapp" : "Import dialog with WISEflow selected and Choose file button"} width={300} height={300} className="w-full max-w-sm h-auto" />
                          </div>
                        </li>
                        <li className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                              5
                            </div>
                            <div>
                              <p className="font-medium">
                                {isSv
                                  ? "Förhandsgranska frågorna, lägg till taggar om du vill, och klicka importera"
                                  : "Preview the questions, add tags if needed, and click import"}
                              </p>
                            </div>
                          </div>
                          <div className="ml-9 rounded-lg border overflow-hidden">
                            <Image src="/guide-images/guide-step-5.png" alt={isSv ? "Förhandsvisning av frågor med taggar innan import" : "Preview of questions with tags before import"} width={600} height={300} className="w-full h-auto" />
                          </div>
                        </li>
                      </ol>
                      <div className="rounded-lg bg-muted p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            {isSv
                              ? "Använd exportformatet \"Wiseflow Legacy JSON\" i TentaGen för denna importmetod."
                              : "Use the \"Wiseflow Legacy JSON\" export format in TentaGen for this import method."}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Wiseflow New JSON Import */}
                  <AccordionItem value="wiseflow-new">
                    <AccordionTrigger className="text-base font-semibold">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{isSv ? "Ny JSON" : "New JSON"}</Badge>
                        {isSv ? "Importera till Wiseflow (Ny JSON)" : "Import to Wiseflow (New JSON)"}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {isSv
                          ? "Följ dessa steg för att importera det nya JSON-formatet till Wiseflow:"
                          : "Follow these steps to import the new JSON format into Wiseflow:"}
                      </p>
                      <ol className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Öppna huvudsidan och navigera till \"Uppgifter\""
                                : "Open the main page and navigate to \"Uppgifter\" (Tasks)"}
                            </p>
                            <p className="text-muted-foreground mt-1">
                              {isSv
                                ? "Använd den nya uppgiftshanteringen (inte utgående)."
                                : "Use the new task management (not the legacy/utgående)."}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Navigera till \"Innehållsbank\""
                                : "Navigate to \"Innehållsbank\" (Content Bank)"}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Klicka på importknappen och välj \"Wiseflow\" som format"
                                : "Click the import button and choose \"Wiseflow\" as format"}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            4
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Välj din exporterade .json-fil och klicka importera"
                                : "Select your exported .json file and click import"}
                            </p>
                          </div>
                        </li>
                      </ol>
                      <div className="rounded-lg bg-muted p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            {isSv
                              ? "Använd exportformatet \"Ny Wiseflow JSON\" i TentaGen. Det nya formatet inkluderar labels med ID-fält."
                              : "Use the \"New Wiseflow JSON\" export format in TentaGen. The new format includes labels with ID fields."}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* QTI / Inspera Import */}
                  <AccordionItem value="inspera-qti">
                    <AccordionTrigger className="text-base font-semibold">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">QTI 2.2</Badge>
                        {isSv ? "Importera till Inspera" : "Import to Inspera"}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {isSv
                          ? "Följ dessa steg för att importera QTI 2.2-frågor till Inspera:"
                          : "Follow these steps to import QTI 2.2 questions into Inspera:"}
                      </p>
                      <ol className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Exportera frågorna med formatet \"QTI 2.2 Inspera\" i TentaGen"
                                : "Export questions using the \"QTI 2.2 Inspera\" format in TentaGen"}
                            </p>
                            <p className="text-muted-foreground mt-1">
                              {isSv
                                ? "Detta laddar ner en .zip-fil med QTI 2.2-kompatibla XML-filer."
                                : "This downloads a .zip file with QTI 2.2 compatible XML files."}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Logga in på Inspera och gå till \"Frågebank\" eller \"Item Bank\""
                                : "Log into Inspera and go to \"Item Bank\""}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Klicka \"Importera\" och välj den nedladdade .zip-filen"
                                : "Click \"Import\" and select the downloaded .zip file"}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            4
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Granska importerade frågor och verifiera formatering"
                                : "Review imported questions and verify formatting"}
                            </p>
                          </div>
                        </li>
                      </ol>
                      <div className="rounded-lg bg-muted p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            {isSv
                              ? "QTI 2.2 Inspera-formatet stöder flerval, sant/falskt och essäfrågor. Inspera-specifik metadata inkluderas automatiskt."
                              : "QTI 2.2 Inspera format supports multiple choice, true/false, and essay questions. Inspera-specific metadata is included automatically."}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Other LMS (QTI 2.1) Import */}
                  <AccordionItem value="other-lms">
                    <AccordionTrigger className="text-base font-semibold">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">QTI 2.1</Badge>
                        {isSv ? "Importera till andra LMS (Canvas, Moodle, m.m.)" : "Import to Other LMS (Canvas, Moodle, etc.)"}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {isSv
                          ? "QTI 2.1 är ett universellt format som stöds av de flesta lärplattformar:"
                          : "QTI 2.1 is a universal format supported by most learning management systems:"}
                      </p>
                      <ol className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Exportera frågorna med formatet \"QTI 2.1\" i TentaGen"
                                : "Export questions using the \"QTI 2.1\" format in TentaGen"}
                            </p>
                            <p className="text-muted-foreground mt-1">
                              {isSv
                                ? "Detta laddar ner en .zip-fil med QTI 2.1-kompatibla XML-filer."
                                : "This downloads a .zip file with QTI 2.1 compatible XML files."}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Logga in på din LMS-plattform (Canvas, Moodle, Blackboard, etc.)"
                                : "Log into your LMS platform (Canvas, Moodle, Blackboard, etc.)"}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Hitta importfunktionen för frågebanken (vanligtvis under \"Frågor\" eller \"Question Bank\")"
                                : "Find the question bank import function (usually under \"Questions\" or \"Question Bank\")"}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                            4
                          </div>
                          <div>
                            <p className="font-medium">
                              {isSv
                                ? "Välj \"QTI\" eller \"IMS QTI\" som importformat och ladda upp .zip-filen"
                                : "Select \"QTI\" or \"IMS QTI\" as import format and upload the .zip file"}
                            </p>
                          </div>
                        </li>
                      </ol>
                      <div className="rounded-lg bg-muted p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            {isSv
                              ? "QTI 2.1-formatet fungerar med Canvas, Moodle, Blackboard, D2L Brightspace och de flesta andra LMS-plattformar. Kontrollera din plattforms dokumentation för specifika QTI-importsteg."
                              : "QTI 2.1 format works with Canvas, Moodle, Blackboard, D2L Brightspace, and most other LMS platforms. Check your platform's documentation for specific QTI import steps."}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
                  <div>
                    <h4 className="font-semibold mb-2">{isSv ? "Standardfrågetyper" : "Default Question Types"}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          {isSv
                            ? "Välj vilka frågetyper som ska vara förvalda när du genererar frågor. Sparas automatiskt och laddas nästa gång du loggar in."
                            : "Choose which question types should be pre-selected when generating questions. Saved automatically and loaded next time you log in."}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          {isSv
                            ? "Alla 20 frågetyper organiserade i tre kategorier: Grundläggande, Utökade och Specialiserade."
                            : "All 20 question types organized in three tiers: Core, Extended, and Specialized."}
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
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {isSv
                              ? "Använd 'Blandad' svårighetsgrad för en jämn mix av lätta, medel och svåra frågor — varje fråga får en egen svårighetsmärkning"
                              : "Use 'Mixed' difficulty for a balanced mix of easy, medium, and hard questions — each question gets its own difficulty badge"}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {isSv
                              ? "Konfigurera standardfrågetyper i Inställningar för att spara tid vid varje generering"
                              : "Configure default question types in Settings to save time on each generation"}
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
