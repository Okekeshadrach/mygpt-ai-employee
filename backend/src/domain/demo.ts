/**
 * Demo-only shapes: the scripted onboarding interview and the §28 live scenario.
 * HOOK: when the real agent exists, the scenario becomes a replayable evaluation case (spec §23)
 * rather than a script.
 */
import type { BrainCategory, Evidence, FactStatus, ISODate } from './types';
import type { PipelineStageId } from '../core/pipeline';
import type { PropertyView } from '../verticals/real-estate/types';

// ── Onboarding (spec §4) ───────────────────────────────────────────────────

export interface OnboardingFactDraft {
  category: BrainCategory;
  label: string;
  value: string;
  status: FactStatus;
}

export interface OnboardingTurn {
  id: string;
  role: 'ai' | 'owner';
  text: string;
  facts?: OnboardingFactDraft[];
  capabilities?: string[];
  permissions?: { label: string; class: 'autonomous' | 'approval_required' | 'human_only' }[];
}

export interface ReadinessItem {
  id: string;
  label: string;
  status: 'ready' | 'needs_attention' | 'missing';
  detail: string;
  spec: string;
}

export interface OnboardingScript {
  ownerName: string;
  businessName: string;
  turns: OnboardingTurn[];
  readiness: ReadinessItem[];
}

// ── Live scenario (spec §28) ───────────────────────────────────────────────

export type ChatMessage =
  | { id: string; from: 'customer' | 'ai'; kind: 'text'; text: string; at?: ISODate }
  | { id: string; from: 'customer'; kind: 'voice'; durationSec: number; transcript: string; at?: ISODate }
  | { id: string; from: 'ai'; kind: 'property_cards'; propertyIds: string[]; at?: ISODate };

export type EffectId =
  | 'lead.update_requirements'
  | 'lead.financing_confirmed'
  | 'viewing.book'
  | 'handoff.escalate';

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
