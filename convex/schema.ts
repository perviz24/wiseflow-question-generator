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

    // Question content — 18 active types + 2 legacy (hotspot, rating_scale)
    type: v.union(
      // Core tier (always on)
      v.literal("mcq"),
      v.literal("longtextV2"),
      v.literal("true_false"),
      v.literal("short_answer"),
      v.literal("fill_blank"),
      // Extended tier (on by default)
      v.literal("multiple_response"),
      v.literal("matching"),
      v.literal("ordering"),
      // Specialized tier (off by default, enable in settings)
      v.literal("choicematrix"),
      v.literal("clozetext"),
      v.literal("clozedropdown"),
      v.literal("orderlist"),
      v.literal("tokenhighlight"),
      v.literal("clozeassociation"),
      v.literal("imageclozeassociationV2"),
      v.literal("plaintext"),
      v.literal("formulaessayV2"),
      v.literal("chemistryessayV2"),
      // Legacy (kept for DB backwards compatibility)
      v.literal("hotspot"),
      v.literal("rating_scale")
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
    tutorInitials: v.optional(v.string()), // Tutor initials from profile (optional for backwards compatibility)
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
    enabledQuestionTypes: v.optional(v.array(v.string())), // Which types are active (undefined = defaults)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  transcriptionJobs: defineTable({
    userId: v.string(), // Clerk user ID
    videoUrl: v.string(), // Original video URL
    videoGuid: v.string(), // Bunny.net video GUID
    language: v.union(v.literal("sv"), v.literal("en")),
    status: v.union(
      v.literal("processing"), // Video is being transcribed
      v.literal("completed"), // Transcript is ready
      v.literal("failed") // Transcription failed
    ),
    transcript: v.optional(v.string()), // Plain text transcript (available when status = completed)
    characterCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()), // Error details if failed
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_video_guid", ["videoGuid"])
    .index("by_status", ["status"]),

  feedback: defineTable({
    userId: v.string(), // Clerk user ID
    type: v.union(
      v.literal("bug"), // Bug report
      v.literal("improvement"), // Feature request/improvement
      v.literal("other") // General feedback
    ),
    message: v.string(), // Feedback message
    userEmail: v.optional(v.string()), // Optional email for follow-up
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"]),
})
