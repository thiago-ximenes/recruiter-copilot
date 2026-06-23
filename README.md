# Recruiter Copilot

An AI agent that recruiters can talk to in order to evaluate a candidate — **grounded only in
verified facts**, with the candidate's real engineering differentiators on display *while you use it*:
agent routing, anti‑hallucination, prompt‑injection defense, and an eval‑driven workflow.

> Built as a portfolio piece by [Thiago Ximenes](https://www.linkedin.com/in/thiago-ximenes).
> The app *is* the interview: a recruiter pastes a job description or asks questions, and sees the
> AI engineering working in real time.

## What it does

- **Fit analysis** — paste a job description, get a grounded score with evidence and honest, role‑relevant gaps.
- **Technical Q&A** — assertive answers about the candidate's experience, grounded in real facts.
- **Honest by design** — it never makes things up. If something isn't in the profile, it says so.
- **Bilingual** — answers in the recruiter's language (EN / pt‑BR).

## Architecture

```
recruiter → [Guard] → [Router] → sub‑agent → [pgvector RAG] → [Verifier] → answer
              │                                                     │            │
        injection?                                         unsupported?   capture lead / gap
         blocked                                           corrected      → notify Thiago
```

- **Guard** — treats the recruiter's message as untrusted data; blocks prompt‑injection and
  system‑prompt exfiltration.
- **Router** — classifies intent into a fixed allowlist (fit / technical / factual / contact).
- **Sub‑agents + RAG** — answer grounded on a curated, versioned knowledge base. Retrieval is real
  **pgvector** similarity search over embedded chunks (falls back to the full KB if embeddings are off).
- **Verifier** — checks every claim against the full KB before it reaches the recruiter.
- **Lead & gap capture** — opportunistically extracts a recruiter's contact (and notifies Thiago via
  Telegram), and records questions the agent couldn't answer so the profile can be improved.
- **Observability** — each stage is an OpenTelemetry span (exported via OTLP when configured).

### Knowledge‑base ingestion funnel
Upload a résumé (PDF) or paste text → the text is extracted → an LLM **refines** it into a clean,
canonical fact base (with an honest‑gaps section) → you review/edit → it's saved as a new **versioned**
active KB. Raw in, polished grounding out.

### Eval harness
A test set (factual / fit / sales / grounding / injection) runs the full pipeline and scores each
case (deterministic for injection, LLM‑judge for the rest), so prompts can be iterated until the
flow is right.

### Tests
- **Unit** (Vitest): JSON parsing, KB chunking, admin auth (HMAC), Telegram notify, embeddings gating.
- **E2E** (Playwright): landing + language toggle + chat trace chips (API mocked, no LLM calls).

### Admin (everything is data, versioned)
All prompts and the KB live in Postgres, **versioned with full history and rollback**, editable from
the admin UI — no redeploys to tune behaviour. The admin is protected by a signed‑cookie session.

## Tech stack

- **Next.js 16** (App Router, RSC, Server Actions), **React 19**, **TypeScript**, **Tailwind CSS**
- **Postgres + pgvector** + **Drizzle ORM** (Docker Compose for local dev)
- **Vercel AI SDK** with a provider‑agnostic LLM layer (**DeepSeek**) and embeddings layer (**Gemini**)
- **OpenTelemetry** (`@vercel/otel`) for tracing; **Vitest** + **Playwright** for tests
- **unpdf** for résumé parsing

## Running locally

```bash
cp .env.example .env        # set DATABASE_URL, LLM_PROVIDER, DEEPSEEK_API_KEY
docker compose up -d db     # Postgres
npm install
npm run db:migrate          # schema
npm run db:seed             # prompts + KB
npm run dev                 # http://localhost:3000  (admin at /admin)
```

Helper scripts: `npm run db:backfill` (vectorize the active KB), `npm run embed:smoke`
(embeddings healthcheck), `tsx scripts/llm-smoke.ts` (LLM), `tsx scripts/eval-run.ts` (eval),
`npm test` (unit), `npm run test:e2e` (e2e).

## Deploy (Vercel + Neon)

1. **Database** — connect a Postgres store in the Vercel project → **Storage** (Neon or Supabase,
   both ship `pgvector`). The integration injects the connection vars (`DATABASE_URL` or
   `POSTGRES_URL`/`POSTGRES_URL_NON_POOLING`) — the app reads whichever is present.
2. **Env vars** (Project → Settings → Environment Variables):
   `LLM_PROVIDER`, `DEEPSEEK_API_KEY`, `EMBEDDING_PROVIDER`, `GEMINI_API_KEY`,
   `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and optionally `TELEGRAM_BOT_TOKEN` /
   `TELEGRAM_CHAT_ID` and `OTEL_EXPORTER_OTLP_ENDPOINT` / `OTEL_EXPORTER_OTLP_HEADERS`.
3. **Auto‑migration on deploy** — the build command (`npm run vercel-build`, set in `vercel.json`)
   runs migrations + seed + KB vectorization before `next build`, using the build‑time DB env.
   All three steps are idempotent, so every deploy is safe.
4. Pushes to `main` auto‑deploy (the repo is connected to the Vercel project).

## Status

Live end‑to‑end: landing, agent pipeline with pgvector RAG, KB funnel, versioned prompt admin
(auth‑protected), lead/gap capture with Telegram notify, OpenTelemetry tracing, eval harness, and
unit + e2e tests.

See [`SPEC.md`](./SPEC.md) for the full design.
