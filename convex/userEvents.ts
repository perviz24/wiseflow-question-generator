import { v } from "convex/values"
import { mutation, query, internalAction } from "./_generated/server"
import { internal } from "./_generated/api"

// Admin emails — reuse same list from siteConfig
const ADMIN_EMAILS = ["perviz20@yahoo.com"]

function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Track first-time login — called by AuthTracker on every auth load
// Only inserts a row + sends email if this userId has NEVER been seen before
export const trackFirstLogin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { isNew: false }

    const userId = identity.subject

    // Check if this user already has an event logged
    const existing = await ctx.db
      .query("userEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first()

    if (existing) {
      return { isNew: false } // Returning user, skip
    }

    // First-time user — log the event
    await ctx.db.insert("userEvents", {
      userId,
      email: identity.email ?? undefined,
      name: identity.name ?? undefined,
      event: "first_login",
      createdAt: Date.now(),
    })

    // Schedule email notification (runs immediately after mutation succeeds)
    await ctx.scheduler.runAfter(0, internal.userEvents.sendNewUserNotification, {
      email: identity.email ?? "No email",
      name: identity.name ?? "Unknown user",
    })

    return { isNew: true }
  },
})

// Email notification — sends email to admin when a new user signs in
// Reuses the same Resend pattern from convex/feedback.ts
export const sendNewUserNotification = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log("RESEND_API_KEY not set — skipping new user email")
      return
    }

    const now = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TentaGen <onboarding@resend.dev>",
        to: ["perviz20@yahoo.com"],
        subject: `[TentaGen] 🆕 New user: ${args.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488;">New User Signed In</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #64748b; width: 100px;">Name</td>
                <td style="padding: 8px 12px;">${args.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">Email</td>
                <td style="padding: 8px 12px;">${args.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">Time</td>
                <td style="padding: 8px 12px;">${now}</td>
              </tr>
            </table>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
              This notification was sent automatically from TentaGen.
              <br />View all users in your <a href="https://www.tentagen.se/admin" style="color: #0d9488;">Admin Panel</a>.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to send new user email:", response.status, errorText)
    } else {
      console.log("New user notification email sent:", args.email)
    }
  },
})

// List all user events — admin only, for the admin page log
export const listUserEvents = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    if (!isAdminEmail(identity.email)) return []

    return await ctx.db
      .query("userEvents")
      .withIndex("by_created_at")
      .order("desc")
      .collect()
  },
})
