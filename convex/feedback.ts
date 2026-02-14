import { v } from "convex/values"
import { mutation, query, action, internalAction } from "./_generated/server"
import { internal } from "./_generated/api"

// Email notification action — sends email to developer when new feedback arrives
export const sendFeedbackNotification = internalAction({
  args: {
    type: v.string(),
    message: v.string(),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log("RESEND_API_KEY not set — skipping email notification")
      return
    }

    const typeEmoji: Record<string, string> = {
      bug: "🐛 Bug Report",
      improvement: "💡 Improvement",
      other: "💬 Other",
    }

    const typeLabel = typeEmoji[args.type] || args.type
    const fromUser = args.userName || "Anonymous user"
    const contactEmail = args.userEmail || "No email provided"

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TentaGen <onboarding@resend.dev>",
        // NOTE: Resend free tier only allows sending to account owner email.
        // To add parviz.mammadzada@oru.se, verify a domain at resend.com/domains
        // and change "from" to use that domain (e.g. noreply@tentagen.se)
        to: ["perviz20@yahoo.com"],
        subject: `[TentaGen] ${typeLabel} from ${fromUser}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488;">New TentaGen Feedback</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #64748b; width: 100px;">Type</td>
                <td style="padding: 8px 12px;">${typeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">From</td>
                <td style="padding: 8px 12px;">${fromUser}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">Email</td>
                <td style="padding: 8px 12px;">${contactEmail}</td>
              </tr>
            </table>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #0d9488;">
              <p style="margin: 0; white-space: pre-wrap;">${args.message}</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
              This notification was sent automatically from TentaGen feedback system.
              <br />View all feedback in your <a href="https://dashboard.convex.dev" style="color: #0d9488;">Convex dashboard</a>.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to send feedback email:", response.status, errorText)
    } else {
      console.log("Feedback notification email sent successfully")
    }
  },
})

export const submitFeedback = mutation({
  args: {
    type: v.union(v.literal("bug"), v.literal("improvement"), v.literal("other")),
    message: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Not authenticated")
    }

    const feedbackId = await ctx.db.insert("feedback", {
      userId: identity.subject,
      type: args.type,
      message: args.message,
      userEmail: args.userEmail,
      createdAt: Date.now(),
    })

    // Schedule email notification (runs immediately after mutation succeeds)
    await ctx.scheduler.runAfter(0, internal.feedback.sendFeedbackNotification, {
      type: args.type,
      message: args.message,
      userEmail: args.userEmail,
      userName: identity.name || identity.email || undefined,
    })

    return feedbackId
  },
})

export const listFeedback = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return []
    }

    // Cap at 100 — no user will submit more than 100 feedback entries
    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(100)

    return feedback
  },
})
