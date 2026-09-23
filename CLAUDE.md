# MyGPT Platform — Project Memory

> This file summarises the product specification (kept private) and records how the repo is built.
> Section references like §3 / §7 / §28 point at that spec. When they disagree, the spec wins —
> update this file.

## Current state (read first)

**This repo is a client pitch mock, not V1.** It is step one of a longer build. It demos the
spec §28 "wow" scenario end to end with realistic seeded data for a real-estate business.
The real Brain, agent, WhatsApp, auth and multi-tenant DB are **not** built yet. The mock is
set up so each of those can be added behind an existing seam without restructuring
(see "Hooks for later" below).

- Demo tenant: **Baycrest Realty** (Coral Gables, Miami · USD · `America/New_York` · `en-US`), tenant id `tnt_baycrest`.
  Team: Sarah Mitchell (Managing Broker, approvals), James Carter, Oliver Bennett, Emily Clarke. AI employee: **Ava**.
- Demo hero customer: **Hannah Brooks**, a returning buyer (last contact 12 days before "now").
- All fixture timestamps are **relative to server start** (`ago()` / `ahead()` helpers), so the demo never looks stale.

## Product vision (spec §1, §29)

MyGPT is a **universal AI employee platform** for businesses worldwide, not a chatbot and not a
real-estate product. It works like a persistent staff member: it understands the business,
talks to customers, remembers context, captures and manages leads, performs *authorised*
actions, follows the business's rules and escalates to humans.

**Build the core once. Configure the vertical many times.** Real estate is the first
*reference implementation*, not the company's identity.

## Architecture: MyGPT Core + Vertical Packs (spec §2, §27)

| MyGPT Core (universal, shared) | Vertical Pack (configuration) |
|---|---|
| Business Brain + onboarding, Customer Memory, agent orchestration, workflow engine, tool/action layer, CRM foundation, channel abstraction (WhatsApp/web/…), knowledge & assets, Business Playbook, permissions/approvals, human handoff, audit, evaluation, multi-tenancy, i18n, integrations | Entity schemas, terminology, required fields, qualification logic, workflows, pack-specific tools, policies, knowledge structures |

**Architecture test (§27):** a Dental Pack must reuse the Brain, Memory, Agent, Workflows, Tools,
CRM, Channels, Permissions, Approvals, Audit and Knowledge *unchanged*. If adding a vertical
means editing `backend/src/core/**`, the abstraction is too coupled. Refactor it.

In code: `backend/src/core/` = universal, `backend/src/verticals/<pack>/` = pack config.
Real-estate words (property, viewing, guest suite, HOA, landlord…) must **never** appear in `core/`.

## Business Brain (spec §3, §5, §22)

The Brain is the per-tenant source of truth. **Every** AI turn retrieves relevant Brain facts
before it responds or acts. Brain ≠ Customer Memory (§6): the Brain is how the business works;
Memory is what we know about one customer.

Categories: identity, offerings, pricing, hours, team, policies, FAQs, playbook, communication
style, assets. (The spec also lists: approval policy, workflows, integrations, generated
assets, owner decisions and freshness metadata.)

Every fact has a **status** (`FactStatus` in `backend/src/domain/types.ts`):

| Status | Meaning | UI colour |
|---|---|---|
| `owner_verified` | Owner-provided / verified | emerald |
| `imported` | Imported from an approved source | sky |
| `ai_draft` | AI-generated draft. **Never** shown to customers as fact | violet |
| `pending_confirmation` | Waiting for the owner to confirm | amber |
| `stale` | Expired / past its freshness window | orange |
| `rejected` | Rejected / disabled | zinc |

Facts also carry `source`, `updatedAt`, `version`, and `volatile` + `freshForDays` for things
like price and availability (§22). **The AI must not invent missing facts.** It asks, retrieves
an approved source, or escalates.

The **Business Playbook** (§5) is a first-class part of the Brain: qualification rules,
high-priority definition, follow-up cadence, never-promise list, escalation triggers and
objection handling. It changes only through explicit owner edits or approved updates, never
silently from one conversation.

## Universal agent pipeline (spec §7, §11)

Every channel (WhatsApp, web chat, future ones) feeds **one** pipeline. Channel code handles
transport only.

```
Incoming message → identify business/customer → retrieve Brain + Customer Memory
→ understand intent → retrieve knowledge → determine workflow → check permissions
→ execute tools → update memory/CRM → respond → audit
```

Voice notes go through transcription *first*, then enter the **same** pipeline (§11).
The stages are defined once in `backend/src/core/pipeline.ts` (`PIPELINE_STAGES`). The live
chat demo renders them as a trace.

Workflows (§8) follow `Trigger → Understand → Decide → Action → Record → Follow-up`. They must
be able to call tools, request approval, schedule future actions and resume from saved state.

## Permission model (spec §10)

Every action/tool has exactly one permission class, configurable per business and vertical:

| Class | Behaviour | Examples |
|---|---|---|
| `autonomous` | AI just does it (and audits it) | answer approved FAQs, capture lead, update CRM, schedule viewing in agent's free slots, approved follow-ups |
| `approval_required` | AI prepares it, then waits in the Approval queue | publish website, change a listing price, unusual discount, sensitive marketing |
| `human_only` | AI can't do it. It prepares a briefing and hands off | spend money, sign contracts/offers, legal commitments, delete critical records |

Enforced in one place: `backend/src/core/permissions.ts` → `checkPermission(tenantId, actionId)`.
Rules live in the tenant's Brain (`permissions` fixture), so they're data, not code.

## Reliability rules (spec §24), which are non-negotiable in the real build

Never invent business facts. Never claim an action happened unless the tool completed it.
Never expose another tenant's data. Never bypass permissions. Never silently publish
unapproved assets. When unsure, ask, retrieve or escalate. Prefer the newest approved info
for volatile facts. Audit every important action (§21: trigger, context used, Brain sources,
tool, safe args/result, approval status, final action, errors, human override, timestamp).

## V1 scope (spec §25)

**V1 must include:** onboarding interview · Universal Business Brain · Business Playbook ·
persistent Customer Memory · WhatsApp agent · website chat agent · voice notes · lead
qualification · automatic lightweight CRM · human handoff/escalation · website generation with
owner approval · basic asset generation · permissions/approvals · audit trail · Real Estate
Vertical Pack · property inventory + matching · real-estate buyer/seller/lead workflows.

**Keep out of V1:** full social automation, full ad management, complex meeting bots,
autonomous voice calling, enterprise CRM features, dozens of verticals, anything that
bypasses the universal architecture.

Build order is in spec §26. Brain + tenancy come first, the E2E loop test comes last.

## Repo layout

pnpm workspaces monorepo (same shape as averroesng-hospitality / fansibly):

```
mygpt-platform/
├─ CLAUDE.md                 ← this file
├─ docs/demo-script.md       ← click-through pitch script
├─ docker-compose.yml        ← postgres:16 + redis:7 + backend (OPTIONAL)
├─ backend/                  ← @mygpt/backend: Express + TS + Socket.IO, port 4000
│  ├─ db/migrations/         ← draft Postgres schema (applied by docker only; not used by mock)
│  └─ src/
│     ├─ config/             ← env parsing (USE_MOCK_DATA, ENABLE_REDIS_ADAPTER…)
│     ├─ domain/types.ts     ← universal domain types (mirror: frontend/src/lib/types.ts)
│     ├─ core/               ← UNIVERSAL: pipeline stages, permissions
│     ├─ verticals/          ← pack registry + real-estate pack (entities, workflows, matching)
│     ├─ data/
│     │  ├─ store.ts         ← DataStore interface (the seam for Prisma/Postgres)
│     │  ├─ index.ts         ← picks mock vs postgres by USE_MOCK_DATA
│     │  ├─ mock/            ← in-memory store over fixtures (resettable)
│     │  ├─ postgres/        ← stub. Implement DataStore here later
│     │  └─ fixtures/        ← seeded demo data (TS, typed, relative dates)
│     ├─ services/           ← business logic (routes never touch the store directly)
│     ├─ routes/             ← thin REST handlers, /api/v1/*
│     ├─ realtime/socket.ts  ← Socket.IO, per-tenant rooms, optional Redis adapter
│     └─ middleware/         ← tenant resolution (x-tenant-id), errors
└─ frontend/                 ← @mygpt/frontend: Next.js 14 App Router + Tailwind + shadcn/ui, port 3000
   └─ src/
      ├─ app/page.tsx        ← pitch landing
      ├─ app/onboarding/     ← Brain-building interview
      ├─ app/(console)/      ← brain · live · crm · activity · approvals (shared sidebar)
      ├─ components/ui/      ← shadcn primitives (hand-copied, standard source)
      └─ lib/                ← api client, socket client, types, formatting
```

## Running

```bash
pnpm install
pnpm dev                 # backend :4000 + frontend :3000 in parallel, no Docker needed
pnpm typecheck           # both packages
pnpm build               # both packages
docker compose up -d     # OPTIONAL: postgres :5433, redis :6380, backend :4000 (containerised)
```

`POST /api/v1/demo/reset` (sidebar "Reset demo" button) restores fixtures between rehearsals.

## Data layer & env flags

- Route → service → `getStore()` → `DataStore`. **Handlers never import fixtures or the mock store.**
- Every `DataStore` method takes `tenantId` first. That's the multi-tenancy seam (§20).
- `USE_MOCK_DATA=true` (default): in-memory `MockStore` seeded from `data/fixtures`. Needs no Docker.
- `USE_MOCK_DATA=false`: `PostgresStore` is loaded. It's a stub today and throws `NotImplemented`.
  To go real: add Prisma (or `pg`) in `data/postgres/`, implement `DataStore`, flip the flag.
  Routes and services don't change.
- `ENABLE_REDIS_ADAPTER=true` attaches `@socket.io/redis-adapter` using `REDIS_URL`
  (docker-compose sets this). If Redis is unreachable it logs and falls back to in-memory.
- Realtime events (room `tenant:<id>`): `lead.updated`, `activity.created`,
  `approval.updated`, `demo.reset`. The frontend refetches on them. The live chat page also
  refetches after each effect call, so it works even if the socket is down.

## Screen → spec map (narrate these while clicking through)

| Route | Screen | Spec |
|---|---|---|
| `/` | Pitch landing: Core + Vertical Packs | §1, §2, §27, §29 |
| `/onboarding` | Guided interview builds the Brain → readiness checklist | §4, §5, §14 |
| `/brain` | Brain facts with status tags, freshness, permissions matrix, inventory | §3, §5, §10, §15, §22 |
| `/live` | WhatsApp voice note → pipeline trace → live CRM panel | §6, §7, §11, §15, §28 |
| `/crm` | Leads auto-populated, stage, next action, memory timeline, handoff brief | §6, §12, §15, §16 |
| `/activity` | AI Activity Feed + expandable audit records with evidence | §16, §21 |
| `/approvals` | Approval-required actions (price change, website publish) + human-only | §10, §13 |

## Hooks for later (explicitly NOT built, so don't scope-creep the mock)

| Capability | Where it plugs in |
|---|---|
| Real DB (Postgres/Prisma), multi-tenant isolation (RLS or tenant_id on every row) | `backend/src/data/postgres/` implementing `DataStore`; draft schema in `backend/db/migrations/` |
| Auth + RBAC (owner/agent/admin roles) | `backend/src/middleware/tenant.ts` currently trusts `x-tenant-id` → replace with session/JWT → tenant+role. Frontend: `app/(console)/layout.tsx` guard |
| WhatsApp Cloud API / website chat widget | New `backend/src/channels/<channel>/` adapters: webhook → normalise to `InboundMessage` → `core` pipeline. Transport only, no intelligence |
| Voice transcription (Whisper etc.) | Pipeline stage `receive` (before `identify`), same path as text |
| LLM agent / orchestration | `backend/src/core/pipeline.ts`. Replace the scripted scenario (`data/fixtures/scenario.ts`) with a real stage runner |
| Workflow engine with durable state + scheduled follow-ups | `backend/src/core/workflows/` (new). Redis/BullMQ or a DB-backed queue |
| Tool layer (calendar, email, website publish) | `backend/src/core/tools/` (new). Every tool call goes through `checkPermission` + audit |
| Website generator / asset generation | Tools gated `approval_required`. Approval preview already modelled in `Approval.preview` |
| Evaluation / simulation (§23) | `backend/src/core/evals/` (new). Scenario fixtures are already shaped like replayable test cases |
| Shared types package | Currently duplicated: `backend/src/domain/types.ts` ↔ `frontend/src/lib/types.ts`. Extract to `packages/shared` when the API stabilises |

## Hosting

`docker-compose.prod.yml` (Coolify "Docker Compose" build pack). Only the **frontend** is public; the
browser calls same-origin `/api/v1` and `/socket.io/`, and `frontend/next.config.mjs` rewrites them to
the backend. `BACKEND_INTERNAL_URL` is **baked in at `next build`** (Dockerfile arg, default
`http://backend:4000`). Socket.IO uses polling first, then upgrades, so it works through the proxy.

## Gotchas (learned while scaffolding)

- Docker host ports are offset (**Postgres 5433, Redis 6380**) so they don't collide with fansibly/averroesng on 5432/6379.
- Backend CORS: if `CORS_ORIGIN` is unset it allows any `http://localhost:<port>`, so the frontend can fall back off :3000.
- `backend/Dockerfile` pins **pnpm 9.15** via corepack. Newer pnpm (10+) fails the build with `ERR_PNPM_IGNORED_BUILDS` (esbuild postinstall).
- `pnpm` strict node_modules: augment Express with `declare global { namespace Express { … } }`, not `express-serve-static-core`.
- Don't share `node_modules` between Windows and WSL (native SWC/esbuild binaries differ). Run `pnpm install` on the side you run from.
- The live demo's effects are **not idempotent** (memory and activity append). Replays must go through `POST /demo/reset` (the Restart button does this).

## Conventions

- TypeScript strict in both packages. Run `pnpm typecheck` after changes.
- API responses: `{ data: T }` on success, `{ error: { message, code } }` on failure.
- Money is stored in **major units** (whole dollars) with a `currency`. Format only in the UI via
  `formatMoney()` (i18n, §19). Don't hard-code "$". Rents are `pricePeriod: 'per_month'`, sizes in sq ft.
- Every screen shows its spec sections via `<SpecRef sections={[...]} />` in the page header.
  Keep this when adding screens: it's how the product is narrated.
- Seed data should read as real: plausible names, masked phone numbers (`+1 (305) ••• 7765`),
  relative timestamps. No lorem ipsum, and no "Test User".
- Property photos live in `frontend/public/properties/` (bundled locally, so the pitch works offline).
