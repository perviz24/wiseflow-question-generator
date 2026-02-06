import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  questions: defineTable({
    // Basic metadata
    title: v.string(),
    subject: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    language: v.union(v.literal("sv"), v.literal("en")),
    tags: v.array(v.string()),

    // Question content
    type: v.union(
      v.literal("mcq"),
      v.literal("longtextV2"),
      v.literal("true_false")
    ),
    stimulus: v.string(), // Question text (HTML allowed)

    // MCQ specific fields
    options: v.optional(v.array(v.object({
      label: v.string(),
      value: v.string() // Index as string: "0", "1", "2", etc.
    }))),
    correctAnswer: v.optional(v.array(v.string())), // Array of correct value indices
    shuffleOptions: v.optional(v.boolean()),

    // Essay/longtextV2 specific fields
    maxLength: v.optional(v.number()), // Word limit
    formattingOptions: v.optional(v.array(v.string())),
    instructorStimulus: v.optional(v.string()), // Model answer/rubric
    submitOverLimit: v.optional(v.boolean()),

    // Scoring
    score: v.number(),
    minScore: v.number(),
    maxScore: v.number(),

    // Metadata
    userId: v.string(), // Clerk user ID
    createdAt: v.number(),
    generatedBy: v.union(v.literal("ai"), v.literal("manual"))
  })
    .index("by_user", ["userId"])
    .index("by_subject", ["subject"])
    .index("by_created_at", ["createdAt"]),

  userProfiles: defineTable({
    userId: v.string(), // Clerk user ID
    tutorInitials: v.string(), // e.g., "JD", "AB", "id:pma"
    uiLanguage: v.union(v.literal("sv"), v.literal("en")), // UI language preference
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
})
