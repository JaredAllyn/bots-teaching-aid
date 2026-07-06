# Bots Teaching Aid

A simple, form-based web app that helps Botswana primary school teachers (Standard 1–7)
quickly generate lesson plans or single classroom activities using the Claude API. Teachers
fill in a short form (subject, grade, topic, resources on hand, optional reference notes/image)
and get a ready-to-use plan they can read on screen or download as a PDF.

No login is required — the app uses one shared, server-side Anthropic API key and a simple
daily request cap to keep costs predictable.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Anthropic API (`@anthropic-ai/sdk`), called only from a server-side API route
- Client-side PDF export via `jspdf` + `html2canvas`

## Prerequisites

- [Node.js](https://nodejs.org/) 18.18+ (Node 20 LTS recommended) and npm
- An Anthropic API key: https://console.anthropic.com/

This repository was created without a local Node.js install, so `node_modules` has not been
generated yet. Once Node.js is installed, run the steps below.

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set your Anthropic API key. Copy the example env file and fill in your real key:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local`:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

   `.env.local` is gitignored and is only read on the server — the key is never sent to the
   browser.

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

4. Build for production (optional, to sanity-check before deploying):

   ```bash
   npm run build
   npm start
   ```

## Deploying to Vercel

1. Push this repository to GitHub (or another Git provider Vercel supports).
2. In the [Vercel dashboard](https://vercel.com/), click **Add New → Project** and import the
   repository. Vercel will auto-detect the Next.js framework — no custom build settings needed.
3. Before the first deploy (or any time after, under **Project → Settings → Environment
   Variables**), add:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key
   - **Environments:** Production, Preview, and Development (as needed)
4. Deploy. Every subsequent push to your connected branch will redeploy automatically.

## Cost safeguard: daily request cap

Since the app has no login and shares one API key, it caps the number of lesson plans it will
generate per day. This is intentionally simple: an in-memory counter in
[`src/lib/rateLimiter.ts`](src/lib/rateLimiter.ts) that resets at UTC midnight.

To change the daily limit, edit the constant in
[`src/lib/constants.ts`](src/lib/constants.ts):

```ts
export const MAX_DAILY_REQUESTS = 100;
```

Other safeguards configurable in the same file:

- `MAX_TEXT_LENGTH` — max characters allowed in any free-text field (default 2000)
- `MAX_IMAGES` — max reference images per request (default 2)
- `MAX_IMAGE_SIZE_MB` — max size per uploaded image (default 5MB)

**Note on the in-memory counter:** because Vercel serverless functions can run as multiple
independent instances, this counter is per-instance — under heavy concurrent traffic the true
daily total could exceed `MAX_DAILY_REQUESTS` slightly, and it resets on cold starts/redeploys.
For a low-traffic internal tool this is a reasonable, zero-dependency tradeoff. If you need a
strict, globally-consistent cap, swap the counter in `rateLimiter.ts` for a small
[Vercel KV](https://vercel.com/docs/storage/vercel-kv) or Upstash Redis-backed counter.

## Project structure

```
src/
  app/
    page.tsx              # Main single-page wizard (form + result view)
    layout.tsx
    globals.css
    api/generate/route.ts  # Server-side API route that calls Claude
  components/
    LessonForm.tsx          # The input form
    ResultView.tsx           # Renders the plan + PDF download
  lib/
    constants.ts             # Safeguard constants (edit MAX_DAILY_REQUESTS here)
    rateLimiter.ts            # Daily request counter
    prompt.ts                  # Builds the system/user prompts sent to Claude
  types/
    index.ts                    # Shared option lists and types
```

## Model

The API route calls `claude-sonnet-4-6` (set in `src/lib/constants.ts` as `CLAUDE_MODEL`).
Update that constant if you need to point at a different model.
