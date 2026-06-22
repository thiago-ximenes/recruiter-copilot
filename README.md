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
recruiter → [Guard] → [Router] → sub‑agent → [RAG grounding] → [Verifier] → answer
              │                                                      │
        injection?                                          unsupported claim?
         blocked                                              corrected / refused
```

- **Guard** — treats the recruiter's message as untrusted data; blocks prompt‑injection and
  system‑prompt exfiltration.
- **Router** — classifies intent into a fixed allowlist (fit / technical / factual / contact).
- **Sub‑agents + RAG** — answer grounded on a curated, versioned knowledge base.
- **Verifier** — checks every claim against the KB before it reaches the recruiter.

### Knowledge‑base ingestion funnel
Upload a résumé (PDF) or paste text → the text is extracted → an LLM **refines** it into a clean,
canonical fact base (with an honest‑gaps section) → you review/edit → it's saved as a new **versioned**
active KB. Raw in, polished grounding out.

### Eval harness
A test set (factual / fit / sales / grounding / injection) runs the full pipeline and scores each
case (deterministic for injection, LLM‑judge for the rest), so prompts can be iterated until the
flow is right. Current pass rate: **100%**.

### Admin (everything is data, versioned)
All prompts and the KB live in Postgres, **versioned with full history and rollback**, editable from
the admin UI — no redeploys to tune behaviour.

## Tech stack

- **Next.js 16** (App Router, RSC, Server Actions), **React 19**, **TypeScript**, **Tailwind CSS**
- **Postgres** + **Drizzle ORM** (Docker Compose for local dev)
- **Vercel AI SDK** with a provider‑agnostic LLM layer (currently **DeepSeek**)
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

Helper scripts: `npm run db:seed`, `tsx scripts/llm-smoke.ts` (LLM healthcheck),
`tsx scripts/eval-run.ts` (eval harness).

## Status

Working end‑to‑end: landing, live agent pipeline, KB funnel, versioned prompt admin, eval harness.
Roadmap: lead capture + notifications, OpenTelemetry observability, tests, auth, deploy.

See [`SPEC.md`](./SPEC.md) for the full design.
