/**
 * Universal domain types (MyGPT Core).
 * Mirrored in frontend/src/lib/types.ts — keep them in sync until a shared package exists.
 *
 * Vertical-specific shapes (e.g. Property) live under verticals/<pack>/ and are re-exported
 * here only for API typing convenience.
 */

export type ISODate = string;

// ── Tenancy (spec §19, §20) ────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  specialties: string[];
  initials: string;
}

export interface Tenant {
  id: string;
  name: string;
  industry: string;
  verticalPack: string;
  tagline: string;
  locations: string[];
  whatsapp: string;
  email: string;
  website: string;
  currency: string;
  locale: string;
  timezone: string;
  owner: { name: string; role: string; initials: string };
  team: TeamMember[];
  aiEmployeeName: string;
  liveSince: ISODate;
}

// ── Business Brain (spec §3, §5, §22) ──────────────────────────────────────

export type FactStatus =
  | 'owner_verified'
  | 'imported'
  | 'ai_draft'
  | 'pending_confirmation'
  | 'stale'
  | 'rejected';

export type BrainCategory =
  | 'identity'
  | 'offerings'
  | 'pricing'
  | 'hours'
  | 'team'
  | 'policies'
  | 'faqs'
  | 'playbook'
  | 'communication'
  | 'assets';

export interface BrainFact {
  id: string;
  category: BrainCategory;
  label: string;
  value: string;
  status: FactStatus;
  source: string;
  updatedAt: ISODate;
  version: number;
  /** Volatile facts (price, availability) expire — spec §22 */
  volatile?: boolean;
  freshForDays?: number;
  note?: string;
}

// ── Permissions (spec §10) ─────────────────────────────────────────────────

export type PermissionClass = 'autonomous' | 'approval_required' | 'human_only';

export interface PermissionRule {
  actionId: string;
  label: string;
  class: PermissionClass;
  rationale: string;
  /** 'core' or the vertical pack id that contributed this action */
  scope: string;
}

// ── Customer Memory & CRM (spec §6, §12) ───────────────────────────────────

export type Channel = 'whatsapp' | 'web_chat' | 'referral' | 'instagram' | 'phone';

export type MemoryEventKind =
  | 'conversation'
  | 'requirement'
  | 'objection'
  | 'viewing'
  | 'commitment'
  | 'stage_change'
  | 'handoff'
  | 'note';

export interface MemoryEvent {
  id: string;
  at: ISODate;
  kind: MemoryEventKind;
  title: string;
  detail: string;
  /** true when written live during this demo session */
  live?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  channel: Channel;
  customerType: string; // pack-defined: buyer / seller / tenant / landlord …
  firstSeenAt: ISODate;
  lastInteractionAt: ISODate;
  summary: string;
  preferences: string[];
  memory: MemoryEvent[];
}

export type LeadStage =
  | 'new'
  | 'qualifying'
  | 'qualified'
  | 'viewing_scheduled'
  | 'offer'
  | 'nurturing'
  | 'won'
  | 'lost';

export interface Money {
  amount: number;
  currency: string;
}

export interface NextAction {
  label: string;
  dueAt: ISODate;
  owner: 'ai' | 'human';
  assigneeId?: string;
}

export interface Evidence {
  label: string;
  detail: string;
  source?: string;
}

export interface Appointment {
  id: string;
  at: ISODate;
  title: string;
  location: string;
  withTeamMemberId: string;
  status: 'confirmed' | 'pending' | 'completed' | 'missed';
}

export interface HandoffBriefing {
  sentAt: ISODate;
  toTeamMemberId: string;
  channel: string;
  headline: string;
  bullets: string[];
  recommendedNextAction: string;
}

export interface Lead {
  id: string;
  customerId: string;
  intent: string; // pack-defined: buy / rent / sell / let
  stage: LeadStage;
  source: Channel;
  budget: { min?: number; max: number; currency: string };
  locations: string[];
  requirements: string[];
  timeline: string;
  financing: string;
  interestedPropertyIds: string[];
  objections: string[];
  assignedTo: string;
  nextAction: NextAction;
  priority: 'high' | 'medium' | 'low';
  /** Evidence-based priority, never an unexplained score — spec §16 */
  priorityEvidence: Evidence[];
  aiSummary: string;
  humanNotes: string[];
  appointments: Appointment[];
  handoff?: HandoffBriefing;
  createdAt: ISODate;
  updatedAt: ISODate;
  /** Field names changed live during this demo session (UI highlights them) */
  liveChangedFields?: string[];
}

/** Lead joined with its customer — what CRM screens render */
export interface LeadView extends Lead {
  customer: Customer;
}

// ── Activity feed & audit (spec §16, §21) ──────────────────────────────────

export type ActivityType =
  | 'conversation'
  | 'lead_captured'
  | 'lead_qualified'
  | 'match'
  | 'viewing_scheduled'
  | 'follow_up'
  | 'escalation'
  | 'approval_requested'
  | 'approval_decided'
  | 'issue';

export type ApprovalState = 'not_required' | 'pending' | 'approved' | 'rejected' | 'blocked';

export interface AuditRecord {
  trigger: string;
  contextUsed: string[];
  brainSources: string[];
  tool: string;
  args: Record<string, string>;
  result: string;
  approval: ApprovalState;
  finalAction: string;
  error?: string;
  humanOverride?: string;
}

export interface ActivityEvent {
  id: string;
  at: ISODate;
  type: ActivityType;
  title: string;
  description: string;
  channel?: Channel;
  customerId?: string;
  leadId?: string;
  permissionClass: PermissionClass;
  evidence: Evidence[];
  audit: AuditRecord;
  live?: boolean;
}

// ── Approvals (spec §10, §13) ──────────────────────────────────────────────

export interface ApprovalDiff {
  field: string;
  before: string;
  after: string;
}

export interface Approval {
  id: string;
  createdAt: ISODate;
  actionId: string;
  permissionClass: PermissionClass;
  title: string;
  summary: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'human_only';
  diff: ApprovalDiff[];
  evidence: Evidence[];
  impact: string;
  preview?: {
    kind: 'website' | 'listing' | 'message' | 'document';
    title: string;
    lines: string[];
  };
  decidedAt?: ISODate;
  decidedBy?: string;
  decisionNote?: string;
}

// ── Overview / Daily brief (spec §16) ──────────────────────────────────────

export interface Overview {
  tenant: Tenant;
  stats: {
    conversationsToday: number;
    leadsCaptured7d: number;
    viewingsBooked7d: number;
    escalationsOpen: number;
    approvalsPending: number;
    avgFirstResponseSec: number;
  };
  brainReadiness: { ready: number; total: number };
}
