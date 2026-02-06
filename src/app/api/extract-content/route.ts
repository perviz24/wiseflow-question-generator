import { NextRequest, NextResponse } from "next/server"
import * as pdfjsLib from "pdfjs-dist"
import mammoth from "mammoth"

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let extractedText = ""

    // Extract based on file type
    if (fileType === "application/pdf") {
      extractedText = await extractPDF(buffer)
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      extractedText = await extractWord(buffer)
    } else if (fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
      // For PPTX, we'll return an error for now (complex to parse)
      return NextResponse.json(
        { error: "PowerPoint extraction is not yet supported" },
        { status: 400 }
      )
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content found in file" },
        { status: 400 }
      )
    }

    // Limit to 50,000 characters (reasonable context size)
    const content = extractedText.slice(0, 50000)

    return NextResponse.json({ content, length: content.length })
  } catch (error) {
    console.error("Content extraction error:", error)
    return NextResponse.json(
      { error: "Failed to extract content from file" },
      { status: 500 }
    )
  }
}

async function extractPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfData = new Uint8Array(buffer)
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
    let text = ""

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ")
      text += pageText + "\n\n"
    }

    return text.trim()
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

async function extractWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error("Word extraction error:", error)
    throw new Error("Failed to extract text from Word document")
  }
}
