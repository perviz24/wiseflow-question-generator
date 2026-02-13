import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get user profile (or return defaults if not found)
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first()

    // Return defaults if no profile exists
    if (!profile) {
      return {
        tutorInitials: "",
        uiLanguage: "sv" as const,
        enabledQuestionTypes: undefined,
      }
    }

    return {
      tutorInitials: profile.tutorInitials,
      uiLanguage: profile.uiLanguage,
      enabledQuestionTypes: profile.enabledQuestionTypes,
    }
  },
})

// Create or update user profile
export const upsertProfile = mutation({
  args: {
    tutorInitials: v.string(),
    uiLanguage: v.union(v.literal("sv"), v.literal("en")),
    enabledQuestionTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first()

    const now = Date.now()

    if (existing) {
      // Update existing profile — only include enabledQuestionTypes if actually provided
      // Passing explicit undefined to Convex patch can cause validation errors
      if (args.enabledQuestionTypes !== undefined) {
        await ctx.db.patch(existing._id, {
          tutorInitials: args.tutorInitials,
          uiLanguage: args.uiLanguage,
          enabledQuestionTypes: args.enabledQuestionTypes,
          updatedAt: now,
        })
      } else {
        await ctx.db.patch(existing._id, {
          tutorInitials: args.tutorInitials,
          uiLanguage: args.uiLanguage,
          updatedAt: now,
        })
      }
      return { success: true, action: "updated" }
    } else {
      // Create new profile — only include enabledQuestionTypes if provided
      if (args.enabledQuestionTypes !== undefined) {
        await ctx.db.insert("userProfiles", {
          userId: identity.subject,
          tutorInitials: args.tutorInitials,
          uiLanguage: args.uiLanguage,
          enabledQuestionTypes: args.enabledQuestionTypes,
          createdAt: now,
          updatedAt: now,
        })
      } else {
        await ctx.db.insert("userProfiles", {
          userId: identity.subject,
          tutorInitials: args.tutorInitials,
          uiLanguage: args.uiLanguage,
          createdAt: now,
          updatedAt: now,
        })
      }
      return { success: true, action: "created" }
    }
  },
})
