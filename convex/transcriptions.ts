import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Create a new transcription job
export const createTranscriptionJob = mutation({
  args: {
    userId: v.string(),
    videoUrl: v.string(),
    videoGuid: v.string(),
    language: v.union(v.literal("sv"), v.literal("en")),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("transcriptionJobs", {
      userId: args.userId,
      videoUrl: args.videoUrl,
      videoGuid: args.videoGuid,
      language: args.language,
      status: "processing",
      createdAt: Date.now(),
    })

    return jobId
  },
})

// Update transcription job when webhook is received
export const updateTranscriptionJob = mutation({
  args: {
    videoGuid: v.string(),
    status: v.union(v.literal("completed"), v.literal("failed")),
    transcript: v.optional(v.string()),
    characterCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the job by videoGuid
    const job = await ctx.db
      .query("transcriptionJobs")
      .withIndex("by_video_guid", (q) => q.eq("videoGuid", args.videoGuid))
      .first()

    if (!job) {
      throw new Error(`Transcription job not found for videoGuid: ${args.videoGuid}`)
    }

    // Update the job
    await ctx.db.patch(job._id, {
      status: args.status,
      transcript: args.transcript,
      characterCount: args.characterCount,
      errorMessage: args.errorMessage,
      completedAt: Date.now(),
    })

    return job._id
  },
})

// Get transcription job by videoGuid
export const getTranscriptionByVideoGuid = query({
  args: {
    videoGuid: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("transcriptionJobs")
      .withIndex("by_video_guid", (q) => q.eq("videoGuid", args.videoGuid))
      .first()

    return job
  },
})

// Get all transcription jobs for a user
export const getUserTranscriptions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("transcriptionJobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect()

    return jobs
  },
})

// Get pending transcription jobs (for polling)
export const getPendingTranscriptions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("transcriptionJobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "processing"))
      .collect()

    return jobs
  },
})
