# kyyreport.com Commercialization Checklist

This project should be commercialized first as a controlled public demo plus access-code-gated AI workbench, then move into a lightweight account-based product with per-user saved projects.

## Positioning

KYY Report is an AI academic and technical report workbench.

Core promise:

- Turn requirements, results, and reference materials into editable structured reports.
- Keep users in control through section editing, linked evidence, and PDF preview.
- Support report drafting workflows rather than one-shot black-box writing.

Best first audience:

- Engineering students writing lab reports
- Graduate students preparing course reports or research drafts
- Technical users who need structured English reports from messy evidence files

## Public Demo Readiness

- [x] Confirm `https://kyyreport.com` loads the current frontend.
- [x] Confirm the unlock endpoint points to the live backend.
- [x] Confirm the OpenAI proxy endpoint points to the live backend.
- [x] Confirm `GET /api/health` on the backend reports `accessCodeConfigured: true` and `openaiConfigured: true`.
- [x] Confirm full AI features require the access code.
- [x] Confirm no frontend build or public repo contains `VITE_OPENAI_API_KEY`.
- [x] Confirm `.env.local`, `.env.server`, and other secret-bearing files are not tracked.
- [x] Confirm rate limiting is enabled on the backend.

Verified on 2026-07-07:

- `https://kyyreport.com` returns the Cloudflare-hosted frontend.
- The deployed frontend bundle points AI calls to `https://latex-pro-web-production.up.railway.app`.
- `https://latex-pro-web-production.up.railway.app/api/health` returns `accessCodeConfigured: true` and `openaiConfigured: true`.
- CORS preflight from `https://kyyreport.com` to the Railway unlock endpoint succeeds.
- The current demo access code unlocks the live backend successfully.
- `https://kyyreport.com/api/health` returns the frontend SPA fallback, not backend health JSON. This is acceptable because the deployed frontend uses explicit Railway API endpoints instead of relative `/api/*` URLs.
- Local `.env.local` no longer contains `VITE_OPENAI_API_KEY`; OpenAI credentials remain server-only in `.env.server` / Railway environment variables.

## Environment Boundary

Frontend should only use:

- `VITE_OPENAI_PROXY_URL`
- `VITE_UNLOCK_ENDPOINT`
- `VITE_OPENAI_MODEL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Backend should own:

- `OPENAI_API_KEY`
- `DEMO_ACCESS_CODE`
- `ALLOWED_ORIGIN`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`
- `RATE_LIMIT_MAX_REQUESTS`

For `kyyreport.com`, set `ALLOWED_ORIGIN` to the production origin. Include local dev origins separately only when testing locally.

## First Paid Test

Use manual access before building payments:

- Public demo: visible UI and sample workspace.
- Full access: unlocked with a private access code.
- Payment: handled manually at first.
- Feedback: collected directly from each early user.

Suggested early offers:

- One-week trial access
- One-month beta access
- Paid report-building assistance for users who need help preparing inputs

## Product Work That Most Improves Conversion

- [x] Add a sample workspace that demonstrates a complete report workflow.
- [x] Strengthen reference-style handling so reference files guide tone and structure, not factual claims.
- [x] Add export affordances for LaTeX source and compiled PDF.
- [x] Add optional Supabase login and per-user cloud project save/load scaffolding.
- [ ] Improve backend / unlock / AI error messages so users know what to do next.
- [x] Remove visible mojibake or broken symbols from the public UI.
- [x] Finish English copy for user-facing demo surfaces.

## Launch Copy

Short description:

KYY Report helps students and technical writers turn requirements, experimental results, and reference materials into structured, editable LaTeX reports with AI assistance and PDF preview.

One-line CTA:

Upload your report materials, generate a structured draft, then revise section by section.

## Later

Avoid these until account users show repeated usage or willingness to pay:

- Subscription billing
- Team collaboration
- Complex admin dashboard
