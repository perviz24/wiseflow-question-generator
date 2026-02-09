// Export questions to QTI 2.1 XML format (IMS Question & Test Interoperability)
// QTI 2.1 is the universal LMS standard supported by most platforms

interface Question {
  type: "mcq" | "true_false" | "longtextV2" | "short_answer" | "fill_blank" | "multiple_response" | "matching" | "ordering" | "hotspot" | "rating_scale"
  stimulus: string
  options?: Array<{
    label: string
    value: string
  }>
  correctAnswer?: string[]
  instructorStimulus?: string
}

interface ExportMetadata {
  subject: string
  topic: string
  difficulty: string
  language: string
  term?: string
  semester?: string
  examType?: string
  courseCode?: string
  additionalTags?: string
  tutorInitials?: string
  includeAITag?: boolean
}

// Generate unique identifier for QTI items
function generateQtiId(prefix: string, index: number): string {
  const timestamp = Date.now()
  return `${prefix}_${timestamp}_${index}`
}

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// Convert question to QTI 2.1 assessment item XML
function questionToQtiItem(question: Question, index: number, metadata: ExportMetadata): string {
  const itemId = generateQtiId("item", index)
  const responseId = generateQtiId("response", index)

  let qtiXml = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
    identifier="${itemId}"
    title="${escapeXml(metadata.subject)} - ${escapeXml(metadata.topic)} - Question ${index + 1}"
    adaptive="false"
    timeDependent="false">

    <responseDeclaration identifier="${responseId}" cardinality="${question.type === "mcq" && question.correctAnswer && question.correctAnswer.length > 1 ? "multiple" : "single"}" baseType="${question.type === "longtextV2" ? "string" : "identifier"}">
`

  // Add correct response for MCQ and True/False
  if (question.type !== "longtextV2" && question.correctAnswer && question.options) {
    qtiXml += `      <correctResponse>\n`
    question.correctAnswer.forEach((label) => {
      const option = question.options!.find(opt => opt.label === label)
      if (option) {
        // Use label as identifier (A, B, C, D or TRUE, FALSE)
        qtiXml += `        <value>${label}</value>\n`
      }
    })
    qtiXml += `      </correctResponse>\n`
  }

  qtiXml += `    </responseDeclaration>

    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue>
        <value>0</value>
      </defaultValue>
    </outcomeDeclaration>

    <itemBody>
      <p>${escapeXml(question.stimulus)}</p>
`

  // Add interaction based on question type
  if (question.type === "mcq" && question.options) {
    qtiXml += `      <choiceInteraction responseIdentifier="${responseId}" shuffle="false" maxChoices="${question.correctAnswer && question.correctAnswer.length > 1 ? question.correctAnswer.length : "1"}">\n`
    question.options.forEach((option) => {
      qtiXml += `        <simpleChoice identifier="${option.label}">${escapeXml(option.value)}</simpleChoice>\n`
    })
    qtiXml += `      </choiceInteraction>\n`
  } else if (question.type === "true_false" && question.options) {
    qtiXml += `      <choiceInteraction responseIdentifier="${responseId}" shuffle="false" maxChoices="1">\n`
    question.options.forEach((option) => {
      qtiXml += `        <simpleChoice identifier="${option.label}">${escapeXml(option.value)}</simpleChoice>\n`
    })
    qtiXml += `      </choiceInteraction>\n`
  } else if (question.type === "longtextV2") {
    qtiXml += `      <extendedTextInteraction responseIdentifier="${responseId}" expectedLength="5000">\n`
    if (question.instructorStimulus) {
      qtiXml += `        <prompt>${escapeXml(question.instructorStimulus)}</prompt>\n`
    }
    qtiXml += `      </extendedTextInteraction>\n`
  }

  qtiXml += `    </itemBody>

    <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
</assessmentItem>
`

  return qtiXml
}

// Generate QTI 2.1 manifest (imsmanifest.xml)
function generateQtiManifest(questions: Question[], metadata: ExportMetadata): string {
  const manifestId = generateQtiId("manifest", 0)
  const timestamp = new Date().toISOString()

  let manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_v1p2"
  xmlns:imsqti="http://www.imsglobal.org/xsd/imsqti_v2p1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  identifier="${manifestId}"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/qtiv2p1_imscpv1p2_v1p0.xsd
  http://www.imsglobal.org/xsd/imsmd_v1p2 http://www.imsglobal.org/xsd/imsmd_v1p2p4.xsd
  http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">

  <metadata>
    <schema>QTI 2.1</schema>
    <schemaversion>2.1</schemaversion>
    <imsmd:lom>
      <imsmd:general>
        <imsmd:title>
          <imsmd:langstring xml:lang="${metadata.language}">${escapeXml(metadata.subject)} - ${escapeXml(metadata.topic)}</imsmd:langstring>
        </imsmd:title>
        <imsmd:description>
          <imsmd:langstring xml:lang="${metadata.language}">Generated with Wiseflow Question Generator - ${timestamp}</imsmd:langstring>
        </imsmd:description>
        <imsmd:keyword>
          <imsmd:langstring xml:lang="${metadata.language}">${escapeXml(metadata.subject)}</imsmd:langstring>
        </imsmd:keyword>
        <imsmd:keyword>
          <imsmd:langstring xml:lang="${metadata.language}">${escapeXml(metadata.topic)}</imsmd:langstring>
        </imsmd:keyword>
        <imsmd:keyword>
          <imsmd:langstring xml:lang="${metadata.language}">${escapeXml(metadata.difficulty)}</imsmd:langstring>
        </imsmd:keyword>
`

  // Add optional metadata tags
  if (metadata.tutorInitials) {
    manifestXml += `        <imsmd:keyword>
          <imsmd:langstring xml:lang="${metadata.language}">${escapeXml(metadata.tutorInitials)}</imsmd:langstring>
        </imsmd:keyword>
`
  }

  if (metadata.courseCode) {
    manifestXml += `        <imsmd:keyword>
          <imsmd:langstring xml:lang="${metadata.language}">${escapeXml(metadata.courseCode)}</imsmd:langstring>
        </imsmd:keyword>
`
  }

  manifestXml += `      </imsmd:general>
    </imsmd:lom>
  </metadata>

  <organizations/>

  <resources>
`

  // Add resource entry for each question
  questions.forEach((_, index) => {
    const itemId = generateQtiId("item", index)
    manifestXml += `    <resource identifier="${itemId}" type="imsqti_item_xmlv2p1" href="item_${index + 1}.xml">
      <file href="item_${index + 1}.xml"/>
    </resource>
`
  })

  manifestXml += `  </resources>
</manifest>
`

  return manifestXml
}

// Export questions to QTI 2.1 format (returns array of files for ZIP)
export function exportToQti21(questions: Question[], metadata: ExportMetadata): Array<{ name: string; content: string }> {
  const files: Array<{ name: string; content: string }> = []

  // Generate manifest file
  files.push({
    name: "imsmanifest.xml",
    content: generateQtiManifest(questions, metadata)
  })

  // Generate individual question item files
  questions.forEach((question, index) => {
    files.push({
      name: `item_${index + 1}.xml`,
      content: questionToQtiItem(question, index, metadata)
    })
  })

  return files
}

// Download QTI 2.1 export as ZIP (browser-side only)
export async function downloadQti21(questions: Question[], metadata: ExportMetadata) {
  // Dynamic import to avoid SSR issues
  const JSZip = (await import("jszip")).default

  const zip = new JSZip()
  const files = exportToQti21(questions, metadata)

  // Add all files to ZIP
  files.forEach(file => {
    zip.file(file.name, file.content)
  })

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: "blob" })

  // Trigger download
  const url = URL.createObjectURL(blob)
  const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const filename = `qti21_${metadata.subject.toLowerCase().replace(/\s+/g, "_")}_${timestamp}.zip`

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}
