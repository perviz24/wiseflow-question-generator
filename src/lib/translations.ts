// Translation system for Swedish/English UI

export type Language = "sv" | "en"

export interface Translations {
  // Header & Navigation
  appTitle: string
  signIn: string
  signOut: string
  settings: string
  back: string
  home: string
  myLibrary: string
  questionLibrary: string
  selectAll: string
  deleteSelected: string
  documentation: string
  docs: string
  library: string
  cancel: string

  startOver: string
  startOverConfirmTitle: string
  startOverConfirmDescription: string
  startOverConfirmAction: string

  // Onboarding Tour
  tourWelcomeTitle: string
  tourWelcomeDesc: string
  tourSubjectTitle: string
  tourSubjectDesc: string
  tourTypesTitle: string
  tourTypesDesc: string
  tourUploadTitle: string
  tourUploadDesc: string
  tourGenerateTitle: string
  tourGenerateDesc: string
  tourLibraryTitle: string
  tourLibraryDesc: string
  tourNext: string
  tourSkip: string
  tourFinish: string
  tourStepOf: string

  // Home Page
  welcomeTitle: string
  welcomeSubtitle: string
  signInToContinue: string
  createQuestionsTitle: string
  createQuestionsSubtitle: string

  // Question Generator Form
  generateQuestions: string
  generating: string
  subject: string
  subjectPlaceholder: string
  topic: string
  topicPlaceholder: string
  difficulty: string
  easy: string
  medium: string
  hard: string
  mixed: string
  numQuestions: string
  numQuestionsHelp: string
  questionTypes: string
  questionTypesHelp: string
  questionTypesSettingsHint: string
  multipleChoice: string
  trueFalse: string
  essay: string
  language: string
  swedish: string
  english: string
  additionalContext: string
  additionalContextPlaceholder: string
  charactersCount: string
  contextPriorityLabel: string
  prioritySubjectTopic: string
  prioritySubjectTopicDesc: string
  priorityContextOnly: string
  priorityContextOnlyDesc: string
  priorityHybrid: string
  priorityHybridDesc: string
  subjectTopicCleared: string
  exportFormat: string
  exportFormatHelp: string
  legacyFormat: string
  utgaendeFormat: string
  qti21Format: string

  // AI Mode Info
  aiModeInfo: string
  uploadSectionTitle: string
  combineSources: string
  additionalContextTips: string
  generatingProgress: string

  // Content Upload
  uploadDocument: string
  uploadDocumentHelp: string
  andAlso: string
  fetchFromUrls: string
  addMoreUrls: string
  contextGuidanceTip: string
  videoSectionTitle: string
  uploadVideoFile: string
  videoUrlLabel: string
  videoUrlPlaceholder: string
  videoSupportNote: string

  // Tagging Section
  tagsOrganization: string
  tagsOrganizationHelp: string
  termPeriod: string
  termPlaceholder: string
  semester: string
  semesterPlaceholder: string
  examType: string
  examTypePlaceholder: string
  courseCode: string
  courseCodePlaceholder: string
  additionalTags: string
  additionalTagsPlaceholder: string
  additionalTagsHelp: string
  includeAITag: string
  includeLanguageTag: string
  includeTopicTag: string

  // Question Preview
  generatedQuestions: string
  saveToLibrary: string
  saving: string
  exportJSON: string
  exporting: string
  generateNew: string
  generateMoreTitle: string
  generateMoreDesc: string
  howManyMore: string
  chooseBetween: string
  selectOneOrMore: string
  generatingMore: string
  questionType_mcq: string
  questionType_trueFalse: string
  questionType_essay: string
  questionType_shortAnswer: string
  questionType_fillBlank: string
  questionType_multipleResponse: string
  questionType_matching: string
  questionType_ordering: string
  questionType_hotspot: string
  questionType_ratingScale: string
  // Specialized tier types (off by default)
  questionType_choicematrix: string
  questionType_clozetext: string
  questionType_clozedropdown: string
  questionType_orderlist: string
  questionType_tokenhighlight: string
  questionType_clozeassociation: string
  questionType_imageclozeassociationV2: string
  questionType_plaintext: string
  questionType_formulaessayV2: string
  questionType_chemistryessayV2: string
  mixedQuestionTypes: string
  mixedQuestionTypesHelp: string
  showMoreTypes: string
  showLessTypes: string
  moreTypesInSettings: string
  questionNumber: string
  questionsAbout: string
  questionSingular: string
  questionPlural: string
  export: string
  exportWordSuccess: string
  exportWordDesc: string
  exportCSVSuccess: string
  exportCSVDesc: string
  exportQti21Success: string
  exportQti21Desc: string
  exportQti22Success: string
  exportQti22Desc: string
  exportWiseflowDesc: string
  newWiseflowJson: string
  legacyJson: string
  qti21Zip: string
  qti22InsperaZip: string
  wordDocx: string
  csvExcelSheets: string
  instructorGuidance: string
  multipleCorrectPossible: string
  termLabel: string
  matchLabel: string
  correctPairs: string
  arrangeCorrectOrder: string
  enterPositionNumbers: string
  numbersShowSequence: string
  imageBasedQuestion: string
  hotspotDefaultInstruction: string
  correctAreas: string
  addAreaName: string
  correctAnswers: string
  addNewAnswer: string
  studentAnswerPlaceholder: string
  sampleAnswer: string
  answerOptions: string
  ratingLow: string
  ratingHigh: string
  expectedRating: string
  invalidPoints: string
  invalidPointsDesc: string
  cannotRegenerate: string
  cannotRegenerateDesc: string
  alternativesRegenerated: string
  alternativesRegeneratedDesc: string
  regenerationFailed: string
  noTypesSelected: string
  noTypesSelectedDesc: string
  invalidQuestionCount: string
  invalidQuestionCountDesc: string
  questionsAdded: string
  questionsAddedDesc: string
  langSwedish: string
  langEnglish: string

  // Settings Page
  profileSettings: string
  profileSettingsDescription: string
  tutorInitials: string
  tutorInitialsPlaceholder: string
  tutorInitialsHelp: string
  uiLanguage: string
  uiLanguageHelp: string
  saveSettings: string
  // Question Types Management
  manageQuestionTypes: string
  questionTypesTitle: string
  questionTypesDescription: string
  tierCore: string
  tierCoreDesc: string
  tierExtended: string
  tierExtendedDesc: string
  tierSpecialized: string
  tierSpecializedDesc: string
  categoryLanguage: string
  categoryScience: string
  categoryGeneral: string
  categoryMath: string
  alwaysOn: string
  resetToDefaults: string
  typesUpdated: string
  typesUpdateFailed: string
  // Question type tooltips (info icon hover text)
  typeDesc_mcq: string
  typeDesc_multiple_response: string
  typeDesc_true_false: string
  typeDesc_longtextV2: string
  typeDesc_short_answer: string
  typeDesc_fill_blank: string
  typeDesc_matching: string
  typeDesc_ordering: string
  typeDesc_choicematrix: string
  typeDesc_clozetext: string
  typeDesc_clozedropdown: string
  typeDesc_orderlist: string
  typeDesc_tokenhighlight: string
  typeDesc_clozeassociation: string
  typeDesc_imageclozeassociationV2: string
  typeDesc_plaintext: string
  typeDesc_formulaessayV2: string
  typeDesc_chemistryessayV2: string

  // Library Page
  editTags: string
  addTag: string
  addTagPlaceholder: string
  tagAdded: string
  tagRemoved: string
  tagsUpdated: string
  tagsUpdateFailed: string
  filterByTag: string
  filterByType: string
  filterByDifficulty: string
  filterByDate: string
  allTypes: string
  allDifficulties: string
  clearFilters: string
  showing: string
  of: string
  questions: string
  sortBy: string
  sortNewest: string
  sortOldest: string
  points: string
  editPoints: string
  editDifficulty: string
  pointsUpdated: string
  difficultyUpdated: string
  updateFailed: string

  // Toast Messages
  questionsGenerated: string
  questionsGeneratedDesc: string
  generationFailed: string
  generationFailedDesc: string
  questionsSaved: string
  questionsSavedDesc: string
  saveFailed: string
  saveFailedDesc: string
  exportSuccessful: string
  exportSuccessfulDesc: string
  exportFailed: string
  exportFailedDesc: string
  settingsSaved: string
  settingsSavedDescCreated: string
  settingsSavedDescUpdated: string
  settingsSaveFailed: string
  settingsSaveFailedDesc: string

  // Hero Benefits
  heroSaveTime: string
  heroReviewEdit: string
  heroMultipleFormats: string
  instructionManual: string

  // Library Page
  librarySubtitle: string

  // Footer
  footerDeveloper: string
  footerEmail: string
  footerBeta: string
  footerPermission: string
  footerFeedback: string

  // Feedback
  feedbackTitle: string
  feedbackDescription: string
  feedbackType: string
  feedbackTypeBug: string
  feedbackTypeImprovement: string
  feedbackTypeOther: string
  feedbackMessage: string
  feedbackMessagePlaceholder: string
  feedbackEmail: string
  feedbackEmailPlaceholder: string
  feedbackSubmit: string
  feedbackSuccess: string
  feedbackSuccessDesc: string
  feedbackError: string
  feedbackErrorDesc: string
}

export const translations: Record<Language, Translations> = {
  sv: {
    // Header & Navigation
    appTitle: "TentaGen",
    signIn: "Logga in",
    signOut: "Logga ut",
    settings: "Inställningar",
    back: "Tillbaka",
    home: "Hem",
    myLibrary: "Mitt bibliotek",
    questionLibrary: "Frågebibliotek",
    selectAll: "Markera alla",
    deleteSelected: "Ta bort valda",
    documentation: "Dokumentation",
    docs: "Dokument",
    library: "Bibliotek",
    cancel: "Avbryt",
    startOver: "Börja om",
    startOverConfirmTitle: "Börja om?",
    startOverConfirmDescription: "Alla ogenerade frågor och formulärdata kommer att raderas. Sparade frågor i biblioteket påverkas inte.",
    startOverConfirmAction: "Ja, börja om",

    // Onboarding Tour
    tourWelcomeTitle: "Välkommen till TentaGen! 👋",
    tourWelcomeDesc: "Låt oss visa dig runt snabbt. Det tar bara 30 sekunder.",
    tourSubjectTitle: "Ämne & ämnesområde",
    tourSubjectDesc: "Börja med att ange ämne och ämnesområde. AI:n använder dessa för att skapa relevanta frågor.",
    tourTypesTitle: "Välj frågetyper",
    tourTypesDesc: "Välj vilka frågetyper du vill generera — flerval, essä, sant/falskt, med mera.",
    tourUploadTitle: "Ladda upp källmaterial",
    tourUploadDesc: "Ladda upp dokument, klistra in URL:er eller YouTube-videor som AI:n baserar frågorna på.",
    tourGenerateTitle: "Generera frågor",
    tourGenerateDesc: "Klicka här för att generera frågor! Du kan sedan granska, redigera och spara dem till ditt bibliotek.",
    tourLibraryTitle: "Ditt bibliotek",
    tourLibraryDesc: "Sparade frågor hamnar i biblioteket. Där kan du redigera, exportera till Word/CSV/QTI och organisera.",
    tourNext: "Nästa",
    tourSkip: "Hoppa över",
    tourFinish: "Klar!",
    tourStepOf: "av",

    // Home Page
    welcomeTitle: "Välkommen till TentaGen",
    welcomeSubtitle: "Generera högkvalitativa tentafrågor med AI. Logga in för att komma igång.",
    signInToContinue: "Logga in för att fortsätta",
    createQuestionsTitle: "Smartare tentafrågor för utbildningsorganisationer",
    createQuestionsSubtitle: "Låt AI generera frågor från sin kunskapsbas, ladda upp eget underlag för kontroll över innehållet, eller kombinera båda",

    // Question Generator Form
    generateQuestions: "Generera frågor",
    generating: "Genererar frågor...",
    subject: "Ämne",
    subjectPlaceholder: "t.ex. Biologi, Matematik, Historia",
    topic: "Ämnesområde",
    topicPlaceholder: "t.ex. Celldelning, Algebra, Andra världskriget",
    difficulty: "Svårighetsgrad",
    easy: "Lätt",
    medium: "Medel",
    hard: "Svår",
    mixed: "Blandat",
    numQuestions: "Antal frågor",
    numQuestionsHelp: "Välj mellan 1 och 20 frågor",
    questionTypes: "Frågetyper",
    questionTypesHelp: "Välj minst en frågetyp",
    questionTypesSettingsHint: "Fler frågetyper kan aktiveras under Inställningar.",
    multipleChoice: "Flervalsfråga",
    trueFalse: "Sant/Falskt",
    essay: "Essä",
    language: "Språk",
    swedish: "Svenska",
    english: "Engelska",
    additionalContext: "Ytterligare kontext (valfritt)",
    additionalContextPlaceholder: "Lägg till specifika instruktioner, lärandemål eller kontext för frågorna...",
    charactersCount: "tecken",
    contextPriorityLabel: "Hur ska AI hantera uppladdad kontext?",
    prioritySubjectTopic: "Respektera Ämne & Ämnesområde",
    prioritySubjectTopicDesc: "AI använder både ämne/ämnesområde OCH uppladdad kontext. Kan ge blandade frågor om de inte matchar.",
    priorityContextOnly: "Prioritera Uppladdad Kontext",
    priorityContextOnlyDesc: "AI genererar frågor strikt baserat på uppladdad kontext. Ämne/ämnesområde används endast för kategorisering.",
    priorityHybrid: "Hybrid (Rekommenderas)",
    priorityHybridDesc: "AI prioriterar uppladdad kontext men behåller ämne/ämnesområde som referens för sammanhang.",
    subjectTopicCleared: "Ämne och ämnesområde rensade - de kommer inte påverka frågegenerering",
    exportFormat: "Exportformat",
    exportFormatHelp: "Välj Wiseflow JSON-format för ditt tentacenter",
    legacyFormat: "Ny Wiseflow JSON",
    utgaendeFormat: "Legacy JSON",
    qti21Format: "QTI 2.1 (Universal LMS)",

    // AI Mode Info
    aiModeInfo: "AI kan generera frågor från sin allmänna kunskapsbas (inga filer behövs), från ditt uppladdade underlag (dokument, URL, video), eller en kombination av båda.",
    uploadSectionTitle: "Vill du ladda upp underlag för frågorna?",
    combineSources: "Du kan kombinera flera källor! Ladda upp dokument, URL:er och video samtidigt — AI sammanställer allt.",
    additionalContextTips: "💡 Tips: Styr hur AI genererar frågor! Exempel:\n• \"Generera 3 frågor från videon och 3 från dokumentet\"\n• \"Fokusera enbart på kapitel 5 i PDF:en\"\n• \"Gör frågorna kliniskt inriktade\"",
    generatingProgress: "Det tar ungefär 30 sekunder att generera frågor...",

    // Content Upload
    uploadDocument: "📄 Dokument",
    uploadDocumentHelp: "PDF, Word (.docx) eller PowerPoint (.pptx). Välj flera filer samtidigt. Inga filstorleksbegränsningar.",
    andAlso: "och/eller",
    fetchFromUrls: "🌐 Webbadresser",
    addMoreUrls: "Lägg till fler URL:er",
    contextGuidanceTip: '💡 <strong>Tips:</strong> Du kan vägleda AI här! Exempel: "Generera 5 frågor från filen och 5 från URL:en" eller "Fokusera främst på det uppladdade dokumentet"',
    videoSectionTitle: "🎬 Förvandla inspelad videoföreläsning till tentafrågor",
    uploadVideoFile: "Ladda upp videofil",
    videoUrlLabel: "Eller klistra in en YouTube- eller direktlänk",
    videoUrlPlaceholder: "https://youtube.com/watch?v=... eller .mp4-länk",
    videoSupportNote: "AI transkriberar och analyserar hela videon — vanligtvis klart inom 3–5 min för en 30 min föreläsning.",

    // Tagging Section
    tagsOrganization: "Taggar & Organisation",
    tagsOrganizationHelp: "Auto-taggar: Ämne, Ämnesområde, Frågetyp, Svårighetsgrad, Språk, Tidsstämpel",
    termPeriod: "Termin/Period",
    termPlaceholder: "t.ex. T3",
    semester: "Läsår",
    semesterPlaceholder: "t.ex. HT25",
    examType: "Tentaform",
    examTypePlaceholder: "t.ex. Ordinarie",
    courseCode: "Kurskod",
    courseCodePlaceholder: "t.ex. BIO101",
    additionalTags: "Ytterligare taggar (valfritt)",
    additionalTagsPlaceholder: "t.ex. Ögon, Makula, LO1 (kommaseparerade)",
    additionalTagsHelp: "Separera flera taggar med kommatecken",
    includeAITag: "Inkludera 'TentaGen' tagg",
    includeLanguageTag: "Inkludera språktagg (t.ex. 'Svenska')",
    includeTopicTag: "Inkludera ämnesområdestagg",

    // Question Preview
    generatedQuestions: "Genererade frågor",
    saveToLibrary: "Spara till bibliotek",
    saving: "Sparar...",
    exportJSON: "Exportera JSON",
    exporting: "Exporterar...",
    generateNew: "Generera nya frågor",
    generateMoreTitle: "Generera fler frågor",
    generateMoreDesc: "Lägg till fler frågor till ditt befintliga set utan att lämna denna sida",
    howManyMore: "Hur många fler frågor?",
    chooseBetween: "Välj mellan 1 och 20",
    selectOneOrMore: "Välj en eller flera typer",
    generatingMore: "Genererar {count} fler frågor...",
    questionType_mcq: "Flervalsfråga",
    questionType_trueFalse: "Sant/Falskt",
    questionType_essay: "Essä",
    questionType_shortAnswer: "Kort svar",
    questionType_fillBlank: "Ifyllnad",
    questionType_multipleResponse: "Flera rätt",
    questionType_matching: "Matchning",
    questionType_ordering: "Ordningsföljd",
    questionType_hotspot: "Bildmarkering",
    questionType_ratingScale: "Betygsskala",
    // Specialized tier types
    questionType_choicematrix: "Valmatris",
    questionType_clozetext: "Lucktext (fritext)",
    questionType_clozedropdown: "Rullgardinslucka",
    questionType_orderlist: "Ordningslista",
    questionType_tokenhighlight: "Markera text",
    questionType_clozeassociation: "Dra-och-släpp (text)",
    questionType_imageclozeassociationV2: "Dra-och-släpp (bild)",
    questionType_plaintext: "Fritext (enkel)",
    questionType_formulaessayV2: "Essä (matematik)",
    questionType_chemistryessayV2: "Essä (kemi)",
    mixedQuestionTypes: "Blandat",
    mixedQuestionTypesHelp: "Väljer alla aktiverade frågetyper och fördelar frågorna jämnt",
    showMoreTypes: "Fler frågetyper",
    showLessTypes: "Färre frågetyper",
    moreTypesInSettings: "Gå till Inställningar för att aktivera ytterligare {count} frågetyper",
    questionNumber: "Fråga {n}",
    questionsAbout: "{count} {unit} om",
    questionSingular: "fråga",
    questionPlural: "frågor",
    export: "Exportera",
    exportWordSuccess: "Word exporterad!",
    exportWordDesc: "Frågor exporterade som Word (.docx)-dokument.",
    exportCSVSuccess: "CSV exporterad!",
    exportCSVDesc: "Frågor exporterade i CSV-format för Excel/Google Sheets.",
    exportQti21Success: "QTI 2.1 exporterad!",
    exportQti21Desc: "Frågor exporterade i QTI 2.1-format (ZIP-fil).",
    exportQti22Success: "QTI 2.2 Inspera exporterad!",
    exportQti22Desc: "Frågor exporterade i QTI 2.2 Inspera-format (ZIP-fil).",
    exportWiseflowDesc: "Frågor exporterade i Wiseflow innehållsbank-format.",
    newWiseflowJson: "Ny Wiseflow JSON",
    legacyJson: "Äldre JSON",
    qti21Zip: "QTI 2.1 (ZIP)",
    qti22InsperaZip: "QTI 2.2 Inspera (ZIP)",
    wordDocx: "Word (.docx)",
    csvExcelSheets: "CSV (Excel/Sheets)",
    instructorGuidance: "Bedömningsanvisning",
    multipleCorrectPossible: "✓ Flera rätta svar möjliga",
    termLabel: "Term:",
    matchLabel: "Match:",
    correctPairs: "✓ Korrekta par:",
    arrangeCorrectOrder: "Ordna i korrekt ordning:",
    enterPositionNumbers: "Ange positionsnummer (1, 2, 3...)",
    numbersShowSequence: "Siffrorna visar korrekt ordning",
    imageBasedQuestion: "Bildbaserad fråga",
    hotspotDefaultInstruction: "Klicka eller tryck på rätt område i bilden/diagrammet",
    correctAreas: "✓ Korrekta områden:",
    addAreaName: "Lägg till områdesnamn...",
    correctAnswers: "✓ Korrekta svar:",
    addNewAnswer: "Lägg till nytt svar...",
    studentAnswerPlaceholder: "Studenten skriver 1-3 meningar här...",
    sampleAnswer: "✓ Exempelsvar:",
    answerOptions: "Svarsalternativ:",
    ratingLow: "Låg",
    ratingHigh: "Hög",
    expectedRating: "✓ Förväntat betyg:",
    invalidPoints: "Ogiltiga poäng",
    invalidPointsDesc: "Ange ett giltigt positivt nummer för poäng.",
    cannotRegenerate: "Kan inte generera om",
    cannotRegenerateDesc: "Essäfrågor har inga svarsalternativ att generera om.",
    alternativesRegenerated: "Alternativ omgenererade!",
    alternativesRegeneratedDesc: "Nya svarsalternativ har genererats för denna fråga.",
    regenerationFailed: "Omgenerering misslyckades",
    noTypesSelected: "Inga frågetyper valda",
    noTypesSelectedDesc: "Välj minst en frågetyp att generera.",
    invalidQuestionCount: "Ogiltigt antal frågor",
    invalidQuestionCountDesc: "Ange ett nummer mellan 1 och 20.",
    questionsAdded: "{count} frågor tillagda!",
    questionsAddedDesc: "Nya frågor har lagts till i ditt set.",
    langSwedish: "Svenska",
    langEnglish: "Engelska",

    // Library Page
    editTags: "Redigera taggar",
    addTag: "Lägg till tagg",
    addTagPlaceholder: "Skriv taggnamn...",
    tagAdded: "Tagg tillagd",
    tagRemoved: "Tagg borttagen",
    tagsUpdated: "Taggar uppdaterade",
    tagsUpdateFailed: "Kunde inte uppdatera taggar",
    filterByTag: "Filtrera på tagg",
    filterByType: "Filtrera på typ",
    filterByDifficulty: "Filtrera på svårighetsgrad",
    filterByDate: "Filtrera på datum",
    allTypes: "Alla typer",
    allDifficulties: "Alla svårighetsgrader",
    clearFilters: "Rensa filter",
    showing: "Visar",
    of: "av",
    questions: "frågor",
    sortBy: "Sortera efter",
    sortNewest: "Nyast först",
    sortOldest: "Äldst först",
    points: "Poäng",
    editPoints: "Redigera poäng",
    editDifficulty: "Redigera svårighetsgrad",
    pointsUpdated: "Poäng uppdaterade",
    difficultyUpdated: "Svårighetsgrad uppdaterad",
    updateFailed: "Uppdatering misslyckades",

    // Settings Page
    profileSettings: "Profilinställningar",
    profileSettingsDescription: "Ställ in dina personliga inställningar för frågegenereringen",
    tutorInitials: "Lärarinitialer",
    tutorInitialsPlaceholder: "t.ex. AB, JD, eller id:pma",
    tutorInitialsHelp: "Dessa initialer läggs automatiskt till som tagg på alla dina genererade frågor. Detta hjälper dig att hitta dina frågor.",
    uiLanguage: "Gränssnittsspråk",
    uiLanguageHelp: "Välj vilket språk du vill använda i gränssnittet",
    saveSettings: "Spara inställningar",
    // Question Types Management
    manageQuestionTypes: "Hantera frågetyper",
    questionTypesTitle: "Frågetyper",
    questionTypesDescription: "Välj vilka frågetyper som ska vara tillgängliga i generatorn. Kärntyper är alltid aktiva.",
    tierCore: "Kärntyper",
    tierCoreDesc: "Grundläggande frågetyper — alltid aktiverade",
    tierExtended: "Utökade typer",
    tierExtendedDesc: "Fler frågeformat för variation",
    tierSpecialized: "Specialiserade typer",
    tierSpecializedDesc: "Avancerade typer för specifika ämnen och behov",
    categoryLanguage: "Språk",
    categoryScience: "Naturvetenskap",
    categoryGeneral: "Allmänt",
    categoryMath: "Matematik",
    alwaysOn: "Alltid aktiv",
    resetToDefaults: "Återställ standard",
    typesUpdated: "Frågetyper uppdaterade",
    typesUpdateFailed: "Kunde inte uppdatera frågetyper",
    typeDesc_mcq: "Flervalsfråga med ett rätt svar bland flera alternativ.",
    typeDesc_multiple_response: "Flervalsfråga där flera alternativ kan vara rätt.",
    typeDesc_true_false: "Studenten väljer om ett påstående är sant eller falskt.",
    typeDesc_longtextV2: "Längre fritextsvar med rik textformatering (essä).",
    typeDesc_short_answer: "Kort fritextsvar, 1–3 meningar.",
    typeDesc_fill_blank: "Fyll i luckan — studenten skriver rätt ord i tomrummet.",
    typeDesc_matching: "Para ihop begrepp med rätt definition/kategori.",
    typeDesc_ordering: "Ordna objekt i rätt sekvens/ordning.",
    typeDesc_choicematrix: "Matris med rader och kolumner — t.ex. Sant/Falskt per påstående.",
    typeDesc_clozetext: "Text med flera luckor att fylla i (avancerad ifyllnad).",
    typeDesc_clozedropdown: "Text med rullgardinsmenyer i luckorna — välj rätt ord.",
    typeDesc_orderlist: "Avancerad ordningsfråga med Learnosity orderlist-format.",
    typeDesc_tokenhighlight: "Markera rätt ord eller fras i en text.",
    typeDesc_clozeassociation: "Dra och släpp rätt ord till luckor i texten.",
    typeDesc_imageclozeassociationV2: "Dra och släpp etiketter till rätt plats på en bild.",
    typeDesc_plaintext: "Enkel fritext utan formatering.",
    typeDesc_formulaessayV2: "Svar med matematiska formler (LaTeX-editor).",
    typeDesc_chemistryessayV2: "Svar med kemiska formler och strukturer.",

    // Toast Messages
    questionsGenerated: "Frågor genererade!",
    questionsGeneratedDesc: "Genererade {count} frågor framgångsrikt.",
    generationFailed: "Generering misslyckades",
    generationFailedDesc: "Kunde inte generera frågor. Försök igen.",
    questionsSaved: "Frågor sparade!",
    questionsSavedDesc: "Sparade {count} frågor till ditt bibliotek.",
    saveFailed: "Sparning misslyckades",
    saveFailedDesc: "Kunde inte spara frågor. Försök igen.",
    exportSuccessful: "Export lyckades!",
    exportSuccessfulDesc: "Frågor exporterade till Wiseflow JSON ({format} format).",
    exportFailed: "Export misslyckades",
    exportFailedDesc: "Kunde inte exportera frågor. Försök igen.",
    settingsSaved: "Inställningar sparade!",
    settingsSavedDescCreated: "Din profil har skapats.",
    settingsSavedDescUpdated: "Dina inställningar har uppdaterats.",
    settingsSaveFailed: "Misslyckades att spara",
    settingsSaveFailedDesc: "Kunde inte spara inställningar. Försök igen.",

    // Hero Benefits
    heroSaveTime: "Spara tid med AI",
    heroReviewEdit: "Granska och redigera",
    heroMultipleFormats: "Flera exportformat",
    instructionManual: "Användarmanual",

    // Library Page
    librarySubtitle: "Hantera och organisera alla dina sparade tentafrågor. Redigera, tagga och exportera frågor för användning i WISEflow, Inspera eller andra LMS-plattformar.",

    // Footer
    footerDeveloper: "Utvecklad av",
    footerEmail: "parviz.mammadzada@oru.se",
    footerBeta: "Beta-version",
    footerPermission: "Distribution för bredare bruk kräver tillstånd från utvecklaren.",
    footerFeedback: "Glöm inte att lämna feedback — det hjälper oss att ständigt förbättra TentaGen!",

    // Feedback
    feedbackTitle: "Skicka feedback",
    feedbackDescription: "Hjälp oss förbättra TentaGen genom att rapportera buggar, föreslå funktioner eller dela dina tankar.",
    feedbackType: "Typ av feedback",
    feedbackTypeBug: "🐛 Buggrapport",
    feedbackTypeImprovement: "💡 Förbättringsförslag",
    feedbackTypeOther: "💬 Övrigt",
    feedbackMessage: "Ditt meddelande",
    feedbackMessagePlaceholder: "Beskriv din feedback...",
    feedbackEmail: "Din e-post (valfritt)",
    feedbackEmailPlaceholder: "om du vill bli kontaktad",
    feedbackSubmit: "Skicka feedback",
    feedbackSuccess: "Feedback skickad!",
    feedbackSuccessDesc: "Tack för din feedback. Vi uppskattar ditt bidrag.",
    feedbackError: "Misslyckades att skicka",
    feedbackErrorDesc: "Kunde inte skicka feedback. Försök igen.",
  },
  en: {
    // Header & Navigation
    appTitle: "TentaGen",
    signIn: "Sign In",
    signOut: "Sign Out",
    settings: "Settings",
    back: "Back",
    home: "Home",
    myLibrary: "My Library",
    questionLibrary: "Question Library",
    selectAll: "Select All",
    deleteSelected: "Delete Selected",
    documentation: "Documentation",
    docs: "Docs",
    library: "Library",
    cancel: "Cancel",
    startOver: "Start Over",
    startOverConfirmTitle: "Start over?",
    startOverConfirmDescription: "All unsaved questions and form data will be cleared. Saved questions in your library are not affected.",
    startOverConfirmAction: "Yes, start over",

    // Onboarding Tour
    tourWelcomeTitle: "Welcome to TentaGen! 👋",
    tourWelcomeDesc: "Let us show you around. It only takes 30 seconds.",
    tourSubjectTitle: "Subject & Topic",
    tourSubjectDesc: "Start by entering a subject and topic. The AI uses these to create relevant questions.",
    tourTypesTitle: "Choose question types",
    tourTypesDesc: "Select which question types to generate — MCQ, essay, true/false, and more.",
    tourUploadTitle: "Upload source material",
    tourUploadDesc: "Upload documents, paste URLs, or YouTube videos for the AI to base questions on.",
    tourGenerateTitle: "Generate questions",
    tourGenerateDesc: "Click here to generate questions! You can then review, edit, and save them to your library.",
    tourLibraryTitle: "Your Library",
    tourLibraryDesc: "Saved questions go to your library. There you can edit, export to Word/CSV/QTI, and organize.",
    tourNext: "Next",
    tourSkip: "Skip",
    tourFinish: "Done!",
    tourStepOf: "of",

    // Home Page
    welcomeTitle: "Welcome to TentaGen",
    welcomeSubtitle: "Generate high-quality exam questions using AI. Sign in to get started.",
    signInToContinue: "Sign In to Continue",
    createQuestionsTitle: "Smarter exam questions for educational organizations",
    createQuestionsSubtitle: "Let AI generate questions from its knowledge base, upload your own material for content control, or combine both",

    // Question Generator Form
    generateQuestions: "Generate Questions",
    generating: "Generating Questions...",
    subject: "Subject",
    subjectPlaceholder: "e.g., Biology, Mathematics, History",
    topic: "Topic",
    topicPlaceholder: "e.g., Cell division, Algebra, World War II",
    difficulty: "Difficulty Level",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    mixed: "Mixed",
    numQuestions: "Number of Questions",
    numQuestionsHelp: "Choose between 1 and 20 questions",
    questionTypes: "Question Types",
    questionTypesHelp: "Select at least one question type",
    questionTypesSettingsHint: "More question types can be activated in Settings.",
    multipleChoice: "Multiple Choice",
    trueFalse: "True/False",
    essay: "Essay",
    language: "Language",
    swedish: "Swedish",
    english: "English",
    additionalContext: "Additional Context (Optional)",
    additionalContextPlaceholder: "Add any specific instructions, learning outcomes, or context for the questions...",
    charactersCount: "characters",
    contextPriorityLabel: "How should AI handle uploaded context?",
    prioritySubjectTopic: "Respect Subject & Topic",
    prioritySubjectTopicDesc: "AI uses both subject/topic AND uploaded context. May generate mixed questions if they don't match.",
    priorityContextOnly: "Prioritize Uploaded Context",
    priorityContextOnlyDesc: "AI generates questions strictly based on uploaded context. Subject/topic used only for categorization.",
    priorityHybrid: "Hybrid (Recommended)",
    priorityHybridDesc: "AI prioritizes uploaded context but keeps subject/topic as reference for context.",
    subjectTopicCleared: "Subject and topic cleared - they won't influence question generation",
    exportFormat: "Export Format",
    exportFormatHelp: "Choose the Wiseflow JSON format for your exam center",
    legacyFormat: "New Wiseflow JSON",
    utgaendeFormat: "Legacy JSON",
    qti21Format: "QTI 2.1 (Universal LMS)",

    // AI Mode Info
    aiModeInfo: "AI can generate questions from its general knowledge base (no files needed), from your uploaded materials (documents, URLs, video), or a combination of both.",
    uploadSectionTitle: "Want to upload source material for the questions?",
    combineSources: "You can combine multiple sources! Upload documents, URLs, and video at the same time — AI combines everything.",
    additionalContextTips: "💡 Tips: Control how AI generates questions! Examples:\n• \"Generate 3 questions from the video and 3 from the document\"\n• \"Focus only on chapter 5 of the PDF\"\n• \"Make the questions clinically oriented\"",
    generatingProgress: "It takes about 30 seconds to generate questions...",

    // Content Upload
    uploadDocument: "📄 Documents",
    uploadDocumentHelp: "PDF, Word (.docx), or PowerPoint (.pptx). Select multiple files at once. No file size limitations.",
    andAlso: "and/or",
    fetchFromUrls: "🌐 Web URLs",
    addMoreUrls: "Add More URLs",
    contextGuidanceTip: '💡 <strong>Tip:</strong> You can guide AI here! Example: "Generate 5 questions from the file and 5 from the URL" or "Focus primarily on the uploaded document"',
    videoSectionTitle: "🎬 Turn recorded video lectures into exam questions",
    uploadVideoFile: "Upload video file",
    videoUrlLabel: "Or paste a YouTube or direct link",
    videoUrlPlaceholder: "https://youtube.com/watch?v=... or .mp4 link",
    videoSupportNote: "AI transcribes and analyzes the full video — typically done in 3–5 min for a 30 min lecture.",

    // Tagging Section
    tagsOrganization: "Tags & Organization",
    tagsOrganizationHelp: "Auto-tags: Subject, Topic, Question Type, Difficulty, Language, Timestamp",
    termPeriod: "Term/Period",
    termPlaceholder: "e.g., T3",
    semester: "Semester",
    semesterPlaceholder: "e.g., HT25",
    examType: "Exam Type",
    examTypePlaceholder: "e.g., Ordinarie",
    courseCode: "Course Code",
    courseCodePlaceholder: "e.g., BIO101",
    additionalTags: "Additional Tags (Optional)",
    additionalTagsPlaceholder: "e.g., Ögon, Makula, LO1 (comma-separated)",
    additionalTagsHelp: "Separate multiple tags with commas",
    includeAITag: "Include 'TentaGen' tag",
    includeLanguageTag: "Include language tag (e.g., 'English')",
    includeTopicTag: "Include topic tag",

    // Question Preview
    generatedQuestions: "Generated Questions",
    saveToLibrary: "Save to Library",
    saving: "Saving...",
    exportJSON: "Export JSON",
    exporting: "Exporting...",
    generateNew: "Generate New Questions",
    generateMoreTitle: "Generate More Questions",
    generateMoreDesc: "Add additional questions to your existing set without leaving this page",
    howManyMore: "How many more questions?",
    chooseBetween: "Choose between 1 and 20",
    selectOneOrMore: "Select one or more types",
    generatingMore: "Generating {count} more questions...",
    questionType_mcq: "Multiple Choice",
    questionType_trueFalse: "True/False",
    questionType_essay: "Essay",
    questionType_shortAnswer: "Short Answer",
    questionType_fillBlank: "Fill in the Blank",
    questionType_multipleResponse: "Multiple Response",
    questionType_matching: "Matching",
    questionType_ordering: "Ordering",
    questionType_hotspot: "Image Hotspot",
    questionType_ratingScale: "Rating Scale",
    // Specialized tier types
    questionType_choicematrix: "Choice Matrix",
    questionType_clozetext: "Cloze (Text Entry)",
    questionType_clozedropdown: "Cloze (Dropdown)",
    questionType_orderlist: "Order List",
    questionType_tokenhighlight: "Token Highlight",
    questionType_clozeassociation: "Drag & Drop (Text)",
    questionType_imageclozeassociationV2: "Drag & Drop (Image)",
    questionType_plaintext: "Plain Text",
    questionType_formulaessayV2: "Essay (Math)",
    questionType_chemistryessayV2: "Essay (Chemistry)",
    mixedQuestionTypes: "Mixed",
    mixedQuestionTypesHelp: "Selects all enabled question types and distributes questions evenly",
    showMoreTypes: "More Question Types",
    showLessTypes: "Less Question Types",
    moreTypesInSettings: "Go to Settings to activate {count} more question types",
    questionNumber: "Question {n}",
    questionsAbout: "{count} {unit} about",
    questionSingular: "question",
    questionPlural: "questions",
    export: "Export",
    exportWordSuccess: "Word exported!",
    exportWordDesc: "Questions exported as Word (.docx) document.",
    exportCSVSuccess: "CSV exported!",
    exportCSVDesc: "Questions exported in CSV format for Excel/Google Sheets.",
    exportQti21Success: "QTI 2.1 exported!",
    exportQti21Desc: "Questions exported in QTI 2.1 format (ZIP file).",
    exportQti22Success: "QTI 2.2 Inspera exported!",
    exportQti22Desc: "Questions exported in QTI 2.2 Inspera format (ZIP file).",
    exportWiseflowDesc: "Questions exported in Wiseflow innehållsbank format.",
    newWiseflowJson: "New Wiseflow JSON",
    legacyJson: "Legacy JSON",
    qti21Zip: "QTI 2.1 (ZIP)",
    qti22InsperaZip: "QTI 2.2 Inspera (ZIP)",
    wordDocx: "Word (.docx)",
    csvExcelSheets: "CSV (Excel/Sheets)",
    instructorGuidance: "Instructor Guidance",
    multipleCorrectPossible: "✓ Multiple correct answers possible",
    termLabel: "Term:",
    matchLabel: "Match:",
    correctPairs: "✓ Correct pairs:",
    arrangeCorrectOrder: "Arrange in correct order:",
    enterPositionNumbers: "Enter position numbers (1, 2, 3...)",
    numbersShowSequence: "Numbers show the correct sequence",
    imageBasedQuestion: "Image-based question",
    hotspotDefaultInstruction: "Click or tap on the correct area of the image/diagram",
    correctAreas: "✓ Correct area(s):",
    addAreaName: "Add area name...",
    correctAnswers: "✓ Correct answers:",
    addNewAnswer: "Add new answer...",
    studentAnswerPlaceholder: "Student writes 1-3 sentence answer here...",
    sampleAnswer: "✓ Sample answer:",
    answerOptions: "Answer options:",
    ratingLow: "Low",
    ratingHigh: "High",
    expectedRating: "✓ Expected rating:",
    invalidPoints: "Invalid points",
    invalidPointsDesc: "Please enter a valid positive number for points.",
    cannotRegenerate: "Cannot regenerate",
    cannotRegenerateDesc: "Essay questions don't have answer options to regenerate.",
    alternativesRegenerated: "Alternatives regenerated!",
    alternativesRegeneratedDesc: "New answer options have been generated for this question.",
    regenerationFailed: "Regeneration failed",
    noTypesSelected: "No question types selected",
    noTypesSelectedDesc: "Please select at least one question type to generate.",
    invalidQuestionCount: "Invalid number of questions",
    invalidQuestionCountDesc: "Please enter a number between 1 and 20.",
    questionsAdded: "{count} questions added!",
    questionsAddedDesc: "New questions have been added to your set.",
    langSwedish: "Swedish",
    langEnglish: "English",

    // Library Page
    editTags: "Edit Tags",
    addTag: "Add Tag",
    addTagPlaceholder: "Enter tag name...",
    tagAdded: "Tag added",
    tagRemoved: "Tag removed",
    tagsUpdated: "Tags updated",
    tagsUpdateFailed: "Could not update tags",
    filterByTag: "Filter by tag",
    filterByType: "Filter by type",
    filterByDifficulty: "Filter by difficulty",
    filterByDate: "Filter by date",
    allTypes: "All types",
    allDifficulties: "All difficulties",
    clearFilters: "Clear filters",
    showing: "Showing",
    of: "of",
    questions: "questions",
    sortBy: "Sort by",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    points: "Points",
    editPoints: "Edit points",
    editDifficulty: "Edit difficulty",
    pointsUpdated: "Points updated",
    difficultyUpdated: "Difficulty updated",
    updateFailed: "Update failed",

    // Settings Page
    profileSettings: "Profile Settings",
    profileSettingsDescription: "Configure your personal settings for question generation",
    tutorInitials: "Tutor Initials",
    tutorInitialsPlaceholder: "e.g., AB, JD, or id:pma",
    tutorInitialsHelp: "These initials will be automatically added as a tag to all your generated questions. This helps you find your questions.",
    uiLanguage: "UI Language",
    uiLanguageHelp: "Choose which language to use in the interface",
    saveSettings: "Save Settings",
    // Question Types Management
    manageQuestionTypes: "Manage Question Types",
    questionTypesTitle: "Question Types",
    questionTypesDescription: "Choose which question types are available in the generator. Core types are always active.",
    tierCore: "Core Types",
    tierCoreDesc: "Fundamental question types — always enabled",
    tierExtended: "Extended Types",
    tierExtendedDesc: "More question formats for variation",
    tierSpecialized: "Specialized Types",
    tierSpecializedDesc: "Advanced types for specific subjects and needs",
    categoryLanguage: "Language",
    categoryScience: "Science",
    categoryGeneral: "General",
    categoryMath: "Mathematics",
    alwaysOn: "Always on",
    resetToDefaults: "Reset to defaults",
    typesUpdated: "Question types updated",
    typesUpdateFailed: "Could not update question types",
    typeDesc_mcq: "Multiple choice with one correct answer from several options.",
    typeDesc_multiple_response: "Multiple choice where more than one option can be correct.",
    typeDesc_true_false: "Student decides if a statement is true or false.",
    typeDesc_longtextV2: "Longer free-text response with rich formatting (essay).",
    typeDesc_short_answer: "Short free-text answer, 1–3 sentences.",
    typeDesc_fill_blank: "Fill in the blank — student types the correct word.",
    typeDesc_matching: "Match concepts with their correct definition/category.",
    typeDesc_ordering: "Arrange items in the correct sequence/order.",
    typeDesc_choicematrix: "Matrix with rows and columns — e.g., True/False per statement.",
    typeDesc_clozetext: "Text with multiple blanks to fill in (advanced fill-in).",
    typeDesc_clozedropdown: "Text with dropdown menus in blanks — pick the right word.",
    typeDesc_orderlist: "Advanced ordering question using Learnosity orderlist format.",
    typeDesc_tokenhighlight: "Highlight the correct word or phrase in a text.",
    typeDesc_clozeassociation: "Drag and drop the correct word into blanks in the text.",
    typeDesc_imageclozeassociationV2: "Drag and drop labels to the correct position on an image.",
    typeDesc_plaintext: "Simple plain text response without formatting.",
    typeDesc_formulaessayV2: "Response with mathematical formulas (LaTeX editor).",
    typeDesc_chemistryessayV2: "Response with chemical formulas and structures.",

    // Toast Messages
    questionsGenerated: "Questions generated!",
    questionsGeneratedDesc: "Successfully generated {count} questions.",
    generationFailed: "Generation failed",
    generationFailedDesc: "Failed to generate questions. Please try again.",
    questionsSaved: "Questions saved!",
    questionsSavedDesc: "Successfully saved {count} questions to your library.",
    saveFailed: "Save failed",
    saveFailedDesc: "Failed to save questions. Please try again.",
    exportSuccessful: "Export successful!",
    exportSuccessfulDesc: "Questions exported to Wiseflow JSON ({format} format).",
    exportFailed: "Export failed",
    exportFailedDesc: "Failed to export questions. Please try again.",
    settingsSaved: "Settings saved!",
    settingsSavedDescCreated: "Your profile has been created.",
    settingsSavedDescUpdated: "Your settings have been updated.",
    settingsSaveFailed: "Failed to save",
    settingsSaveFailedDesc: "Could not save settings. Please try again.",

    // Hero Benefits
    heroSaveTime: "Save time with AI",
    heroReviewEdit: "Review and edit",
    heroMultipleFormats: "Multiple export formats",
    instructionManual: "Instruction Manual",

    // Library Page
    librarySubtitle: "Manage and organize all your saved exam questions. Edit, tag, and export questions for use in WISEflow, Inspera, or other LMS platforms.",

    // Footer
    footerDeveloper: "Developed by",
    footerEmail: "parviz.mammadzada@oru.se",
    footerBeta: "Beta version",
    footerPermission: "Distribution for broader use requires permission from the developer.",
    footerFeedback: "Don't forget to leave feedback — it helps us continuously improve TentaGen!",

    // Feedback
    feedbackTitle: "Send feedback",
    feedbackDescription: "Help us improve TentaGen by reporting bugs, suggesting features, or sharing your thoughts.",
    feedbackType: "Feedback type",
    feedbackTypeBug: "🐛 Bug report",
    feedbackTypeImprovement: "💡 Improvement suggestion",
    feedbackTypeOther: "💬 Other",
    feedbackMessage: "Your message",
    feedbackMessagePlaceholder: "Describe your feedback...",
    feedbackEmail: "Your email (optional)",
    feedbackEmailPlaceholder: "if you want to be contacted",
    feedbackSubmit: "Send feedback",
    feedbackSuccess: "Feedback sent!",
    feedbackSuccessDesc: "Thank you for your feedback. We appreciate your input.",
    feedbackError: "Failed to send",
    feedbackErrorDesc: "Could not send feedback. Please try again.",
  },
}

export function t(key: keyof Translations, lang: Language, replacements?: Record<string, string | number>): string {
  let text = translations[lang][key]

  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{${placeholder}}`, String(value))
    })
  }

  return text
}
