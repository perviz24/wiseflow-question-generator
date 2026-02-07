// Translation system for Swedish/English UI

export type Language = "sv" | "en"

export interface Translations {
  // Header & Navigation
  appTitle: string
  signIn: string
  signOut: string
  settings: string
  back: string

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

  // Question Preview
  generatedQuestions: string
  saveToLibrary: string
  saving: string
  exportJSON: string
  exporting: string
  generateNew: string
  generateMoreTitle: string
  generateMoreDesc: string

  // Settings Page
  profileSettings: string
  profileSettingsDescription: string
  tutorInitials: string
  tutorInitialsPlaceholder: string
  tutorInitialsHelp: string
  uiLanguage: string
  uiLanguageHelp: string
  saveSettings: string

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
}

export const translations: Record<Language, Translations> = {
  sv: {
    // Header & Navigation
    appTitle: "Wiseflow Frågegenerator",
    signIn: "Logga in",
    signOut: "Logga ut",
    settings: "Inställningar",
    back: "Tillbaka",

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
    legacyFormat: "Legacy (tags-array)",
    utgaendeFormat: "Utgående (labels med ID)",

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

    // Question Preview
    generatedQuestions: "Genererade frågor",
    saveToLibrary: "Spara till bibliotek",
    saving: "Sparar...",
    exportJSON: "Exportera JSON",
    exporting: "Exporterar...",
    generateNew: "Generera nya frågor",
    generateMoreTitle: "Generera fler frågor",
    generateMoreDesc: "Lägg till fler frågor till ditt befintliga set utan att lämna denna sida",

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
  },
  en: {
    // Header & Navigation
    appTitle: "Wiseflow Question Generator",
    signIn: "Sign In",
    signOut: "Sign Out",
    settings: "Settings",
    back: "Back",

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
    legacyFormat: "Legacy (tags array)",
    utgaendeFormat: "Utgående (labels with IDs)",

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

    // Question Preview
    generatedQuestions: "Generated Questions",
    saveToLibrary: "Save to Library",
    saving: "Saving...",
    exportJSON: "Export JSON",
    exporting: "Exporting...",
    generateNew: "Generate New Questions",
    generateMoreTitle: "Generate More Questions",
    generateMoreDesc: "Add additional questions to your existing set without leaving this page",

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
