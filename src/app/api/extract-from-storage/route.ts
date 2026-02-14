import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import mammoth from "mammoth"
import { parseOffice } from "officeparser"
import { NEXT_PUBLIC_CONVEX_URL } from "@/lib/env"

// Uses validated env var from env.ts instead of raw process.env
const convex = new ConvexHttpClient(NEXT_PUBLIC_CONVEX_URL)

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { storageId, fileName, fileType } = body

    if (!storageId) {
      return NextResponse.json({ error: "Missing storageId" }, { status: 400 })
    }

    // Fetch file URL from Convex storage
    const fileUrl = await convex.query(api.fileStorage.getFileUrl, {
      storageId: storageId as Id<"_storage">,
    })

    if (!fileUrl) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 })
    }

    // Fetch file content
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error("Failed to fetch file from storage")
    }

    const buffer = Buffer.from(await fileResponse.arrayBuffer())

    let extractedText = ""

    // Extract based on file type
    if (fileType === "application/pdf") {
      // PDF support temporarily disabled
      return NextResponse.json(
        { error: "PDF extraction is temporarily disabled. Please use Word (.docx) or PowerPoint (.pptx) files instead." },
        { status: 400 }
      )
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Use mammoth for Word extraction (works reliably)
      const result = await mammoth.extractRawText({ buffer })
      extractedText = result.value
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      // Use officeparser for PowerPoint extraction (works without pdfjs-dist)
      const ast = await parseOffice(buffer, {
        outputErrorToConsole: false,
      })
      extractedText = ast.toText()
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      )
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content found in file" },
        { status: 400 }
      )
    }

    // Limit to 50,000 characters (reasonable context size)
    const content = extractedText.slice(0, 50000)

    return NextResponse.json({
      content,
      length: content.length,
      fileName,
      fileSize: buffer.length,
    })
  } catch (error) {
    console.error("Extract from storage error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract content from storage",
      },
      { status: 500 }
    )
  }
}
