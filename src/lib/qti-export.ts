// Export questions to QTI 2.1 XML format (IMS Question & Test Interoperability)
// QTI 2.1 is the universal LMS standard supported by most platforms

interface Question {
  type: string // Question type ID from question-types.ts registry
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

// Determine QTI cardinality based on question type and answers
// Per QTI 2.2 spec: ordered for ordering, multiple for multi-select/matching/gap types
function getQtiCardinality(question: Question): string {
  const orderedTypes = ["ordering", "orderlist"]
  if (orderedTypes.includes(question.type)) return "ordered"
  const multipleTypes = ["multiple_response", "tokenhighlight", "matching", "choicematrix", "clozeassociation", "imageclozeassociationV2"]
  if (multipleTypes.includes(question.type)) return "multiple"
  return "single"
}

// Determine QTI baseType based on question type
function getQtiBaseType(question: Question): string {
  const stringTypes = ["longtextV2", "short_answer", "plaintext", "formulaessayV2", "chemistryessayV2", "fill_blank", "clozetext"]
  if (stringTypes.includes(question.type)) return "string"
  if (question.type === "matching" || question.type === "choicematrix" || question.type === "clozeassociation" || question.type === "imageclozeassociationV2") return "directedPair"
  return "identifier"
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
`

  // Per QTI spec: textEntryInteraction needs separate responseDeclaration per blank
  const isTextEntry = (question.type === "fill_blank" || question.type === "clozetext") && question.correctAnswer
  const essayTypes = ["longtextV2", "short_answer", "plaintext", "formulaessayV2", "chemistryessayV2"]

  if (isTextEntry && question.correctAnswer) {
    question.correctAnswer.forEach((answer, i) => {
      const blankId = `${responseId}_blank_${i}`
      qtiXml += `    <responseDeclaration identifier="${blankId}" cardinality="single" baseType="string">
      <correctResponse>
        <value>${escapeXml(answer)}</value>
      </correctResponse>
    </responseDeclaration>
`
    })
  } else {
    qtiXml += `    <responseDeclaration identifier="${responseId}" cardinality="${getQtiCardinality(question)}" baseType="${getQtiBaseType(question)}">\n`
    if (!essayTypes.includes(question.type) && question.correctAnswer) {
      qtiXml += `      <correctResponse>\n`
      const pairTypes = ["matching", "choicematrix"]
      const gapTypes = ["clozeassociation", "imageclozeassociationV2"]
      question.correctAnswer.forEach((val, i) => {
        if (pairTypes.includes(question.type)) {
          // directedPair format: "source_id target_id" per QTI spec
          qtiXml += `        <value>${escapeXml(val)} val_${escapeXml(val)}</value>\n`
        } else if (gapTypes.includes(question.type)) {
          // directedPair format: "gapText_id gap_id" per QTI spec
          qtiXml += `        <value>${escapeXml(val)} gap_${i}</value>\n`
        } else {
          qtiXml += `        <value>${escapeXml(val)}</value>\n`
        }
      })
      qtiXml += `      </correctResponse>\n`
    }
    qtiXml += `    </responseDeclaration>\n`
  }

  qtiXml += `
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue>
        <value>0</value>
      </defaultValue>
    </outcomeDeclaration>

    <itemBody>
      <p>${escapeXml(question.stimulus)}</p>
`

  // Add interaction based on question type
  if ((question.type === "mcq" || question.type === "true_false" || question.type === "multiple_response") && question.options) {
    const maxChoices = question.type === "true_false" ? "1" : (question.correctAnswer && question.correctAnswer.length > 1 ? String(question.correctAnswer.length) : "1")
    qtiXml += `      <choiceInteraction responseIdentifier="${responseId}" shuffle="false" maxChoices="${maxChoices}">\n`
    question.options.forEach((option) => {
      qtiXml += `        <simpleChoice identifier="${option.label}">${escapeXml(option.value)}</simpleChoice>\n`
    })
    qtiXml += `      </choiceInteraction>\n`
  } else if ((question.type === "fill_blank" || question.type === "clozetext") && question.correctAnswer) {
    // TextEntryInteraction — each blank is a separate interaction
    question.correctAnswer.forEach((answer, i) => {
      const blankId = `${responseId}_blank_${i}`
      qtiXml += `      <textEntryInteraction responseIdentifier="${blankId}" expectedLength="20"/>\n`
    })
  } else if (question.type === "clozedropdown" && question.options) {
    // InlineChoiceInteraction — dropdown in text
    qtiXml += `      <inlineChoiceInteraction responseIdentifier="${responseId}" shuffle="false">\n`
    question.options.forEach((option) => {
      qtiXml += `        <inlineChoice identifier="${option.label}">${escapeXml(option.value)}</inlineChoice>\n`
    })
    qtiXml += `      </inlineChoiceInteraction>\n`
  } else if ((question.type === "ordering" || question.type === "orderlist") && question.options) {
    // OrderInteraction — items to be sequenced
    qtiXml += `      <orderInteraction responseIdentifier="${responseId}" shuffle="false">\n`
    question.options.forEach((option) => {
      qtiXml += `        <simpleChoice identifier="${option.label}">${escapeXml(option.value)}</simpleChoice>\n`
    })
    qtiXml += `      </orderInteraction>\n`
  } else if (question.type === "tokenhighlight") {
    // HottextInteraction — selectable tokens in passage
    qtiXml += `      <hottextInteraction responseIdentifier="${responseId}" maxChoices="${question.correctAnswer?.length || 1}">\n`
    // Split stimulus into words, wrap highlightable ones in hottext
    const words = question.stimulus.split(/\s+/)
    words.forEach((word, i) => {
      const isToken = question.correctAnswer?.includes(word)
      if (isToken) {
        qtiXml += `        <hottext identifier="token_${i}" matchMax="1">${escapeXml(word)}</hottext> `
      } else {
        qtiXml += `${escapeXml(word)} `
      }
    })
    qtiXml += `\n      </hottextInteraction>\n`
  } else if ((question.type === "matching" || question.type === "choicematrix") && question.options) {
    // MatchInteraction — pairs/matrix matching
    qtiXml += `      <matchInteraction responseIdentifier="${responseId}" shuffle="false" maxAssociations="${question.options.length}">\n`
    qtiXml += `        <simpleMatchSet>\n`
    question.options.forEach((option) => {
      qtiXml += `          <simpleAssociableChoice identifier="${option.label}" matchMax="1">${escapeXml(option.label)}</simpleAssociableChoice>\n`
    })
    qtiXml += `        </simpleMatchSet>\n`
    qtiXml += `        <simpleMatchSet>\n`
    question.options.forEach((option) => {
      qtiXml += `          <simpleAssociableChoice identifier="val_${option.label}" matchMax="1">${escapeXml(option.value)}</simpleAssociableChoice>\n`
    })
    qtiXml += `        </simpleMatchSet>\n`
    qtiXml += `      </matchInteraction>\n`
  } else if (question.type === "clozeassociation" && question.options) {
    // GapMatchInteraction — drag answers into gaps
    qtiXml += `      <gapMatchInteraction responseIdentifier="${responseId}">\n`
    question.options.forEach((option) => {
      qtiXml += `        <gapText identifier="${option.label}" matchMax="1">${escapeXml(option.value)}</gapText>\n`
    })
    // Insert gaps in stimulus
    const parts = question.stimulus.split("[___]")
    parts.forEach((part, i) => {
      qtiXml += `        ${escapeXml(part)}`
      if (i < parts.length - 1) {
        qtiXml += `<gap identifier="gap_${i}"/>`
      }
    })
    qtiXml += `\n      </gapMatchInteraction>\n`
  } else if (question.type === "imageclozeassociationV2" && question.options) {
    // GraphicGapMatchInteraction — drag onto image zones (QTI spec requires object element for background)
    qtiXml += `      <graphicGapMatchInteraction responseIdentifier="${responseId}">\n`
    // Background image placeholder — replace with actual image path when importing to LMS
    qtiXml += `        <object data="background_image.png" type="image/png" width="600" height="400">Background image</object>\n`
    question.options.forEach((option) => {
      qtiXml += `        <gapImg identifier="${option.label}" matchMax="1"><object data="label_${option.label}.png" type="image/png" width="100" height="30">${escapeXml(option.value)}</object></gapImg>\n`
    })
    // Associable hotspots define drop zones on the background image
    question.options.forEach((_, i) => {
      qtiXml += `        <associableHotspot identifier="zone_${i}" matchMax="1" shape="rect" coords="${50 + i * 120},50,${170 + i * 120},150"/>\n`
    })
    qtiXml += `      </graphicGapMatchInteraction>\n`
  } else {
    // ExtendedTextInteraction — essay types (longtextV2, short_answer, plaintext, formulaessayV2, chemistryessayV2)
    const expectedLength = question.type === "short_answer" ? "500" : "5000"
    qtiXml += `      <extendedTextInteraction responseIdentifier="${responseId}" expectedLength="${expectedLength}">\n`
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
          <imsmd:langstring xml:lang="${metadata.language}">Generated with TentaGen - ${timestamp}</imsmd:langstring>
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

// Convert question to QTI 2.2 assessment item XML (Inspera format)
function questionToQti22Item(question: Question, index: number, metadata: ExportMetadata): string {
  const itemId = generateQtiId("item", index)
  const responseId = generateQtiId("response", index)

  let qtiXml = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd"
    identifier="${itemId}"
    title="${escapeXml(metadata.subject)} - ${escapeXml(metadata.topic)} - Question ${index + 1}"
    adaptive="false"
    timeDependent="false">
`

  // Per QTI spec: textEntryInteraction needs separate responseDeclaration per blank
  const isTextEntry22 = (question.type === "fill_blank" || question.type === "clozetext") && question.correctAnswer
  const essayTypes22 = ["longtextV2", "short_answer", "plaintext", "formulaessayV2", "chemistryessayV2"]

  if (isTextEntry22 && question.correctAnswer) {
    question.correctAnswer.forEach((answer, i) => {
      const blankId = `${responseId}_blank_${i}`
      qtiXml += `    <responseDeclaration identifier="${blankId}" cardinality="single" baseType="string">
      <correctResponse>
        <value>${escapeXml(answer)}</value>
      </correctResponse>
    </responseDeclaration>
`
    })
  } else {
    qtiXml += `    <responseDeclaration identifier="${responseId}" cardinality="${getQtiCardinality(question)}" baseType="${getQtiBaseType(question)}">\n`
    if (!essayTypes22.includes(question.type) && question.correctAnswer) {
      qtiXml += `      <correctResponse>\n`
      const pairTypes22 = ["matching", "choicematrix"]
      const gapTypes22 = ["clozeassociation", "imageclozeassociationV2"]
      question.correctAnswer.forEach((val, i) => {
        if (pairTypes22.includes(question.type)) {
          qtiXml += `        <value>${escapeXml(val)} val_${escapeXml(val)}</value>\n`
        } else if (gapTypes22.includes(question.type)) {
          qtiXml += `        <value>${escapeXml(val)} gap_${i}</value>\n`
        } else {
          qtiXml += `        <value>${escapeXml(val)}</value>\n`
        }
      })
      qtiXml += `      </correctResponse>\n`
    }
    qtiXml += `    </responseDeclaration>\n`
  }

  qtiXml += `
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue>
        <value>0</value>
      </defaultValue>
    </outcomeDeclaration>

    <outcomeDeclaration identifier="FEEDBACK" cardinality="single" baseType="identifier"/>

    <itemBody>
      <p>${escapeXml(question.stimulus)}</p>
`

  // Add interaction based on question type
  if ((question.type === "mcq" || question.type === "true_false" || question.type === "multiple_response") && question.options) {
    const maxChoices = question.type === "true_false" ? "1" : (question.correctAnswer && question.correctAnswer.length > 1 ? String(question.correctAnswer.length) : "1")
    qtiXml += `      <choiceInteraction responseIdentifier="${responseId}" shuffle="false" maxChoices="${maxChoices}">\n`
    question.options.forEach((option) => {
      qtiXml += `        <simpleChoice identifier="${option.label}">${escapeXml(option.value)}</simpleChoice>\n`
    })
    qtiXml += `      </choiceInteraction>\n`
  } else if ((question.type === "fill_blank" || question.type === "clozetext") && question.correctAnswer) {
    question.correctAnswer.forEach((answer, i) => {
      const blankId = `${responseId}_blank_${i}`
      qtiXml += `      <textEntryInteraction responseIdentifier="${blankId}" expectedLength="20"/>\n`
    })
  } else if (question.type === "clozedropdown" && question.options) {
    qtiXml += `      <inlineChoiceInteraction responseIdentifier="${responseId}" shuffle="false">\n`
    question.options.forEach((option) => {
      qtiXml += `        <inlineChoice identifier="${option.label}">${escapeXml(option.value)}</inlineChoice>\n`
    })
    qtiXml += `      </inlineChoiceInteraction>\n`
  } else if ((question.type === "ordering" || question.type === "orderlist") && question.options) {
    qtiXml += `      <orderInteraction responseIdentifier="${responseId}" shuffle="false">\n`
    question.options.forEach((option) => {
      qtiXml += `        <simpleChoice identifier="${option.label}">${escapeXml(option.value)}</simpleChoice>\n`
    })
    qtiXml += `      </orderInteraction>\n`
  } else if (question.type === "tokenhighlight") {
    qtiXml += `      <hottextInteraction responseIdentifier="${responseId}" maxChoices="${question.correctAnswer?.length || 1}">\n`
    const words = question.stimulus.split(/\s+/)
    words.forEach((word, i) => {
      const isToken = question.correctAnswer?.includes(word)
      if (isToken) {
        qtiXml += `        <hottext identifier="token_${i}" matchMax="1">${escapeXml(word)}</hottext> `
      } else {
        qtiXml += `${escapeXml(word)} `
      }
    })
    qtiXml += `\n      </hottextInteraction>\n`
  } else if ((question.type === "matching" || question.type === "choicematrix") && question.options) {
    qtiXml += `      <matchInteraction responseIdentifier="${responseId}" shuffle="false" maxAssociations="${question.options.length}">\n`
    qtiXml += `        <simpleMatchSet>\n`
    question.options.forEach((option) => {
      qtiXml += `          <simpleAssociableChoice identifier="${option.label}" matchMax="1">${escapeXml(option.label)}</simpleAssociableChoice>\n`
    })
    qtiXml += `        </simpleMatchSet>\n`
    qtiXml += `        <simpleMatchSet>\n`
    question.options.forEach((option) => {
      qtiXml += `          <simpleAssociableChoice identifier="val_${option.label}" matchMax="1">${escapeXml(option.value)}</simpleAssociableChoice>\n`
    })
    qtiXml += `        </simpleMatchSet>\n`
    qtiXml += `      </matchInteraction>\n`
  } else if (question.type === "clozeassociation" && question.options) {
    qtiXml += `      <gapMatchInteraction responseIdentifier="${responseId}">\n`
    question.options.forEach((option) => {
      qtiXml += `        <gapText identifier="${option.label}" matchMax="1">${escapeXml(option.value)}</gapText>\n`
    })
    const parts = question.stimulus.split("[___]")
    parts.forEach((part, i) => {
      qtiXml += `        ${escapeXml(part)}`
      if (i < parts.length - 1) {
        qtiXml += `<gap identifier="gap_${i}"/>`
      }
    })
    qtiXml += `\n      </gapMatchInteraction>\n`
  } else if (question.type === "imageclozeassociationV2" && question.options) {
    // GraphicGapMatchInteraction — QTI spec requires object for background + gapImg for draggable items
    qtiXml += `      <graphicGapMatchInteraction responseIdentifier="${responseId}">\n`
    qtiXml += `        <object data="background_image.png" type="image/png" width="600" height="400">Background image</object>\n`
    question.options.forEach((option) => {
      qtiXml += `        <gapImg identifier="${option.label}" matchMax="1"><object data="label_${option.label}.png" type="image/png" width="100" height="30">${escapeXml(option.value)}</object></gapImg>\n`
    })
    question.options.forEach((_, i) => {
      qtiXml += `        <associableHotspot identifier="zone_${i}" matchMax="1" shape="rect" coords="${50 + i * 120},50,${170 + i * 120},150"/>\n`
    })
    qtiXml += `      </graphicGapMatchInteraction>\n`
  } else {
    const expectedLength = question.type === "short_answer" ? "500" : "5000"
    qtiXml += `      <extendedTextInteraction responseIdentifier="${responseId}" expectedLength="${expectedLength}">\n`
    if (question.instructorStimulus) {
      qtiXml += `        <prompt>${escapeXml(question.instructorStimulus)}</prompt>\n`
    }
    qtiXml += `      </extendedTextInteraction>\n`
  }

  qtiXml += `    </itemBody>

    <responseProcessing template="http://www.imsglobal.org/question/qti_v2p2/rptemplates/match_correct"/>
</assessmentItem>
`

  return qtiXml
}

// Generate QTI 2.2 manifest (imsmanifest.xml)
function generateQti22Manifest(questions: Question[], metadata: ExportMetadata): string {
  const manifestId = generateQtiId("manifest", 0)
  const timestamp = new Date().toISOString()

  let manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_v1p2"
  xmlns:imsqti="http://www.imsglobal.org/xsd/imsqti_v2p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  identifier="${manifestId}"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/qti/qtiv2p2/qtiv2p2_imscpv1p2_v1p0.xsd
  http://www.imsglobal.org/xsd/imsmd_v1p2 http://www.imsglobal.org/xsd/imsmd_v1p2p4.xsd
  http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd">

  <metadata>
    <schema>QTI 2.2</schema>
    <schemaversion>2.2</schemaversion>
    <imsmd:lom>
      <imsmd:general>
        <imsmd:title>
          <imsmd:langstring xml:lang="${metadata.language}">${escapeXml(metadata.subject)} - ${escapeXml(metadata.topic)}</imsmd:langstring>
        </imsmd:title>
        <imsmd:description>
          <imsmd:langstring xml:lang="${metadata.language}">Generated with TentaGen - ${timestamp}</imsmd:langstring>
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
    manifestXml += `    <resource identifier="${itemId}" type="imsqti_item_xmlv2p2" href="item_${index + 1}.xml">
      <file href="item_${index + 1}.xml"/>
    </resource>
`
  })

  manifestXml += `  </resources>
</manifest>
`

  return manifestXml
}

// Export questions to QTI 2.2 format (Inspera) - returns array of files for ZIP
export function exportToQti22(questions: Question[], metadata: ExportMetadata): Array<{ name: string; content: string }> {
  const files: Array<{ name: string; content: string }> = []

  // Generate manifest file
  files.push({
    name: "imsmanifest.xml",
    content: generateQti22Manifest(questions, metadata)
  })

  // Generate individual question item files
  questions.forEach((question, index) => {
    files.push({
      name: `item_${index + 1}.xml`,
      content: questionToQti22Item(question, index, metadata)
    })
  })

  return files
}

// Download QTI 2.2 (Inspera) export as ZIP (browser-side only)
export async function downloadQti22(questions: Question[], metadata: ExportMetadata) {
  // Dynamic import to avoid SSR issues
  const JSZip = (await import("jszip")).default

  const zip = new JSZip()
  const files = exportToQti22(questions, metadata)

  // Add all files to ZIP
  files.forEach(file => {
    zip.file(file.name, file.content)
  })

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: "blob" })

  // Trigger download
  const url = URL.createObjectURL(blob)
  const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const filename = `qti22_inspera_${metadata.subject.toLowerCase().replace(/\s+/g, "_")}_${timestamp}.zip`

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}
