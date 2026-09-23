/**
 * Mirror of backend/src/domain/types.ts + domain/demo.ts + real-estate types.
 * Keep in sync until a shared package exists (see CLAUDE.md → Hooks for later).
 */

export type ISODate = string;

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

export type FactStatus = 'owner_verified' | 'imported' | 'ai_draft' | 'pending_confirmation' | 'stale' | 'rejected';
export type BrainCategory =
  | 'identity' | 'offerings' | 'pricing' | 'hours' | 'team' | 'policies' | 'faqs' | 'playbook' | 'communication' | 'assets';

export interface BrainFact {
  id: string;
  category: BrainCategory;
  label: string;
  value: string;
  status: FactStatus;
  source: string;
  updatedAt: ISODate;
  version: number;
  volatile?: boolean;
  freshForDays?: number;
  note?: string;
}

export type PermissionClass = 'autonomous' | 'approval_required' | 'human_only';

export interface PermissionRule {
  actionId: string;
  label: string;
  class: PermissionClass;
  rationale: string;
  scope: string;
}

export type Channel = 'whatsapp' | 'web_chat' | 'referral' | 'instagram' | 'phone';
export type MemoryEventKind =
  | 'conversation' | 'requirement' | 'objection' | 'viewing' | 'commitment' | 'stage_change' | 'handoff' | 'note';

export interface MemoryEvent {
  id: string;
  at: ISODate;
  kind: MemoryEventKind;
  title: string;
  detail: string;
  live?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  channel: Channel;
  customerType: string;
  firstSeenAt: ISODate;
  lastInteractionAt: ISODate;
  summary: string;
  preferences: string[];
  memory: MemoryEvent[];
}

export type LeadStage = 'new' | 'qualifying' | 'qualified' | 'viewing_scheduled' | 'offer' | 'nurturing' | 'won' | 'lost';

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
  intent: string;
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
  nextAction: { label: string; dueAt: ISODate; owner: 'ai' | 'human'; assigneeId?: string };
  priority: 'high' | 'medium' | 'low';
  priorityEvidence: Evidence[];
  aiSummary: string;
  humanNotes: string[];
  appointments: Appointment[];
  handoff?: HandoffBriefing;
  createdAt: ISODate;
  updatedAt: ISODate;
  liveChangedFields?: string[];
}

export interface LeadView extends Lead {
  customer: Customer;
}

export type ActivityType =
  | 'conversation' | 'lead_captured' | 'lead_qualified' | 'match' | 'viewing_scheduled'
  | 'follow_up' | 'escalation' | 'approval_requested' | 'approval_decided' | 'issue';

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

export interface Approval {
  id: string;
  createdAt: ISODate;
  actionId: string;
  permissionClass: PermissionClass;
  title: string;
  summary: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'human_only';
  diff: { field: string; before: string; after: string }[];
  evidence: Evidence[];
  impact: string;
  preview?: { kind: 'website' | 'listing' | 'message' | 'document'; title: string; lines: string[] };
  decidedAt?: ISODate;
  decidedBy?: string;
  decisionNote?: string;
}

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

// ── Real Estate Pack ──
export interface PropertyView {
  id: string;
  ref: string;
  title: string;
  listingType: 'sale' | 'rent';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sizeSqft: number;
  hasGuestSuite: boolean;
  furnished: boolean;
  amenities: string[];
  area: string;
  estate?: string;
  city: string;
  price: number;
  currency: string;
  pricePeriod?: 'per_month';
  hoaPerMonth?: number;
  availability: 'available' | 'under_offer' | 'let' | 'sold';
  availabilityConfirmedAt: ISODate;
  photo: string;
  description: string;
  agentId: string;
  owner: string;
  source: string;
  updatedAt: ISODate;
  freshness: 'fresh' | 'stale';
  daysSinceConfirmed: number;
}

export interface VerticalPack {
  id: string;
  name: string;
  status: 'live' | 'planned';
  summary: string;
  terminology: Record<string, string>;
  customerTypes: string[];
  entities: { name: string; description: string }[];
  requiredLeadFields: string[];
  qualificationRules: { id: string; label: string; condition: string; effect: string }[];
  workflows: { id: string; trigger: string; outcome: string; tools: string[] }[];
  tools: { id: string; label: string; defaultPermission: PermissionClass }[];
}

export interface ReadinessItem {
  id: string;
  label: string;
  status: 'ready' | 'needs_attention' | 'missing';
  detail: string;
  spec: string;
}

export interface BrainResponse {
  tenant: Tenant;
  pack?: VerticalPack;
  facts: BrainFact[];
  statusCounts: Partial<Record<FactStatus, number>>;
  permissions: PermissionRule[];
  readiness: ReadinessItem[];
}

// ── Demo ──
export interface OnboardingTurn {
  id: string;
  role: 'ai' | 'owner';
  text: string;
  facts?: { category: BrainCategory; label: string; value: string; status: FactStatus }[];
  capabilities?: string[];
  permissions?: { label: string; class: PermissionClass }[];
}

export interface OnboardingScript {
  ownerName: string;
  businessName: string;
  turns: OnboardingTurn[];
  readiness: ReadinessItem[];
}

export type PipelineStageId =
  | 'receive' | 'identify' | 'retrieve' | 'intent' | 'knowledge' | 'workflow'
  | 'permissions' | 'tools' | 'update' | 'respond' | 'audit';

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  hint: string;
}

export type ChatMessage =
  | { id: string; from: 'customer' | 'ai'; kind: 'text'; text: string; at?: ISODate }
  | { id: string; from: 'customer'; kind: 'voice'; durationSec: number; transcript: string; at?: ISODate }
  | { id: string; from: 'ai'; kind: 'property_cards'; propertyIds: string[]; at?: ISODate };

export type EffectId = 'lead.update_requirements' | 'lead.financing_confirmed' | 'viewing.book' | 'handoff.escalate';

export type ScenarioStep =
  | { id: string; kind: 'message'; delayMs: number; message: ChatMessage; pauseBefore?: string }
  | { id: string; kind: 'typing'; delayMs: number; from: 'ai' | 'customer'; durationMs: number }
  | {
      id: string;
      kind: 'pipeline';
      delayMs: number;
      stage: PipelineStageId;
      title: string;
      lines: string[];
      evidence?: Evidence[];
      tone?: 'default' | 'warn' | 'success';
    }
  | { id: string; kind: 'effect'; delayMs: number; effect: EffectId; label: string };

export interface Scenario {
  id: string;
  title: string;
  spec: string;
  customerId: string;
  leadId: string;
  channel: 'whatsapp';
  businessPhone: string;
  history: ChatMessage[];
  historyLabel: string;
  steps: ScenarioStep[];
  properties: PropertyView[];
}
