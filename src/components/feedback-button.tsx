"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedbackModal } from "@/components/feedback-modal"
import { SignedIn } from "@clerk/nextjs"

export function FeedbackButton() {
  const [open, setOpen] = useState(false)

  return (
    <SignedIn>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6"
        aria-label="Send feedback"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">Skicka feedback</span>
      </Button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </SignedIn>
  )
}
