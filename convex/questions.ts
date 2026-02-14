import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Save a batch of generated questions to the database
export const saveQuestions = mutation({
  args: {
    questions: v.array(
      v.object({
        title: v.string(),
        subject: v.string(),
        difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("mixed")),
        language: v.union(v.literal("sv"), v.literal("en")),
        tags: v.array(v.string()),
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
        stimulus: v.string(),
        options: v.optional(
          v.array(
            v.object({
              label: v.string(),
              value: v.string(),
            })
          )
        ),
        correctAnswer: v.optional(v.array(v.string())),
        shuffleOptions: v.optional(v.boolean()),
        maxLength: v.optional(v.number()),
        formattingOptions: v.optional(v.array(v.string())),
        instructorStimulus: v.optional(v.string()),
        submitOverLimit: v.optional(v.boolean()),
        score: v.number(),
        minScore: v.number(),
        maxScore: v.number(),
        tutorInitials: v.optional(v.string()),
        generatedBy: v.union(v.literal("ai"), v.literal("manual")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const userId = identity.subject

    // Insert all questions
    const questionIds = await Promise.all(
      args.questions.map((question) =>
        ctx.db.insert("questions", {
          ...question,
          userId,
          createdAt: Date.now(),
        })
      )
    )

    return {
      success: true,
      count: questionIds.length,
      questionIds,
    }
  },
})

// Get all questions for the current user
export const getUserQuestions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const userId = identity.subject

    // Cap at 500 to prevent unbounded growth — covers even power users
    return await ctx.db
      .query("questions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(500)
  },
})

// Get questions by subject
export const getQuestionsBySubject = query({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const userId = identity.subject

    return await ctx.db
      .query("questions")
      .withIndex("by_subject", (q) => q.eq("subject", args.subject))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(500)
  },
})

// Update a question
export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    stimulus: v.optional(v.string()),
    options: v.optional(
      v.array(
        v.object({
          label: v.string(),
          value: v.string(),
        })
      )
    ),
    correctAnswer: v.optional(v.array(v.string())),
    instructorStimulus: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const question = await ctx.db.get(args.questionId)
    if (!question) {
      throw new Error("Question not found")
    }

    if (question.userId !== identity.subject) {
      throw new Error("Unauthorized")
    }

    await ctx.db.patch(args.questionId, {
      stimulus: args.stimulus,
      options: args.options,
      correctAnswer: args.correctAnswer,
      instructorStimulus: args.instructorStimulus,
      tags: args.tags,
    })

    return { success: true }
  },
})

// Update question difficulty
export const updateDifficulty = mutation({
  args: {
    questionId: v.id("questions"),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("mixed")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const question = await ctx.db.get(args.questionId)
    if (!question) {
      throw new Error("Question not found")
    }

    if (question.userId !== identity.subject) {
      throw new Error("Unauthorized")
    }

    await ctx.db.patch(args.questionId, {
      difficulty: args.difficulty,
    })

    return { success: true }
  },
})

// Update question score
export const updateScore = mutation({
  args: {
    questionId: v.id("questions"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const question = await ctx.db.get(args.questionId)
    if (!question) {
      throw new Error("Question not found")
    }

    if (question.userId !== identity.subject) {
      throw new Error("Unauthorized")
    }

    await ctx.db.patch(args.questionId, {
      score: args.score,
      maxScore: args.score,
    })

    return { success: true }
  },
})

// Update tutor initials
export const updateTutorInitials = mutation({
  args: {
    questionId: v.id("questions"),
    tutorInitials: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const question = await ctx.db.get(args.questionId)
    if (!question) {
      throw new Error("Question not found")
    }

    if (question.userId !== identity.subject) {
      throw new Error("Unauthorized")
    }

    await ctx.db.patch(args.questionId, {
      tutorInitials: args.tutorInitials,
    })

    return { success: true }
  },
})

// Delete a question
export const deleteQuestion = mutation({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const question = await ctx.db.get(args.id)
    if (!question) {
      throw new Error("Question not found")
    }

    if (question.userId !== identity.subject) {
      throw new Error("Unauthorized")
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})

// Bulk delete multiple questions
export const deleteQuestions = mutation({
  args: { ids: v.array(v.id("questions")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    let deleted = 0
    for (const id of args.ids) {
      const question = await ctx.db.get(id)
      if (question && question.userId === identity.subject) {
        await ctx.db.delete(id)
        deleted++
      }
    }
    return { success: true, deleted }
  },
})
