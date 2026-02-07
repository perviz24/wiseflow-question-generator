import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Generate a temporary upload URL for file storage
 * Returns a signed URL that the client can POST a file to
 * Requires authentication
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if user is authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Get the URL for a stored file by its storage ID
 * Used by API routes to fetch file content from Convex storage
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId)
  },
})

/**
 * Get metadata about a stored file
 */
export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getMetadata(args.storageId)
  },
})
