-- MyGPT: DRAFT schema (not used by the mock; applied by docker-compose on first Postgres boot).
-- Purpose: make the multi-tenant data model concrete for the next build step. Expect it to be
-- replaced by Prisma migrations. Every tenant-owned table carries tenant_id (spec §20).
-- Pack-specific data (e.g. real-estate properties) lives in pack tables or JSONB `attributes`,
-- never as columns on core tables (spec §27).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  vertical_pack TEXT NOT NULL,              -- 'real-estate', 'dental', …
  currency      CHAR(3) NOT NULL,
  locale        TEXT NOT NULL,
  timezone      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business Brain (§3, §22): versioned facts with status + freshness
CREATE TABLE brain_facts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL REFERENCES tenants(id),
  category       TEXT NOT NULL,
  label          TEXT NOT NULL,
  value          TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('owner_verified','imported','ai_draft','pending_confirmation','stale','rejected')),
  source         TEXT NOT NULL,
  version        INT  NOT NULL DEFAULT 1,
  volatile       BOOLEAN NOT NULL DEFAULT false,
  fresh_for_days INT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON brain_facts (tenant_id, category);

CREATE TABLE brain_fact_versions (
  fact_id    UUID NOT NULL REFERENCES brain_facts(id),
  version    INT  NOT NULL,
  value      TEXT NOT NULL,
  status     TEXT NOT NULL,
  changed_by TEXT NOT NULL,                 -- 'owner:<id>' | 'ai' | 'import:<source>'
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (fact_id, version)
);

-- Permissions (§10)
CREATE TABLE permission_rules (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  action_id TEXT NOT NULL,
  class     TEXT NOT NULL CHECK (class IN ('autonomous','approval_required','human_only')),
  rationale TEXT,
  scope     TEXT NOT NULL DEFAULT 'core',
  PRIMARY KEY (tenant_id, action_id)
);

-- Customer Memory + CRM (§6, §12)
CREATE TABLE customers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           TEXT NOT NULL REFERENCES tenants(id),
  name                TEXT,
  phone_e164          TEXT,
  customer_type       TEXT,
  summary             TEXT,
  first_seen_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_interaction_at TIMESTAMPTZ,
  UNIQUE (tenant_id, phone_e164)
);

CREATE TABLE memory_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  kind        TEXT NOT NULL,
  title       TEXT NOT NULL,
  detail      TEXT,
  at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON memory_events (tenant_id, customer_id, at DESC);

CREATE TABLE leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL REFERENCES tenants(id),
  customer_id  UUID NOT NULL REFERENCES customers(id),
  intent       TEXT,
  stage        TEXT NOT NULL,
  source       TEXT,
  priority     TEXT,
  assigned_to  TEXT,
  next_action  JSONB,
  attributes   JSONB NOT NULL DEFAULT '{}',   -- pack-defined fields (budget, areas, financing…)
  ai_summary   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON leads (tenant_id, stage);

-- Conversations (§7, §11): one table for every channel
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  customer_id UUID REFERENCES customers(id),
  channel     TEXT NOT NULL,                 -- 'whatsapp' | 'web_chat' | …
  direction   TEXT NOT NULL CHECK (direction IN ('in','out')),
  kind        TEXT NOT NULL,                 -- 'text' | 'voice' | …
  body        TEXT,
  transcript  TEXT,
  at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit trail (§21) + approvals (§10)
CREATE TABLE audit_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL REFERENCES tenants(id),
  type             TEXT NOT NULL,
  title            TEXT NOT NULL,
  customer_id      UUID,
  lead_id          UUID,
  permission_class TEXT NOT NULL,
  trigger          TEXT NOT NULL,
  context_used     JSONB NOT NULL DEFAULT '[]',
  brain_sources    JSONB NOT NULL DEFAULT '[]',
  tool             TEXT,
  args             JSONB NOT NULL DEFAULT '{}',   -- redacted/safe args only
  result           TEXT,
  approval         TEXT NOT NULL,
  final_action     TEXT,
  error            TEXT,
  human_override   TEXT,
  evidence         JSONB NOT NULL DEFAULT '[]',
  at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON audit_events (tenant_id, at DESC);

CREATE TABLE approvals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  action_id   TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','human_only')),
  title       TEXT NOT NULL,
  payload     JSONB NOT NULL,                -- prepared action, diff, preview, evidence
  decided_by  TEXT,
  decided_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Real Estate Pack table (lives with the pack, not the core)
CREATE TABLE re_properties (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 TEXT NOT NULL REFERENCES tenants(id),
  ref                       TEXT NOT NULL,
  listing_type              TEXT NOT NULL,
  price                     BIGINT NOT NULL,
  currency                  CHAR(3) NOT NULL,
  availability              TEXT NOT NULL,
  availability_confirmed_at TIMESTAMPTZ NOT NULL,
  attributes                JSONB NOT NULL DEFAULT '{}',
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ref)
);
