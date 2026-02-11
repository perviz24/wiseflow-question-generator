"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/language-context"
import { toast } from "sonner"

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { t } = useTranslation()
  const [type, setType] = useState<"bug" | "improvement" | "other">("bug")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitFeedback = useMutation(api.feedback.submitFeedback)

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error(t("feedbackError"), {
        description: t("feedbackMessagePlaceholder"),
      })
      return
    }

    setIsSubmitting(true)

    try {
      await submitFeedback({
        type,
        message: message.trim(),
        userEmail: email.trim() || undefined,
      })

      toast.success(t("feedbackSuccess"), {
        description: t("feedbackSuccessDesc"),
      })

      // Reset form
      setMessage("")
      setEmail("")
      setType("bug")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      toast.error(t("feedbackError"), {
        description: t("feedbackErrorDesc"),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("feedbackTitle")}</DialogTitle>
          <DialogDescription>
            {t("feedbackDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("feedbackType")}</Label>
            <RadioGroup value={type} onValueChange={(val) => setType(val as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bug" id="bug" />
                <Label htmlFor="bug" className="font-normal cursor-pointer">
                  {t("feedbackTypeBug")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="improvement" id="improvement" />
                <Label htmlFor="improvement" className="font-normal cursor-pointer">
                  {t("feedbackTypeImprovement")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">
                  {t("feedbackTypeOther")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t("feedbackMessage")}</Label>
            <Textarea
              id="message"
              placeholder={t("feedbackMessagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("feedbackEmail")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("feedbackEmailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !message.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("feedbackSubmit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
