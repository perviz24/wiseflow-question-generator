/**
 * Client-side PDF text extraction using PDF.js
 * Runs in the browser - no server-side costs or crashes
 */

import * as pdfjsLib from 'pdfjs-dist'

// Configure worker - using CDN for reliability
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    const textContent: string[] = []

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const content = await page.getTextContent()

      // Combine text items with spaces
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ')

      textContent.push(pageText)
    }

    // Join all pages with double newline
    return textContent.join('\n\n')
  } catch (error) {
    console.error('PDF extraction failed:', error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
