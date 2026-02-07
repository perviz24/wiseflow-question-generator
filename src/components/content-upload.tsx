"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Loader2, X, Link2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useConvex, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

interface ContentUploadProps {
  onContentExtracted: (content: string, source: string) => void
  onFileUploaded?: (storageId: string, fileName: string, fileType: string) => void
}

interface UploadedItem {
  id: string
  name: string
  type: "file" | "url"
}

export function ContentUpload({ onContentExtracted, onFileUploaded }: ContentUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([])
  const [urlInputs, setUrlInputs] = useState<string[]>([""])

  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check file types
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error("Ogiltigt filformat", {
          description: `${file.name}: Endast PDF, Word (.docx) och PowerPoint (.pptx) stöds.`,
        })
        continue
      }

      // No file size limit when using Convex storage!
      // Convex Free: 1GB total, Pro: 10GB total

      setIsProcessing(true)

      try {
        // Step 1: Get upload URL from Convex
        const uploadUrl = await generateUploadUrl()

        // Step 2: Upload file directly to Convex storage
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!uploadResult.ok) {
          throw new Error("Failed to upload file to storage")
        }

        const { storageId } = await uploadResult.json()

        // Step 3: Extract content from the uploaded file for backward compatibility
        const extractResponse = await fetch("/api/extract-from-storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storageId, fileName: file.name, fileType: file.type }),
        })

        const extractData = await extractResponse.json()

        if (!extractResponse.ok) {
          throw new Error(extractData.error || "Failed to extract content from storage")
        }

        // Notify parent with extracted content (keeps existing flow working)
        onContentExtracted(extractData.content, `Fil: ${file.name}`)

        // Also notify parent about storageId for future use
        if (onFileUploaded) {
          onFileUploaded(storageId, file.name, file.type)
        }

        // Add to uploaded items list
        setUploadedItems(prev => [
          ...prev,
          { id: storageId, name: file.name, type: "file" },
        ])

        toast.success("Fil uppladdad!", {
          description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) - Innehåll extraherat!`,
        })
      } catch (error) {
        console.error("File upload failed:", error)
        toast.error("Uppladdning misslyckades", {
          description: error instanceof Error ? error.message : `Kunde inte ladda upp ${file.name}.`,
        })
      }
    }

    setIsProcessing(false)

    // Reset file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleUrlSubmit = async (index: number) => {
    const url = urlInputs[index]?.trim()
    if (!url) return

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

      // Add to uploaded items list
      setUploadedItems(prev => [
        ...prev,
        { id: Date.now().toString() + Math.random(), name: url, type: "url" },
      ])

      toast.success("Innehåll extraherat!", {
        description: `Extraherade ${data.content.length} tecken från URL`,
      })

      // Clear this URL input
      const newUrls = [...urlInputs]
      newUrls[index] = ""
      setUrlInputs(newUrls)
    } catch (error) {
      console.error("URL extraction failed:", error)
      toast.error("Extraktion misslyckades", {
        description: error instanceof Error ? error.message : "Kunde inte hämta innehåll från URL.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const removeItem = (id: string) => {
    setUploadedItems(prev => prev.filter(item => item.id !== id))
    toast.info("Borttagen", {
      description: "Innehåll borttaget. Generera nya frågor för att uppdatera.",
    })
  }

  const addUrlInput = () => {
    setUrlInputs(prev => [...prev, ""])
  }

  const removeUrlInput = (index: number) => {
    setUrlInputs(prev => prev.filter((_, i) => i !== index))
  }

  const updateUrlInput = (index: number, value: string) => {
    const newUrls = [...urlInputs]
    newUrls[index] = value
    setUrlInputs(newUrls)
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
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={handleFileUpload}
              disabled={isProcessing}
              multiple
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              PDF, Word (.docx) eller PowerPoint (.pptx). Välj flera filer samtidigt. Inga filstorleksbegränsningar.
            </p>
          </div>

          {/* Uploaded Items List */}
          {uploadedItems.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uppladdade filer och URL:er:</Label>
              {uploadedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-md bg-muted p-3"
                >
                  {item.type === "file" ? (
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm flex-1 truncate" title={item.name}>
                    {item.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
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

          {/* URL Inputs */}
          <div className="space-y-3">
            <Label>Hämta från webbadresser (valfritt)</Label>
            {urlInputs.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://exempel.se/artikel"
                  value={url}
                  onChange={(e) => updateUrlInput(index, e.target.value)}
                  disabled={isProcessing}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && url.trim()) {
                      e.preventDefault()
                      handleUrlSubmit(index)
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => handleUrlSubmit(index)}
                  disabled={isProcessing || !url.trim()}
                  size="icon"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                </Button>
                {urlInputs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUrlInput(index)}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUrlInput}
              disabled={isProcessing}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till fler URL:er
            </Button>
            <p className="text-sm text-muted-foreground">
              Ange webbadresser för att extrahera innehåll från webbsidor
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
