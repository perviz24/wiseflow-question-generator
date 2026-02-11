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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        aria-label="Send feedback"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </SignedIn>
  )
}
