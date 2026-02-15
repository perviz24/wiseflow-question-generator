# HANDOFF — TentaGen
Generated: 2026-02-15

## What Was Built (Complete Product)
- Question generation: 18 types in 3 tiers (Core 5, Extended 3, Specialized 10) — working
- File upload: Word, PowerPoint, URL, YouTube, Bunny video — working (PDF disabled)
- Library management: save, filter, bulk delete, tags — working
- Export: Legacy JSON, Utgående JSON, QTI 2.1, QTI 2.2 Inspera, Word, CSV — working
- Auth: Clerk with Convex JWT integration — working
- Admin: launch toggle, user event log, feedback viewer — working
- Notification: email on new user signup via Resend — working
- Bilingual: Swedish/English UI — working
- Onboarding: 6-step tour — working
- Feedback system: in-app button + admin viewer — working
- Security: rate limiting (100/day), DOMPurify, auth on all routes, security headers — working
- Monitoring: Sentry error tracking, Vercel Analytics — working
- SEO: dynamic OG images, meta tags — working

## Current State
- Live URL: https://www.tentagen.se
- Admin: https://www.tentagen.se/admin
- Last commit: 086967a docs: add project CLAUDE.md with operational limits
- Convex prod: strong-rabbit-731 | dev: amicable-setter-320
- Known issues: 3 files exceed 300-line limit (question-generator-form.tsx ~970, library/page.tsx ~980, docs/page.tsx ~689)

## Next Steps (priority order)
1. Privacy Policy page (GDPR — blocks official university adoption)
2. Terms of Service page
3. Cookie consent banner
4. Notification system (plan exists — userEvents table + email + admin log)

## Key Architecture Decisions
- Question types registry (src/lib/question-types.ts) is SINGLE SOURCE OF TRUTH for all 18 types
- WISEflow export naming is confusing: internal 'legacy' = NEW format, 'utgaende' = OLD format
- ADMIN_EMAILS defined in TWO files (convex/siteConfig.ts AND convex/userEvents.ts) — must update BOTH
- Files deleted immediately after extraction (no cron job for cleanup)
- Rate limiting shared pool across all 9 API routes via Upstash Redis

## Environment & Credentials
- All env vars set in Vercel (NEXT_PUBLIC_CONVEX_URL, Clerk keys, Anthropic, Sentry, Upstash)
- Convex dashboard has: RESEND_API_KEY, ASSEMBLYAI_API_KEY
- No missing credentials
