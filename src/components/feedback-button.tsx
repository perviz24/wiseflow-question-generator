"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedbackModal } from "@/components/feedback-modal"
import { SignedIn } from "@clerk/nextjs"
import { useTranslation } from "@/lib/language-context"

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <SignedIn>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-warm hover:bg-warm/90 text-white gap-2 px-6 max-sm:px-3 max-sm:h-10 max-sm:w-10 max-sm:bottom-4 max-sm:right-4"
        aria-label={t("feedbackSubmit")}
      >
        <MessageCircle className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
        <span className="font-medium max-sm:hidden">{t("feedbackSubmit")}</span>
      </Button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </SignedIn>
  )
}
