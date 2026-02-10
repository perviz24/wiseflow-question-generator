// Translation system for Swedish/English UI

export type Language = "sv" | "en"

export interface Translations {
  // Header & Navigation
  appTitle: string
  signIn: string
  signOut: string
  settings: string
  back: string
  myLibrary: string
  questionLibrary: string
  selectAll: string
  documentation: string

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
  numQuestions: string
  numQuestionsHelp: string
  questionTypes: string
  questionTypesHelp: string
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

  // Content Upload
  uploadDocument: string
  uploadDocumentHelp: string
  or: string
  fetchFromUrls: string
  addMoreUrls: string
  contextGuidanceTip: string

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
  showMoreTypes: string
  showLessTypes: string

  // Settings Page
  profileSettings: string
  profileSettingsDescription: string
  tutorInitials: string
  tutorInitialsPlaceholder: string
  tutorInitialsHelp: string
  uiLanguage: string
  uiLanguageHelp: string
  saveSettings: string

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
}

export const translations: Record<Language, Translations> = {
  sv: {
    // Header & Navigation
    appTitle: "Wiseflow Frågegenerator",
    signIn: "Logga in",
    signOut: "Logga ut",
    settings: "Inställningar",
    back: "Tillbaka",
    myLibrary: "Mitt bibliotek",
    questionLibrary: "Frågebibliotek",
    selectAll: "Markera alla",
    documentation: "Dokumentation",

    // Home Page
    welcomeTitle: "Välkommen till Wiseflow Frågegenerator",
    welcomeSubtitle: "Generera högkvalitativa tentafrågor med AI. Logga in för att komma igång.",
    signInToContinue: "Logga in för att fortsätta",
    createQuestionsTitle: "Skapa tentafrågor",
    createQuestionsSubtitle: "Generera pedagogiskt genomtänkta frågor för dina Wiseflow-tentor",

    // Question Generator Form
    generateQuestions: "Generera frågor",
    generating: "Genererar frågor...",
    subject: "Ämne",
    subjectPlaceholder: "t.ex. Biologi, Matematik, Historia",
    topic: "Ämnesområde",
    topicPlaceholder: "t.ex. Celldelning, Algebra, Andra världskriget",
    difficulty: "Svårighetsgrad",
    easy: "Lätt",
    medium: "Medium",
    hard: "Svår",
    numQuestions: "Antal frågor",
    numQuestionsHelp: "Välj mellan 1 och 20 frågor",
    questionTypes: "Frågetyper",
    questionTypesHelp: "Välj minst en frågetyp",
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
    legacyFormat: "Utgående (labels med ID)",
    utgaendeFormat: "Legacy (tags-array)",
    qti21Format: "QTI 2.1 (Universal LMS)",

    // Content Upload
    uploadDocument: "Ladda upp dokument (valfritt)",
    uploadDocumentHelp: "PDF, Word (.docx) eller PowerPoint (.pptx). Välj flera filer samtidigt. Inga filstorleksbegränsningar.",
    or: "eller",
    fetchFromUrls: "Hämta från webbadresser (valfritt)",
    addMoreUrls: "Lägg till fler URL:er",
    contextGuidanceTip: '💡 <strong>Tips:</strong> Du kan vägleda AI här! Exempel: "Generera 5 frågor från filen och 5 från URL:en" eller "Fokusera främst på det uppladdade dokumentet"',

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
    includeAITag: "Inkludera 'AI-genererad' tagg",

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
    showMoreTypes: "Fler frågetyper",
    showLessTypes: "Färre frågetyper",

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
    tutorInitialsHelp: "Dessa initialer läggs automatiskt till som tagg på alla dina genererade frågor. Detta hjälper dig att hitta dina frågor i Wiseflow.",
    uiLanguage: "Gränssnittsspråk",
    uiLanguageHelp: "Välj vilket språk du vill använda i gränssnittet",
    saveSettings: "Spara inställningar",

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
    librarySubtitle: "Hantera och organisera alla dina sparade tentafrågor. Redigera, tagga och exportera frågor för användning i Wiseflow eller andra LMS-plattformar.",
  },
  en: {
    // Header & Navigation
    appTitle: "Wiseflow Question Generator",
    signIn: "Sign In",
    signOut: "Sign Out",
    settings: "Settings",
    back: "Back",
    myLibrary: "My Library",
    questionLibrary: "Question Library",
    selectAll: "Select All",
    documentation: "Documentation",

    // Home Page
    welcomeTitle: "Welcome to Wiseflow Question Generator",
    welcomeSubtitle: "Generate high-quality exam questions using AI. Sign in to get started.",
    signInToContinue: "Sign In to Continue",
    createQuestionsTitle: "Create Exam Questions",
    createQuestionsSubtitle: "Generate pedagogically sound questions for your Wiseflow exams",

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
    numQuestions: "Number of Questions",
    numQuestionsHelp: "Choose between 1 and 20 questions",
    questionTypes: "Question Types",
    questionTypesHelp: "Select at least one question type",
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
    legacyFormat: "Utgående (labels with IDs)",
    utgaendeFormat: "Legacy (tags array)",
    qti21Format: "QTI 2.1 (Universal LMS)",

    // Content Upload
    uploadDocument: "Upload Document (Optional)",
    uploadDocumentHelp: "PDF, Word (.docx), or PowerPoint (.pptx). Select multiple files at once. No file size limitations.",
    or: "or",
    fetchFromUrls: "Fetch from URLs (Optional)",
    addMoreUrls: "Add More URLs",
    contextGuidanceTip: '💡 <strong>Tip:</strong> You can guide AI here! Example: "Generate 5 questions from the file and 5 from the URL" or "Focus primarily on the uploaded document"',

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
    includeAITag: "Include 'AI-generated' tag",

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
    showMoreTypes: "More Question Types",
    showLessTypes: "Less Question Types",

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
    tutorInitialsHelp: "These initials will be automatically added as a tag to all your generated questions. This helps you find your questions in Wiseflow.",
    uiLanguage: "UI Language",
    uiLanguageHelp: "Choose which language to use in the interface",
    saveSettings: "Save Settings",

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
    librarySubtitle: "Manage and organize all your saved exam questions. Edit, tag, and export questions for use in Wiseflow or other LMS platforms.",
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
