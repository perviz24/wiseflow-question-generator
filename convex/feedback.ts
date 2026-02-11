import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

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

    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect()

    return feedback
  },
})
