// Word (.docx) export for exam questions
// Uses docx library to create professional Word documents

import {
  Document,
  Paragraph,
  TextRun,
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
  }
  const entry = names[type]
  return entry ? (lang === "sv" ? entry[0] : entry[1]) : type
}

function getDifficultyLabel(diff: string, lang: string): string {
  const names: Record<string, [string, string]> = {
    easy: ["Lätt", "Easy"],
    medium: ["Medium", "Medium"],
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

  // Options (for MCQ, true_false, multiple_response, matching, ordering)
  if (q.options && q.options.length > 0) {
    const optionLabel = isSv ? "Svarsalternativ:" : "Answer options:"
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [
          new TextRun({ text: optionLabel, bold: true, size: 20 }),
        ],
      })
    )

    q.options.forEach((opt) => {
      const isCorrect = q.correctAnswer?.includes(opt.value)
      paragraphs.push(
        new Paragraph({
          spacing: { after: 20 },
          indent: { left: 400 },
          children: [
            new TextRun({
              text: `${opt.label}: `,
              bold: true,
              size: 20,
            }),
            new TextRun({
              text: opt.value,
              size: 20,
            }),
            ...(isCorrect
              ? [
                  new TextRun({
                    text: ` ✓`,
                    bold: true,
                    color: "2E7D32",
                    size: 20,
                  }),
                ]
              : []),
          ],
        })
      )
    })
  }

  // Correct answer (for types without options, or fill_blank)
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
          // Subtitle with date
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `${isSv ? "Genererad" : "Generated"}: ${new Date().toLocaleDateString(isSv ? "sv-SE" : "en-US")} | TentaGen`,
                size: 20,
                color: "888888",
                italics: true,
              }),
            ],
          }),
          // Metadata table
          headerTable,
          // Spacer
          new Paragraph({ spacing: { before: 300 }, children: [] }),
          // Questions
          ...questionParagraphs,
          // Footer
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: `— ${isSv ? "Slut på tentafrågor" : "End of exam questions"} —`,
                italics: true,
                color: "999999",
                size: 18,
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
