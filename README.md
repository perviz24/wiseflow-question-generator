# TentaGen

AI-powered exam question generator for Swedish educational institutions.

**Live URL:** https://www.tentagen.se
**GitHub:** https://github.com/perviz24/wiseflow-question-generator

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui (New York, Zinc) |
| Icons | Lucide React |
| Database | Convex (real-time, serverless) |
| Authentication | Clerk (JWT integration with Convex) |
| AI | Vercel AI SDK + Anthropic Claude |
| Rate Limiting | Upstash Redis (serverless) |
| Email | Resend (feedback notifications) |
| Video Transcription | Bunny.net Stream + AssemblyAI |
| Web Scraping | Firecrawl (URL content extraction) |
| File Parsing | Mammoth (Word/DOCX), OfficeParser (PPT) |
| Export | docx (Word generation), JSZip, FileSaver |
| Hosting | Vercel |
| Domain | tentagen.se (via external registrar) |

---

## Platform Connections Map

All the external services this app depends on, with their dashboard links and what they do.

### 1. Vercel (Hosting & Deployment)
- **Dashboard:** https://vercel.com/pervizs-projects-d6728d10/wiseflow-question-generator
- **What it does:** Hosts the Next.js app, handles SSL, CDN, serverless functions
- **Domain:** www.tentagen.se (primary), tentagen.se (redirects to www)
- **Auto-deploy:** Connected to GitHub repo, deploys on push to `main`
- **Environment variables:** 12 production secrets stored here (see table below)

### 2. Convex (Database)
- **Dashboard:** https://dashboard.convex.dev
- **Dev deployment:** amicable-setter-320 (for local development)
- **Production deployment:** strong-rabbit-731 (US East, Virginia)
- **What it does:** Real-time database for questions, user profiles, transcription jobs, feedback
- **Tables:** questions, userProfiles, transcriptionJobs, feedback
- **File storage:** Used for uploaded documents (Word, PPT files)
- **Environment variables (Convex-side):**
  - `CLERK_JWT_ISSUER_DOMAIN` — Clerk auth integration
  - `RESEND_API_KEY` — Email notifications on new feedback

### 3. Clerk (Authentication)
- **Dashboard:** https://dashboard.clerk.com
- **What it does:** User sign-up, sign-in, session management
- **JWT Template:** Named "convex" — required for Convex auth integration
- **Production domain:** clerk.tentagen.se (CNAME to Clerk)
- **Dev domain:** casual-donkey-41.clerk.accounts.dev
- **Important:** Both domains listed in `convex/auth.config.ts`

### 4. Anthropic (AI)
- **Dashboard:** https://console.anthropic.com
- **What it does:** Powers question generation via Claude API
- **Used through:** Vercel AI SDK (`@ai-sdk/anthropic`)
- **API routes that use it:** `/api/generate`, `/api/generate-more`, `/api/regenerate-alternatives`

### 5. Upstash (Rate Limiting)
- **Dashboard:** https://console.upstash.com
- **Database:** flying-sailfish-56730 (Frankfurt, eu-central-1)
- **What it does:** Limits users to 100 AI question generations per day
- **Sliding window:** 24 hours per user
- **Graceful degradation:** If Upstash is down, rate limiting is bypassed (app still works)

### 6. Resend (Email)
- **Dashboard:** https://resend.com
- **What it does:** Sends email notification to perviz20@yahoo.com when users submit feedback
- **Current tier:** Free (100 emails/month, single recipient only)
- **Sender:** onboarding@resend.dev (Resend test domain)
- **Limitation:** Free tier only allows sending to account owner email

### 7. Bunny.net (Video Processing)
- **Dashboard:** https://dash.bunny.net
- **What it does:** Hosts uploaded videos temporarily for transcription pipeline
- **Library ID:** 597381
- **Flow:** User uploads video URL -> Bunny.net fetches & stores -> AssemblyAI transcribes -> text returned

### 8. AssemblyAI (Speech-to-Text)
- **Dashboard:** https://www.assemblyai.com/app
- **What it does:** Transcribes video/audio content to text for question generation
- **Used in:** `/api/extract-video-transcript`, `/api/check-transcription`

### 9. Firecrawl (Web Scraping)
- **Dashboard:** https://www.firecrawl.dev/app
- **What it does:** Extracts clean text content from URLs for question generation
- **Used in:** `/api/extract-url`

---

## Environment Variables

### Vercel (Production) — 12 variables

Set via Vercel Dashboard > Project > Settings > Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex | Production Convex URL (strong-rabbit-731) |
| `CONVEX_DEPLOYMENT` | Convex | Production deployment identifier |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Clerk public key (safe for browser) |
| `CLERK_SECRET_KEY` | Clerk | Clerk server-side secret |
| `ANTHROPIC_API_KEY` | Anthropic | Claude AI API key |
| `UPSTASH_REDIS_REST_URL` | Upstash | Redis database URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Redis auth token |
| `BUNNY_STREAM_API_KEY` | Bunny.net | Stream API access |
| `BUNNY_ACCOUNT_API_KEY` | Bunny.net | Account-level API access |
| `BUNNY_VIDEO_LIBRARY_ID` | Bunny.net | Video library identifier |
| `ASSEMBLYAI_API_KEY` | AssemblyAI | Speech-to-text API key |
| `FIRECRAWL_API_KEY` | Firecrawl | Web scraping API key |

### Convex (Production: strong-rabbit-731) — 2 variables

Set via `npx convex env set KEY value --prod` or Convex Dashboard > Settings > Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk | `https://casual-donkey-41.clerk.accounts.dev` |
| `RESEND_API_KEY` | Resend | Email API key for feedback notifications |

### Local Development (.env.local) — not committed to git

| Variable | Description |
|----------|-------------|
| `CONVEX_DEPLOYMENT` | `dev:amicable-setter-320` |
| `NEXT_PUBLIC_CONVEX_URL` | Dev Convex URL |
| `BUNNY_STREAM_API_KEY` | Same as production |
| `BUNNY_ACCOUNT_API_KEY` | Same as production |
| `BUNNY_VIDEO_LIBRARY_ID` | Same as production |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Dev site URL |
| `UPSTASH_REDIS_REST_URL` | Same as production |
| `UPSTASH_REDIS_REST_TOKEN` | Same as production |

---

## App Pages & Features

| Page | URL | Auth Required | Description |
|------|-----|---------------|-------------|
| Home | `/` | No (public) | Landing page + question generator |
| Documentation | `/docs` | No (public) | User manual |
| Library | `/library` | Yes | Saved question sets |
| Settings | `/settings` | Yes | User profile, tutor initials, language, question type preferences |
| Sign In | `/sign-in` | No | Clerk sign-in page |
| Sign Up | `/sign-up` | No | Clerk sign-up page |

### Question Types (18 active)

**Core (always on):** MCQ, Essay, True/False, Short Answer, Fill-in-the-Blank
**Extended (on by default):** Multiple Response, Matching, Ordering
**Specialized (enable in settings):** Choice Matrix, Cloze Text, Cloze Dropdown, Order List, Token Highlight, Cloze Association, Image Cloze Association, Plain Text, Formula Essay, Chemistry Essay

### Export Formats
- Word (.docx) — with answer key
- QTI 2.1 (.zip) — for LMS import (Inspera, Canvas, etc.)
- Learnosity JSON (.json) — for Learnosity platform

---

## API Routes (all rate-limited)

| Route | Purpose | External APIs Used |
|-------|---------|-------------------|
| `/api/generate` | Generate questions from AI | Anthropic |
| `/api/generate-more` | Add more questions to existing set | Anthropic |
| `/api/regenerate-alternatives` | Regenerate a single question | Anthropic |
| `/api/extract-url` | Extract text from URL | Firecrawl |
| `/api/extract-content` | Extract text from uploaded file | (local parsing) |
| `/api/extract-from-storage` | Extract from Convex file storage | (local parsing) |
| `/api/extract-youtube-transcript` | Get YouTube video transcript | youtube-transcript lib |
| `/api/extract-video-transcript` | Start video transcription job | Bunny.net + AssemblyAI |
| `/api/check-transcription` | Poll transcription job status | Bunny.net + AssemblyAI |

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/perviz24/wiseflow-question-generator.git
cd wiseflow-question-generator

# 2. Install dependencies
npm install

# 3. Set up .env.local (copy values from Vercel dashboard or ask project owner)
# See "Local Development" env vars table above

# 4. Start Convex dev server (connects to dev deployment)
npx convex dev

# 5. Start Next.js dev server (in another terminal)
npm run dev

# 6. Open http://localhost:3000
```

---

## Deployment

```bash
# Build check
npm run build

# Deploy to production (always use --force to skip build cache)
vercel --prod --force --yes

# Deploy Convex functions to production
npx convex deploy
```

**Important:** After changing any `NEXT_PUBLIC_*` env var in Vercel, you MUST redeploy with `--force` because Vercel caches these at build time.

---

## Production Launch Checklist

Use this step-by-step when going from beta to full production launch.

### Domain & Email
- [ ] **Create tentagen.se email address** (e.g., info@tentagen.se or noreply@tentagen.se)
  - Where: Your domain registrar (where you bought tentagen.se)
  - Or use a service like Zoho Mail (free for 1 user) or Google Workspace
- [ ] **Verify tentagen.se domain in Resend** (resend.com/domains)
  - Add DNS records (SPF, DKIM, DMARC) as instructed by Resend
  - After verification: change email sender from `onboarding@resend.dev` to `noreply@tentagen.se`
  - After verification: add `parviz.mammadzada@oru.se` as second recipient in `convex/feedback.ts`
- [ ] **Upgrade Resend plan** if expecting >100 feedback emails/month (free tier limit)

### Legal & Compliance
- [ ] **Create Terms and Conditions page** (`/terms`)
  - Include: acceptable use, data handling, AI-generated content disclaimer
  - Swedish language (primary), English optional
- [ ] **Create Privacy Policy page** (`/privacy`)
  - Include: what data is collected (Clerk auth, generated questions, feedback)
  - Where data is stored (Convex US-East, Upstash Frankfurt, Clerk)
  - GDPR compliance (user can request data deletion)
- [ ] **Add cookie consent banner** (if using analytics later)
- [ ] **Add links to Terms and Privacy in footer**

### Security & Auth
- [ ] **Review Clerk auth settings** — disable unused sign-in methods
- [ ] **Set up Clerk production instance** (if still using development instance)
  - Clerk Dashboard > Production > Follow setup wizard
  - Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel
  - Update `convex/auth.config.ts` with new production domain
  - Redeploy both Convex (`npx convex deploy`) and Vercel (`vercel --prod --force`)
- [ ] **Adjust rate limits** if needed (currently 100/day/user in `src/lib/ratelimit.ts`)

### Costs & Monitoring
- [ ] **Monitor API costs** — Anthropic, AssemblyAI, Firecrawl all have usage-based pricing
- [ ] **Set up billing alerts** on Anthropic, Upstash, Bunny.net, AssemblyAI
- [ ] **Convex dashboard** — check for failed functions, slow queries
- [ ] **Vercel analytics** — enable in Vercel dashboard (free tier available)
- [ ] **Upstash dashboard** — monitor rate limit hits and Redis usage

### Content & Polish
- [ ] **Remove beta banner** from footer (in layout/footer component)
- [ ] **Update footer text** — remove "Distribution for broader use requires permission"
- [ ] **Add proper meta tags** for SEO (Open Graph, Twitter cards)
- [ ] **Test all features** on mobile (375px width)
- [ ] **Test dark mode** on all pages

---

## Monthly Cost Estimates (at moderate usage)

| Service | Free Tier | Paid Tier (if needed) |
|---------|-----------|----------------------|
| Vercel | Free (hobby) | Pro: $20/month |
| Convex | Free (up to limits) | Pro: $25/month |
| Clerk | Free (up to 10,000 MAU) | Pro: $25/month |
| Anthropic | Pay-per-use | ~$5-50/month depending on usage |
| Upstash | Free (10,000 requests/day) | Pay-as-you-go: ~$0.20/10K requests |
| Resend | Free (100 emails/month) | Pro: $20/month |
| Bunny.net | Pay-per-use | ~$1-5/month |
| AssemblyAI | Pay-per-use | ~$0.37/hour of audio |
| Firecrawl | Free (500 credits/month) | Growth: $19/month |

---

## Known Limitations

1. **Resend free tier:** Can only send feedback emails to perviz20@yahoo.com. Fix: verify tentagen.se domain in Resend
2. **Convex region:** US East (Virginia) only. No European region available yet
3. **PDF parsing:** Disabled on Vercel due to serverless compatibility issues. Word and PPT work fine
4. **Video transcription:** Depends on Bunny.net + AssemblyAI pipeline. Can be slow for long videos
5. **Rate limit:** 100 questions per day per user. Adjustable in `src/lib/ratelimit.ts`

---

## File Structure

```
src/
  app/
    api/              # 9 API routes (generation, extraction, transcription)
    docs/             # Documentation page
    library/          # Saved question sets
    settings/         # User preferences
    layout.tsx        # Root layout with Clerk + Convex providers
    page.tsx          # Home page with question generator
  components/
    ui/               # shadcn/ui components
    ...               # Feature components
  lib/
    ratelimit.ts      # Upstash rate limiting utility
    sanitize.ts       # XSS protection (DOMPurify wrapper)
    env.ts            # Environment variable validation
convex/
  schema.ts           # Database schema (4 tables)
  questions.ts        # Question CRUD operations
  profiles.ts         # User profile management
  feedback.ts         # Feedback + email notifications
  fileStorage.ts      # File upload/download
  transcriptions.ts   # Video transcription jobs
  auth.config.ts      # Clerk JWT integration config
```

---

## Troubleshooting

### "Not authenticated" errors
1. Check Clerk JWT template is named exactly "convex" in Clerk Dashboard > JWT Templates
2. Verify `convex/auth.config.ts` has correct Clerk domain
3. Deploy auth config to BOTH dev and prod: `npx convex dev --once` AND `npx convex deploy`
4. Sign out and sign back in (clears cached JWT)

### Environment variables not working after update
Vercel caches `NEXT_PUBLIC_*` at build time. After changing, redeploy with:
```bash
vercel --prod --force --yes
```

### Rate limiting not working
Check Upstash env vars are set in Vercel:
```bash
vercel env ls
```
Both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` must be present.

### Feedback emails not arriving
- Check Convex Dashboard > Logs for `sendFeedbackNotification` action
- Verify `RESEND_API_KEY` is set in Convex production: Convex Dashboard > Settings > Environment Variables
- Free tier: can only send to account owner email (perviz20@yahoo.com)
