// Admin utility — email-based admin check
// No Clerk dashboard config needed, just check email against list

export const ADMIN_EMAILS = ["perviz20@yahoo.com"] as const

/** Check if an email address belongs to an admin */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase() as typeof ADMIN_EMAILS[number])
}
