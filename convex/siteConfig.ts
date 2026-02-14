import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Admin emails — only these users can toggle launch settings
const ADMIN_EMAILS = ["perviz20@yahoo.com"]

/** Check if a Clerk identity is an admin based on email */
function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Get launch status — public, no auth needed
export const getLaunchStatus = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("siteConfig")
      .withIndex("by_key", (q) => q.eq("key", "launchReady"))
      .first()
    return config?.value ?? false
  },
})

// Check if current user is admin — requires auth
export const getIsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return false
    return isAdminEmail(identity.email)
  },
})

// Toggle launch ready — admin only
export const setLaunchReady = mutation({
  args: { value: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    if (!isAdminEmail(identity.email)) {
      throw new Error("Not authorized — admin only")
    }

    const existing = await ctx.db
      .query("siteConfig")
      .withIndex("by_key", (q) => q.eq("key", "launchReady"))
      .first()

    const now = Date.now()

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: identity.email ?? "unknown",
        updatedAt: now,
      })
    } else {
      await ctx.db.insert("siteConfig", {
        key: "launchReady",
        value: args.value,
        updatedBy: identity.email ?? "unknown",
        updatedAt: now,
      })
    }

    return { success: true, launchReady: args.value }
  },
})
