# TentaGen — Project Reference for Claude Code

## Overview
AI exam question generator for Swedish educational institutions.
Live: https://www.tentagen.se | Admin: https://www.tentagen.se/admin

## Tech Stack
- Next.js 16 + TypeScript + React 19 + Tailwind CSS + shadcn/ui
- Convex (database + real-time) — prod: `strong-rabbit-731` | dev: `amicable-setter-320`
- Clerk (auth) — JWT template named "convex", domain in `convex/auth.config.ts`
- Vercel AI SDK + Anthropic Claude (question generation)
- AssemblyAI (video transcription via Bunny.net upload)
- Upstash Redis (rate limiting)
- Resend (email notifications)
- Sentry (error tracking)
- Vercel (hosting + deployment)

## Deployments
- **Vercel:** `vercel --prod --force --yes` (always use --force to skip cache)
- **Convex prod:** `npx convex deploy --yes` (needed when changing convex/ files)
- **Convex dev:** `npx convex dev --once` (for local development)
- Both must be deployed when changing Convex functions or schema

---

## Operational Limits & Tunables

### Rate Limiting (src/lib/ratelimit.ts)
All API routes share ONE rate limit pool per user:
- **Limit:** 100 requests per 24-hour sliding window per userId
- **Provider:** Upstash Redis (`@upstash/ratelimit`)
- **Prefix:** `tentagen:ratelimit`
- **Graceful degradation:** If UPSTASH env vars are missing, all requests are allowed
- **Error messages:** Bilingual (sv/en), includes reset time

**Protected routes (all 9 API routes):**
| Route | Purpose |
|-------|---------|
| `/api/generate` | AI question generation |
| `/api/generate-more` | Generate additional questions |
| `/api/regenerate-alternatives` | Regenerate with different params |
| `/api/extract-video-transcript` | AssemblyAI video transcription |
| `/api/extract-content` | File upload text extraction |
| `/api/extract-url` | URL web scraping |
| `/api/extract-youtube-transcript` | YouTube caption extraction |
| `/api/extract-from-storage` | Convex storage file extraction |
| `/api/check-transcription` | Poll transcription status (no rate limit — lightweight) |

**To increase the limit:** Change `100` to desired number in `src/lib/ratelimit.ts` line 26:
```typescript
limiter: Ratelimit.slidingWindow(100, "1 d"),  // ← change 100 here
```
Also update the error message on line 58-59 which says "100 frågor per dag".

### Database Query Limits (Convex .take() caps)
Prevents unbounded reads as data grows. All use `.take(N)` instead of `.collect()`.

| Query | File | Limit | Reasoning |
|-------|------|-------|-----------|
| `getUserQuestions` | `convex/questions.ts` | 500 | Power users may save many questions |
| `getQuestionsBySubject` | `convex/questions.ts` | 500 | Same pool, filtered by subject |
| `listFeedback` | `convex/feedback.ts` | 100 | No user submits 100+ feedback entries |
| `listUserEvents` | `convex/userEvents.ts` | 500 | Admin-only, covers 500 unique users |
| `getUserTranscriptions` | `convex/transcriptions.ts` | 100 | Transcription history per user |
| `getPendingTranscriptions` | `convex/transcriptions.ts` | 20 | Active concurrent transcriptions |

**To increase a limit:** Change the number in `.take(N)` in the corresponding file.
**If a user reports missing data:** Check if they've hit the .take() cap — increase it.
**When to add full pagination:** When any single user regularly exceeds the .take() limit
(e.g., if teachers save 500+ questions, add cursor-based pagination to getUserQuestions).

### Content Extraction Limits
| Setting | Value | Location |
|---------|-------|----------|
| Max extracted text | 50,000 characters | All extract-* routes (`.slice(0, 50000)`) |
| Max file upload duration | 60 seconds | `export const maxDuration = 60` in each route |
| PDF support | Disabled | Returns 400 with message to use Word/PPTX instead |

### File Storage Cleanup
- Files uploaded to Convex storage are **deleted immediately after text extraction**
- Deletion happens client-side in `src/components/content-upload.tsx`
- Uses `convex/fileStorage.ts` → `deleteFile` mutation
- No scheduled cleanup job — cleanup is synchronous with extraction flow

---

## Security Configuration

### Auth (Clerk + Convex)
- `clerkMiddleware()` in `src/middleware.ts` — handles session tokens
- Every API route manually checks `const { userId } = await auth()` — clerkMiddleware alone is NOT enough
- Every Convex mutation/query checks `ctx.auth.getUserIdentity()`
- Admin-only functions check email against `ADMIN_EMAILS` array in each file

### Security Headers (next.config.ts)
Applied to all routes (`/(.*)`):
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` — HSTS with 2-year max-age
- `Permissions-Policy` — disables camera, microphone, geolocation

### Admin Access
- Controlled by `ADMIN_EMAILS` array — defined separately in:
  - `convex/siteConfig.ts` (launch toggle, admin check)
  - `convex/userEvents.ts` (user event log)
- To add a new admin: update the array in BOTH files
- Admin page: `/admin` — shows launch toggle + new user log

---

## Environment Variables

### Required in Vercel (production)
| Variable | Service | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex | MUST be production URL (strong-rabbit-731) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Public key |
| `CLERK_SECRET_KEY` | Clerk | Secret key |
| `CONVEX_DEPLOYMENT` | Convex | Format: `prod:strong-rabbit-731` |
| `ANTHROPIC_API_KEY` | Anthropic | For AI generation |
| `SENTRY_DSN` | Sentry | Error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry | Source map uploads |

### Required in Convex dashboard (production)
| Variable | Service | Notes |
|----------|---------|-------|
| `RESEND_API_KEY` | Resend | For email notifications |
| `ASSEMBLYAI_API_KEY` | AssemblyAI | For video transcription |

### Required in Vercel (rate limiting — optional)
| Variable | Service | Notes |
|----------|---------|-------|
| `UPSTASH_REDIS_REST_URL` | Upstash | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Rate limiting |

If Upstash vars are missing, rate limiting is disabled (all requests allowed).

---

## Key Architecture Decisions

### Performance
- `getIsAdmin` query is NOT in global header — extracted to lazy `AdminMenuItem` component
  that only runs inside `<UserButton.MenuItems>` (avoids Convex round-trip on every page for all users)
- Clerk auth chain is the #1 page load bottleneck (~1490ms) — inherent to Clerk architecture
- `prefetch={false}` on navigation links to reduce unnecessary preloads

### Notification System
- `convex/userEvents.ts` tracks first-time logins via `trackFirstLogin` mutation
- `src/components/auth-tracker.tsx` calls this on every auth load (uses useRef to prevent duplicates)
- Email sent via Resend to admin on new user signup (skips admin self-login)
- Admin page shows user log table at `/admin`

### File Extraction Flow
1. User uploads file → stored in Convex storage (generates storageId)
2. Client calls `/api/extract-from-storage` with storageId
3. Server fetches file from Convex storage URL, extracts text (mammoth for .docx, officeparser for .pptx)
4. Client receives extracted text, then calls `deleteFile` to clean up storage
5. Text is sent to AI generation endpoint

### i18n
- Bilingual: Swedish (sv) + English (en)
- Translation system: `src/lib/language-context.tsx` + `src/lib/translations.ts`
- Language toggle in header, persisted in localStorage

---

## Common Debugging Scenarios

### "User can't see their saved questions"
1. Check if they've hit the 500 `.take()` limit in `getUserQuestions`
2. Check Convex dashboard → `questions` table → filter by userId
3. If over 500: increase limit or add pagination

### "Rate limit hit too quickly"
1. All 9 routes share ONE 100/day pool — uploads + generations + extractions all count
2. Check Upstash dashboard for actual usage per user
3. To increase: change `100` in `src/lib/ratelimit.ts` line 26

### "New user notification not received"
1. Check if user is in `ADMIN_EMAILS` — admin self-logins are skipped
2. Check Convex dashboard → `userEvents` table for the row
3. Check Convex dashboard → Function logs for `sendNewUserNotification` errors
4. Verify `RESEND_API_KEY` is set in Convex environment variables

### "Auth not working after deploy"
1. Verify Clerk JWT template named "convex" exists in Clerk dashboard
2. Verify `convex/auth.config.ts` has correct domain + `applicationID: "convex"`
3. Deploy auth config to BOTH dev and prod: `npx convex dev --once` AND `npx convex deploy`
4. Sign out and sign back in (JWT tokens are cached)

### "Vercel deploy shows old code"
1. Always use `vercel --prod --force --yes` — the `--force` flag is critical
2. Vercel caches NEXT_PUBLIC_* vars at build time — new values need `--force` rebuild
3. Never rely on Vercel dashboard "Redeploy" button — it uses cached builds
