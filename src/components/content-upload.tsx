"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Loader2, X, Link2 } from "lucide-react"
import { toast } from "sonner"

interface ContentUploadProps {
  onContentExtracted: (content: string, source: string) => void
}

export function ContentUpload({ onContentExtracted }: ContentUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]

    if (!validTypes.includes(file.type)) {
      toast.error("Ogiltigt filformat", {
        description: "Endast PDF, Word (.docx) och PowerPoint (.pptx) stöds.",
      })
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Filen är för stor", {
        description: "Maximal filstorlek är 10MB.",
      })
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-content", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract content")
      }

      onContentExtracted(data.content, `Fil: ${file.name}`)
      toast.success("Innehåll extraherat!", {
        description: `Extraherade ${data.content.length} tecken från ${file.name}`,
      })
    } catch (error) {
      console.error("File extraction failed:", error)
      toast.error("Extraktion misslyckades", {
        description: error instanceof Error ? error.message : "Kunde inte läsa filen.",
      })
      setUploadedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!url.trim()) return

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      toast.error("Ogiltig URL", {
        description: "Ange en giltig webbadress.",
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract content")
      }

      onContentExtracted(data.content, `URL: ${url}`)
      toast.success("Innehåll extraherat!", {
        description: `Extraherade ${data.content.length} tecken från URL`,
      })
      setUrl("")
    } catch (error) {
      console.error("URL extraction failed:", error)
      toast.error("Extraktion misslyckades", {
        description: error instanceof Error ? error.message : "Kunde inte hämta innehåll från URL.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    // Reset file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">
              Ladda upp dokument (valfritt)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.pptx"
                onChange={handleFileUpload}
                disabled={isProcessing || !!uploadedFile}
                className="cursor-pointer"
              />
              {uploadedFile && !isProcessing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              PDF, Word (.docx) eller PowerPoint (.pptx), max 10MB
            </p>
          </div>

          {uploadedFile && (
            <div className="flex items-center gap-2 rounded-md bg-muted p-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{uploadedFile.name}</span>
              {isProcessing && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                eller
              </span>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url-input">
              Hämta från webbadress (valfritt)
            </Label>
            <div className="flex gap-2">
              <Input
                id="url-input"
                type="url"
                placeholder="https://exempel.se/artikel"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isProcessing}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && url.trim()) {
                    e.preventDefault()
                    handleUrlSubmit()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={isProcessing || !url.trim()}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Ange en URL för att extrahera innehåll från webbsidan
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
