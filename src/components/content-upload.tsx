"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Loader2, X, Link2, Plus, Video, Upload, Globe } from "lucide-react"
import { toast } from "sonner"
import { useConvex, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useTranslation } from "@/lib/language-context"
import { extractTextFromPDF } from "@/lib/pdf-utils"

interface ContentUploadProps {
  onContentExtracted: (content: string, source: string) => void
  onFileUploaded?: (storageId: string, fileName: string, fileType: string) => void
  onContentRemoved?: () => void
}

interface UploadedItem {
  id: string
  name: string
  type: "file" | "url" | "youtube"
}

export function ContentUpload({ onContentExtracted, onFileUploaded, onContentRemoved }: ContentUploadProps) {
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([])
  const [urlInputs, setUrlInputs] = useState<string[]>([""])
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const convex = useConvex()
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl)
  const deleteFile = useMutation(api.fileStorage.deleteFile)
  const [transcriptionProgress, setTranscriptionProgress] = useState("")

  // Helper: poll AssemblyAI transcription until complete
  const pollTranscription = useCallback(async (transcriptId: string): Promise<{ transcript: string; characterCount: number }> => {
    const maxAttempts = 180 // 15 minutes max (5s interval)
    for (let i = 0; i < maxAttempts; i++) {
      const res = await fetch(`/api/check-transcription?id=${transcriptId}`)
      const data = await res.json()

      if (data.status === "completed") {
        setTranscriptionProgress("")
        return { transcript: data.transcript, characterCount: data.characterCount }
      }

      if (data.status === "error") {
        setTranscriptionProgress("")
        throw new Error(data.error || "Transcription failed")
      }

      // Update progress with simple dots animation (no seconds — avoids misinterpretation)
      const dots = ".".repeat((i % 3) + 1)
      setTranscriptionProgress(`Transkriberar${dots}`)

      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    setTranscriptionProgress("")
    throw new Error("Transcription timed out after 15 minutes")
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check file types - PDF now supported via client-side extraction
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
        let extractedContent = ""

        // For PDFs, extract client-side FIRST (faster, no API costs, no crashes)
        if (file.type === "application/pdf") {
          try {
            extractedContent = await extractTextFromPDF(file)
            // Limit to 50,000 characters
            extractedContent = extractedContent.slice(0, 50000)
          } catch (pdfError) {
            console.error("PDF extraction failed:", pdfError)
            throw new Error("Kunde inte extrahera text från PDF. Filen kan vara skadad eller lösenordsskyddad.")
          }
        }

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

        // Step 3: Extract content (skip API call for PDFs - already extracted)
        if (file.type !== "application/pdf") {
          const extractResponse = await fetch("/api/extract-from-storage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storageId, fileName: file.name, fileType: file.type }),
          })

          const extractData = await extractResponse.json()

          if (!extractResponse.ok) {
            throw new Error(extractData.error || "Failed to extract content from storage")
          }

          extractedContent = extractData.content
        }

        // Notify parent with extracted content
        onContentExtracted(extractedContent, `Fil: ${file.name}`)

        // Also notify parent about storageId for future use
        if (onFileUploaded) {
          onFileUploaded(storageId, file.name, file.type)
        }

        // Auto-delete file from Convex storage — content already extracted, no need to keep it
        try {
          await deleteFile({ storageId })
        } catch (deleteError) {
          console.warn("Could not auto-delete file from storage:", deleteError)
        }

        // Add to uploaded items list (use random ID since storageId no longer valid)
        setUploadedItems(prev => [
          ...prev,
          { id: Date.now().toString() + Math.random(), name: file.name, type: "file" },
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
    // Filter out the removed item
    const newItems = uploadedItems.filter(item => item.id !== id)
    setUploadedItems(newItems)

    // Notify parent to clear uploaded context if all items removed
    if (newItems.length === 0 && onContentRemoved) {
      onContentRemoved()
    }

    toast.info("Borttagen", {
      description: "Innehåll borttaget.",
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

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
    }
  }

  const handleVideoFileSubmit = async () => {
    if (!videoFile) return

    setIsProcessing(true)

    try {
      // Step 1: Upload video to Convex storage
      setTranscriptionProgress("Laddar upp video...")
      const uploadUrl = await generateUploadUrl()

      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": videoFile.type },
        body: videoFile,
      })

      if (!uploadResult.ok) {
        throw new Error("Failed to upload video file to storage")
      }

      const { storageId } = await uploadResult.json()

      // Step 2: Get the public URL for the uploaded file
      const fileUrl = await convex.query(api.fileStorage.getFileUrl, {
        storageId,
      })

      if (!fileUrl) {
        throw new Error("Could not get file URL from storage")
      }

      // Step 3: Submit URL to AssemblyAI for transcription
      setTranscriptionProgress("Skickar till transkribering...")
      const response = await fetch("/api/extract-video-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fileUrl, language: "sv" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit video for transcription")
      }

      // Step 4: Poll for completion
      const result = await pollTranscription(data.transcriptId)

      // Auto-delete video from Convex storage — transcription done, no need to keep it
      try {
        await deleteFile({ storageId })
      } catch (deleteError) {
        console.warn("Could not auto-delete video from storage:", deleteError)
      }

      onContentExtracted(result.transcript, `Video: ${videoFile.name}`)

      setUploadedItems(prev => [
        ...prev,
        { id: Date.now().toString() + Math.random(), name: videoFile.name, type: "file" },
      ])

      toast.success("Videotranskription klar!", {
        description: `Extraherade ${result.characterCount} tecken från ${videoFile.name}`,
      })

      setVideoFile(null)
      const videoInput = document.getElementById("video-upload") as HTMLInputElement
      if (videoInput) videoInput.value = ""
    } catch (error) {
      console.error("Video file transcript extraction failed:", error)
      toast.error("Videobearbetning misslyckades", {
        description: error instanceof Error ? error.message : "Kunde inte bearbeta videofilen.",
      })
    } finally {
      setIsProcessing(false)
      setTranscriptionProgress("")
    }
  }

  // Check if a URL is a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url)
      return (
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes("youtu.be") ||
        parsed.hostname.includes("youtube-nocookie.com")
      )
    } catch {
      return false
    }
  }

  // Check if URL is from a platform that doesn't support direct audio/video links
  const isWebPageVideoUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url)
      return (
        parsed.hostname.includes("vimeo.com") ||
        parsed.hostname.includes("dailymotion.com") ||
        parsed.hostname.includes("twitch.tv") ||
        parsed.hostname.includes("facebook.com") ||
        parsed.hostname.includes("instagram.com") ||
        parsed.hostname.includes("tiktok.com")
      )
    } catch {
      return false
    }
  }

  const handleVideoUrlSubmit = async () => {
    const url = youtubeUrl.trim()
    if (!url) return

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      toast.error("Ogiltig video-URL", {
        description: "Ange en giltig video-URL.",
      })
      return
    }

    setIsProcessing(true)

    try {
      if (isYouTubeUrl(url)) {
        // YouTube URLs → use youtube-transcript package (AssemblyAI can't fetch YouTube pages)
        setTranscriptionProgress("Hämtar YouTube-transkription...")

        const response = await fetch("/api/extract-youtube-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, language: "sv" }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to extract YouTube transcript")
        }

        onContentExtracted(data.transcript, `Video: ${url}`)

        setUploadedItems(prev => [
          ...prev,
          { id: Date.now().toString() + Math.random(), name: url, type: "youtube" },
        ])

        toast.success("YouTube-transkription klar!", {
          description: `Extraherade ${data.characterCount} tecken`,
        })
      } else {
        // Non-YouTube video URLs → AssemblyAI (can fetch direct audio/video URLs)
        // Block web-page-only platforms (Vimeo, TikTok, etc.) — AssemblyAI gets HTML, not audio
        if (isWebPageVideoUrl(url)) {
          toast.error("Denna plattform stöds inte för direktlänkar", {
            description: "Vimeo, TikTok, Instagram m.fl. kräver att du laddar ner videon först. Ladda sedan upp filen direkt via filuppladdningen ovan.",
            duration: 8000,
          })
          setIsProcessing(false)
          setTranscriptionProgress("")
          return
        }
        setTranscriptionProgress("Skickar till transkribering...")

        const response = await fetch("/api/extract-video-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, language: "sv" }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to submit video for transcription")
        }

        // Poll for completion
        const result = await pollTranscription(data.transcriptId)

        onContentExtracted(result.transcript, `Video: ${url}`)

        setUploadedItems(prev => [
          ...prev,
          { id: Date.now().toString() + Math.random(), name: url, type: "youtube" },
        ])

        toast.success("Videotranskription klar!", {
          description: `Extraherade ${result.characterCount} tecken`,
        })
      }

      setYoutubeUrl("")
    } catch (error) {
      console.error("Video transcript extraction failed:", error)
      toast.error("Extraktion misslyckades", {
        description: error instanceof Error ? error.message : "Kunde inte hämta transkription från video.",
      })
    } finally {
      setIsProcessing(false)
      setTranscriptionProgress("")
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* File Upload Section */}
          <div className="space-y-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              <Label className="text-base font-semibold">
                {t("uploadDocument")}
              </Label>
            </div>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={handleFileUpload}
              disabled={isProcessing}
              multiple
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              {t("uploadDocumentHelp")}
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
                  ) : item.type === "youtube" ? (
                    <Video className="h-4 w-4 text-red-500 flex-shrink-0" />
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
                {t("andAlso")}
              </span>
            </div>
          </div>

          {/* URL Inputs Section */}
          <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-500" />
              <Label className="text-base font-semibold">
                {t("fetchFromUrls")}
              </Label>
            </div>
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
              {t("addMoreUrls")}
            </Button>
            <p className="text-xs text-muted-foreground">
              Ange webbadresser för att extrahera innehåll från webbsidor
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("andAlso")}
              </span>
            </div>
          </div>

          {/* Video Section */}
          <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">
                {t("videoSectionTitle")}
              </Label>
            </div>

            {/* Video File Upload */}
            <div className="space-y-2">
              <Label htmlFor="video-upload">
                {t("uploadVideoFile")}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  disabled={isProcessing}
                  className="cursor-pointer flex-1"
                />
                <Button
                  type="button"
                  onClick={handleVideoFileSubmit}
                  disabled={isProcessing || !videoFile}
                  size="default"
                  className="whitespace-nowrap"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Bearbetar...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Bearbeta video
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("videoSupportNote")}
              </p>
            </div>

            {/* Transcription Progress */}
            {transcriptionProgress && (
              <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {transcriptionProgress}
                </span>
              </div>
            )}

            {/* Video URL Input */}
            <div className="space-y-2">
              <Label htmlFor="youtube-url">
                {t("videoUrlLabel")}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder={t("videoUrlPlaceholder")}
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isProcessing}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && youtubeUrl.trim()) {
                      e.preventDefault()
                      handleVideoUrlSubmit()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleVideoUrlSubmit}
                  disabled={isProcessing || !youtubeUrl.trim()}
                  size="icon"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
