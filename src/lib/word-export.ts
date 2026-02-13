// Word (.docx) export for exam questions
// Uses docx library to create professional Word documents

import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx"

interface Question {
  type: string
  stimulus: string
  options?: Array<{ label: string; value: string }>
  correctAnswer?: string[]
  instructorStimulus?: string
  title?: string
  subject?: string
  difficulty?: string
  tags?: string[]
  score?: number
}

interface ExportMetadata {
  subject: string
  topic: string
  difficulty: string
  language: string
  tutorInitials?: string
}

// Strip HTML tags from stimulus text
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function getTypeDisplayName(type: string, lang: string): string {
  const names: Record<string, [string, string]> = {
    mcq: ["Flervalsfråga", "MCQ"],
    true_false: ["Sant/Falskt", "True/False"],
    longtextV2: ["Essä", "Essay"],
    short_answer: ["Kort svar", "Short Answer"],
    fill_blank: ["Ifyllnad", "Fill in the Blank"],
    multiple_response: ["Flera rätt", "Multiple Response"],
    matching: ["Matchning", "Matching"],
    ordering: ["Ordningsföljd", "Ordering"],
    hotspot: ["Bildmarkering", "Image Hotspot"],
    rating_scale: ["Betygsskala", "Rating Scale"],
    choicematrix: ["Valsmatris", "Choice Matrix"],
    clozetext: ["Lucktext", "Cloze Text"],
    clozedropdown: ["Rullgardinslucka", "Cloze Dropdown"],
    orderlist: ["Ordningslista", "Order List"],
    tokenhighlight: ["Tokenmarkering", "Token Highlight"],
    clozeassociation: ["Dra-och-släpp lucka", "Cloze Association"],
    imageclozeassociationV2: ["Bildlucka", "Image Cloze"],
    plaintext: ["Fritext", "Plain Text"],
    formulaessayV2: ["Formeluppsats", "Formula Essay"],
    chemistryessayV2: ["Kemiuppsats", "Chemistry Essay"],
  }
  const entry = names[type]
  return entry ? (lang === "sv" ? entry[0] : entry[1]) : type
}

function getDifficultyLabel(diff: string, lang: string): string {
  const names: Record<string, [string, string]> = {
    easy: ["Lätt", "Easy"],
    medium: ["Medel", "Medium"],
    hard: ["Svår", "Hard"],
  }
  const entry = names[diff]
  return entry ? (lang === "sv" ? entry[0] : entry[1]) : diff
}

// Build a single question's content as paragraphs
function buildQuestionParagraphs(
  q: Question,
  index: number,
  lang: string
): Paragraph[] {
  const isSv = lang === "sv"
  const paragraphs: Paragraph[] = []

  // Question header: "1. [Type] (Difficulty, Score pts)"
  const typeName = getTypeDisplayName(q.type, lang)
  const diffLabel = q.difficulty ? getDifficultyLabel(q.difficulty, lang) : ""
  const scoreText = q.score ? `${q.score} ${isSv ? "p" : "pts"}` : ""
  const metaParts = [typeName, diffLabel, scoreText].filter(Boolean).join(" • ")

  paragraphs.push(
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: `${isSv ? "Fråga" : "Question"} ${index + 1}`,
          bold: true,
          size: 26,
        }),
        new TextRun({
          text: `  (${metaParts})`,
          italics: true,
          size: 20,
          color: "666666",
        }),
      ],
    })
  )

  // Question text (stimulus)
  const questionText = stripHtml(q.stimulus)
  paragraphs.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: questionText,
          size: 22,
        }),
      ],
    })
  )

  // Type-specific answer display
  if (q.type === "choicematrix" && q.options && q.options.length > 0) {
    // Choice matrix: rows are statements, value has column headers (e.g. "Sant, Falskt")
    // correctAnswer[i] = correct column for row i
    const columns = q.options[0]?.value?.split(",").map((c) => c.trim()) || []
    const colHeader = isSv ? "Matrisval:" : "Choice Matrix:"
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [new TextRun({ text: colHeader, bold: true, size: 20 })],
      })
    )
    q.options.forEach((opt, i) => {
      const correctCol = q.correctAnswer?.[i] || ""
      const children: TextRun[] = [
        new TextRun({ text: `${stripHtml(opt.label)}: `, bold: true, size: 20 }),
      ]
      columns.forEach((col) => {
        const isCorrect = col === correctCol
        children.push(
          new TextRun({
            text: ` [${col}${isCorrect ? " ✓" : " ✗"}]`,
            bold: isCorrect,
            color: isCorrect ? "2E7D32" : "C62828",
            size: 20,
          })
        )
      })
      paragraphs.push(
        new Paragraph({ spacing: { after: 20 }, indent: { left: 400 }, children })
      )
    })
  } else if (q.type === "clozedropdown" && q.options && q.options.length > 0) {
    // Cloze dropdown: each option = one gap, value = comma-separated choices
    // correctAnswer[i] = correct choice for gap i
    const gapLabel = isSv ? "Luckor:" : "Gaps:"
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [new TextRun({ text: gapLabel, bold: true, size: 20 })],
      })
    )
    q.options.forEach((opt, i) => {
      const choices = opt.value?.split(",").map((c) => c.trim()) || []
      const correctChoice = q.correctAnswer?.[i] || ""
      const children: TextRun[] = [
        new TextRun({ text: `${opt.label}: `, bold: true, size: 20 }),
      ]
      choices.forEach((choice, ci) => {
        const isCorrect = choice === correctChoice
        children.push(
          new TextRun({
            text: `${ci > 0 ? " | " : ""}${choice}`,
            bold: isCorrect,
            color: isCorrect ? "2E7D32" : "C62828",
            size: 20,
          })
        )
      })
      paragraphs.push(
        new Paragraph({ spacing: { after: 20 }, indent: { left: 400 }, children })
      )
    })
  } else if (q.type === "orderlist" && q.options && q.options.length > 0) {
    // Orderlist: correctAnswer = labels in correct sequence
    const seqLabel = isSv ? "Korrekt ordning:" : "Correct order:"
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [new TextRun({ text: seqLabel, bold: true, size: 20 })],
      })
    )
    const correctSeq = q.correctAnswer || []
    correctSeq.forEach((label, i) => {
      const opt = q.options?.find((o) => o.label === label)
      paragraphs.push(
        new Paragraph({
          spacing: { after: 20 },
          indent: { left: 400 },
          children: [
            new TextRun({
              text: `${i + 1}. ${opt?.value || label}`,
              size: 20,
              color: "2E7D32",
            }),
          ],
        })
      )
    })
  } else if (q.options && q.options.length > 0) {
    // Standard option-based types: MCQ, true_false, multiple_response, matching, etc.
    // correctAnswer stores labels (e.g. "A", "B")
    const optionLabel = isSv ? "Svarsalternativ:" : "Answer options:"
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [new TextRun({ text: optionLabel, bold: true, size: 20 })],
      })
    )
    q.options.forEach((opt) => {
      const isCorrect = q.correctAnswer?.includes(opt.label)
      paragraphs.push(
        new Paragraph({
          spacing: { after: 20 },
          indent: { left: 400 },
          children: [
            new TextRun({ text: `${opt.label}: `, bold: true, size: 20 }),
            new TextRun({
              text: opt.value,
              size: 20,
              color: isCorrect ? "2E7D32" : undefined,
            }),
            new TextRun({
              text: isCorrect ? " ✓" : " ✗",
              bold: true,
              color: isCorrect ? "2E7D32" : "C62828",
              size: 20,
            }),
          ],
        })
      )
    })
  }

  // Correct answer text (for types without options: fill_blank, clozetext, tokenhighlight, short_answer)
  if (q.correctAnswer && q.correctAnswer.length > 0 && !q.options?.length) {
    const ansLabel = isSv ? "Korrekt svar:" : "Correct answer:"
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [
          new TextRun({ text: ansLabel, bold: true, size: 20 }),
          new TextRun({
            text: ` ${q.correctAnswer.join(", ")}`,
            size: 20,
            color: "2E7D32",
          }),
        ],
      })
    )
  }

  // Instructor notes
  if (q.instructorStimulus) {
    const noteLabel = isSv ? "Bedömningsanvisning:" : "Grading guide:"
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        shading: { type: ShadingType.SOLID, color: "FFF8E1" },
        children: [
          new TextRun({
            text: `${noteLabel} `,
            bold: true,
            italics: true,
            size: 20,
            color: "795548",
          }),
          new TextRun({
            text: stripHtml(q.instructorStimulus),
            italics: true,
            size: 20,
            color: "795548",
          }),
        ],
      })
    )
  }

  // Separator line
  paragraphs.push(
    new Paragraph({
      spacing: { before: 100, after: 100 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      },
      children: [],
    })
  )

  return paragraphs
}

// Main export function — returns a Blob
export async function exportToWord(
  questions: Question[],
  metadata: ExportMetadata
): Promise<Blob> {
  const isSv = metadata.language === "sv"

  // Fetch logo PNG for branding block
  let logoData: ArrayBuffer | null = null
  try {
    const logoRes = await fetch("/logo-word.png")
    if (logoRes.ok) {
      logoData = await logoRes.arrayBuffer()
    }
  } catch {
    // Fallback to text-only branding if logo fetch fails
  }

  // Header info table
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: isSv ? "Ämne:" : "Subject:",
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: metadata.subject, size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: isSv ? "Ämnesområde:" : "Topic:",
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: metadata.topic || "-", size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: isSv ? "Antal frågor:" : "Question count:",
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: String(questions.length),
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      ...(metadata.tutorInitials
        ? [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: isSv ? "Examinator:" : "Examiner:",
                          bold: true,
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: metadata.tutorInitials,
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ]
        : []),
    ],
  })

  // Build all question paragraphs
  const questionParagraphs = questions.flatMap((q, i) =>
    buildQuestionParagraphs(q, i, metadata.language)
  )

  const doc = new Document({
    creator: "TentaGen",
    description: `${isSv ? "Tentafrågor" : "Exam questions"} - ${metadata.subject}`,
    title: `${metadata.subject} - ${isSv ? "Tentafrågor" : "Exam Questions"}`,
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `${metadata.subject} — ${isSv ? "Tentafrågor" : "Exam Questions"}`,
                bold: true,
                size: 36,
              }),
            ],
          }),
          // Subtitle with TentaGen branding + date
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `${isSv ? "Genererad med" : "Generated with"} `,
                size: 20,
                color: "666666",
                italics: true,
              }),
              new TextRun({
                text: "TentaGen",
                size: 22,
                color: "1E3A5F",
                bold: true,
              }),
              new TextRun({
                text: ` — ${new Date().toLocaleDateString(isSv ? "sv-SE" : "en-US")}`,
                size: 20,
                color: "666666",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "tentagen.vercel.app",
                size: 18,
                color: "4A6FA5",
              }),
            ],
          }),
          // Metadata table
          headerTable,
          // Spacer
          new Paragraph({ spacing: { before: 300 }, children: [] }),
          // Questions
          ...questionParagraphs,
          // Footer separator
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: `— ${isSv ? "Slut på tentafrågor" : "End of exam questions"} —`,
                italics: true,
                color: "999999",
                size: 18,
              }),
            ],
          }),
          // TentaGen branding block — prominent
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.SOLID, color: "F0F4FF" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 150, after: 60 },
                        children: [
                          ...(logoData
                            ? [
                                new ImageRun({
                                  data: logoData,
                                  transformation: { width: 28, height: 28 },
                                  type: "png",
                                }),
                                new TextRun({ text: " " }),
                              ]
                            : []),
                          new TextRun({
                            text: "TentaGen",
                            bold: true,
                            size: 28,
                            color: "1E3A5F",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 60 },
                        children: [
                          new TextRun({
                            text: isSv
                              ? "Smartare tentafrågor för utbildningsorganisationer"
                              : "Smarter exam questions for educational organizations",
                            size: 18,
                            color: "4A6FA5",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "tentagen.vercel.app",
                            bold: true,
                            size: 20,
                            color: "1E3A5F",
                          }),
                          new TextRun({
                            text: isSv
                              ? "  •  Utvecklad av Parviz Mammadzada, MD, PhD"
                              : "  •  Developed by Parviz Mammadzada, MD, PhD",
                            size: 18,
                            color: "6B7280",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 150 },
                        children: [
                          new TextRun({
                            text: isSv
                              ? `Exporterad ${new Date().toLocaleDateString("sv-SE")}  •  ${questions.length} ${questions.length === 1 ? "fråga" : "frågor"}`
                              : `Exported ${new Date().toLocaleDateString("en-US")}  •  ${questions.length} ${questions.length === 1 ? "question" : "questions"}`,
                            size: 16,
                            color: "9CA3AF",
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  // Generate blob using Packer
  const { Packer } = await import("docx")
  return await Packer.toBlob(doc)
}
