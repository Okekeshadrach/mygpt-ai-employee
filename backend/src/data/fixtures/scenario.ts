/**
 * Spec §28 "wow" scenario: returning buyer sends a WhatsApp voice note.
 *
 * The chat script is fixed, but the property matches come from the real matching function
 * (verticals/real-estate/matching.ts), so the trace shows genuine reasons, gaps and exclusions.
 * Effects (`kind: 'effect'`) are applied server-side by demo.service.ts and update the CRM live.
 */
import type { ChatMessage, Scenario, ScenarioStep } from '../../domain/demo';
import type { MatchResult, PropertyView } from '../../verticals/real-estate/types';
import type { Clock } from './clock';
import { HERO_CUSTOMER_ID, HERO_LEAD_ID } from './crm';

export const SCENARIO_ID = 'returning-buyer-voice-note';

export interface ScenarioContext {
  clock: Clock;
  match: MatchResult;
  properties: PropertyView[];
  viewingSlotLabel: string; // e.g. "Sat, Sep 26"
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n);

export function buildScenario(ctx: ScenarioContext): Scenario {
  const { clock: t, match } = ctx;
  const [m1, m2, m3] = match.matches;
  const shown = [m1, m2, m3].filter(Boolean);
  const excluded = match.excluded[0];

  const history: ChatMessage[] = [
    { id: 'h1', from: 'customer', kind: 'text', text: 'Hi! Do you have any 3 bedroom homes in South Miami? Budget around 1.5 to 1.8 million', at: t.ago({ d: 12, h: 2 }) },
    { id: 'h2', from: 'ai', kind: 'text', text: 'Hi Hannah! Yes, the closest fit right now is a 3-bed townhouse on Sunset Drive (BCR-1009) at $1.78M. Just so you know, the HOA there is $1,450 a month.', at: t.ago({ d: 12, h: 2 }) },
    { id: 'h3', from: 'customer', kind: 'text', text: 'Hmm, that HOA is a lot 😅 Let me talk to my husband. We’re also still waiting on the mortgage.', at: t.ago({ d: 12, h: 1 }) },
    { id: 'h4', from: 'ai', kind: 'text', text: 'Completely understand. I’ll keep an eye out for homes with lower HOA fees. Good luck with the mortgage! 🙏', at: t.ago({ d: 12, h: 1 }) },
  ];

  const steps: ScenarioStep[] = [
    // ── Turn 1: voice note ────────────────────────────────────────────────
    {
      id: 's1', kind: 'message', delayMs: 400, pauseBefore: 'Customer sends a voice note',
      message: {
        id: 'm1', from: 'customer', kind: 'voice', durationSec: 41,
        transcript: 'Hi, it’s Hannah again. So my husband and I finally sat down, and we can go up to about two million now. We really want to be closer to the kids’ school in Coral Gables, and we need a guest suite for our nanny. Is there anything we could see this weekend?',
      },
    },
    {
      id: 's2', kind: 'pipeline', delayMs: 900, stage: 'receive', title: 'Voice note received → transcribed',
      lines: ['WhatsApp · audio/ogg · 0:41', 'Transcribed (en-US) in 1.8s · confidence 0.97', 'Enters the same pipeline as text (§11)'],
    },
    {
      id: 's3', kind: 'pipeline', delayMs: 1100, stage: 'identify', title: 'Returning customer recognized',
      lines: ['Business: Baycrest Realty (by WhatsApp business number)', 'Customer: Hannah Brooks (phone match)', 'Last contact 12 days ago · lead stage: nurturing'],
      tone: 'success',
    },
    {
      id: 's4', kind: 'pipeline', delayMs: 1300, stage: 'retrieve', title: 'Brain + Customer Memory loaded',
      lines: [
        'Memory: budget $1.5M–$1.8M · 3-bed · South Miami / Coral Gables',
        'Memory: objection, “$1,450/mo HOA is a lot”',
        'Memory: waiting on mortgage decision',
        'Brain: viewing hours Sat 10 AM–4 PM · James covers Coral Gables',
        'Brain: never promise price reductions · photo ID required at viewings',
      ],
      evidence: [{ label: 'Tenant-scoped', detail: 'Only tnt_baycrest facts retrieved' }],
    },
    {
      id: 's5', kind: 'pipeline', delayMs: 1300, stage: 'intent', title: 'Intent + changes vs. memory',
      lines: ['Intent: buy · wants viewing this weekend', 'Budget $1.8M → $2.0M (changed)', 'New requirement: guest suite (for nanny)', 'Area: near school in Coral Gables → Coral Gables, South Miami, Coconut Grove, Pinecrest'],
    },
    {
      id: 's6', kind: 'pipeline', delayMs: 1400, stage: 'knowledge', title: `Inventory search: ${match.scanned} listings scanned`,
      lines: [
        ...shown.map((m, i) => `${i + 1}. ${m.property.ref} ${m.property.title}, ${m.property.estate ?? m.property.area}: ${usd(m.property.price)}${m.gaps.length ? ` (${m.gaps.join('; ')})` : ''}`),
        ...(excluded ? [`✕ ${excluded.property.ref} excluded: ${excluded.reason}`] : []),
      ],
      evidence: shown.map((m) => ({ label: m.property.ref, detail: m.reasons.join(' · ') })),
      tone: excluded ? 'warn' : 'default',
    },
    {
      id: 's7', kind: 'pipeline', delayMs: 1100, stage: 'workflow', title: 'Workflow: Qualified lead → recommend properties',
      lines: ['Real Estate Pack · wf.recommend → wf.offer_viewing', 'Missing required field: financing status', '→ Ask one qualifying question before booking'],
    },
    { id: 's8', kind: 'effect', delayMs: 500, effect: 'lead.update_requirements', label: 'CRM: budget, guest suite, areas and matched properties saved' },
    {
      id: 's9', kind: 'pipeline', delayMs: 300, stage: 'update', title: 'Lead + memory updated',
      lines: ['Budget → $2.0M · +guest suite · stage → qualified', `Interested: ${shown.map((m) => m.property.ref).join(', ')}`],
      tone: 'success',
    },
    { id: 's10', kind: 'typing', delayMs: 300, from: 'ai', durationMs: 1400 },
    {
      id: 's11', kind: 'message', delayMs: 0,
      message: { id: 'm2', from: 'ai', kind: 'text', text: `Welcome back, Hannah! 👋 Great news on the budget. With up to $2M and a guest suite near Coral Gables, these ${shown.length} stand out:` },
    },
    { id: 's12', kind: 'message', delayMs: 700, message: { id: 'm3', from: 'ai', kind: 'property_cards', propertyIds: shown.map((m) => m.property.id) } },
    { id: 's13', kind: 'typing', delayMs: 500, from: 'ai', durationMs: 1200 },
    {
      id: 's14', kind: 'message', delayMs: 0,
      message: {
        id: 'm4', from: 'ai', kind: 'text',
        text: 'The Sunset Drive townhouse has a $600/mo HOA, less than half the one that put you off last time 😊\n\nOne quick question before I line up viewings: will you be buying with the mortgage you mentioned, or cash?',
      },
    },
    { id: 's15', kind: 'pipeline', delayMs: 300, stage: 'respond', title: 'Replied on WhatsApp', lines: ['Tone: warm, concise (Brain)', 'Referenced past objection from memory', 'Stale listing not mentioned'] },

    // ── Turn 2: financing + viewing request ───────────────────────────────
    {
      id: 's16', kind: 'message', delayMs: 600, pauseBefore: 'Customer replies',
      message: { id: 'm5', from: 'customer', kind: 'text', text: 'Mortgage 🙏 the pre-approval came through last week for $1.4M, we’ll cover the rest ourselves. Can we see the first two on Saturday?' },
    },
    {
      id: 's17', kind: 'pipeline', delayMs: 1000, stage: 'intent', title: 'Financing confirmed · viewing requested',
      lines: ['Financing: mortgage pre-approved $1.4M + $600K down payment', `Viewing request: ${m1?.property.ref ?? ''} + ${m2?.property.ref ?? ''} on Saturday`],
    },
    { id: 's18', kind: 'effect', delayMs: 300, effect: 'lead.financing_confirmed', label: 'CRM: financing confirmed' },
    {
      id: 's19', kind: 'pipeline', delayMs: 1000, stage: 'workflow', title: 'Workflow: Viewing requested → schedule',
      lines: ['Real Estate Pack · wf.schedule', 'Agent for area: James Carter', 'Viewing hours Sat 10 AM–4 PM · 45-min slots'],
    },
    {
      id: 's20', kind: 'pipeline', delayMs: 900, stage: 'permissions', title: 'calendar.book → autonomous ✓',
      lines: ['Within viewing hours ✓', 'Agent under daily capacity (1/4) ✓', 'No approval needed (owner policy)'],
      tone: 'success',
    },
    {
      id: 's21', kind: 'pipeline', delayMs: 1000, stage: 'tools', title: 'calendar.availability(James, Saturday)',
      lines: [`Free: 11:00 AM · 12:00 PM · 1:30 PM · 2:30 PM (${ctx.viewingSlotLabel})`],
    },
    { id: 's22', kind: 'typing', delayMs: 300, from: 'ai', durationMs: 1300 },
    {
      id: 's23', kind: 'message', delayMs: 0,
      message: {
        id: 'm6', from: 'ai', kind: 'text',
        text: `Congratulations on the pre-approval! 🎉 James, who covers Coral Gables, is free on Saturday. I can do either:\n\n• 11:00 AM ${m1?.property.estate ?? ''} → 12:00 PM ${m2?.property.estate ?? ''}\n• 1:30 PM ${m1?.property.estate ?? ''} → 2:30 PM ${m2?.property.estate ?? ''}\n\nWhich works better?`,
      },
    },

    // ── Turn 3: booking + escalation ──────────────────────────────────────
    { id: 's24', kind: 'message', delayMs: 600, pauseBefore: 'Customer picks a slot', message: { id: 'm7', from: 'customer', kind: 'text', text: '11 works. Thank you!' } },
    {
      id: 's25', kind: 'pipeline', delayMs: 1000, stage: 'tools', title: 'calendar.book × 2 → confirmed',
      lines: [`${m1?.property.ref ?? ''} · Sat 11:00 AM · James ✓`, `${m2?.property.ref ?? ''} · Sat 12:00 PM · James ✓`, 'Both bookings returned success before replying (§24)'],
      tone: 'success',
    },
    { id: 's26', kind: 'effect', delayMs: 300, effect: 'viewing.book', label: 'CRM: 2 viewings booked · stage → viewing scheduled' },
    {
      id: 's27', kind: 'pipeline', delayMs: 1000, stage: 'workflow', title: 'Playbook rule fired: HIGH INTENT',
      lines: ['✓ Budget confirmed ($2.0M)', '✓ Financing confirmed (mortgage pre-approval)', '✓ Viewing requested & booked', '→ Alert area agent within 5 minutes'],
      evidence: [{ label: 'Rule', detail: 'Budget + financing confirmed + viewing requested', source: 'Brain · Playbook: High-intent definition' }],
      tone: 'warn',
    },
    { id: 's28', kind: 'effect', delayMs: 300, effect: 'handoff.escalate', label: 'Handoff briefing sent to James' },
    { id: 's29', kind: 'typing', delayMs: 300, from: 'ai', durationMs: 1300 },
    {
      id: 's30', kind: 'message', delayMs: 0,
      message: {
        id: 'm8', from: 'ai', kind: 'text',
        text: `All booked ✅\n\n📍 Sat 11:00 AM: ${m1?.property.title ?? ''}, ${m1?.property.estate ?? ''} (${m1?.property.ref ?? ''})\n📍 Sat 12:00 PM: ${m2?.property.title ?? ''}, ${m2?.property.estate ?? ''} (${m2?.property.ref ?? ''})\n\nJames Carter will meet you there (+1 (305) ••• 0142). Please bring a photo ID, since the gated community requires it. I’ll send you a reminder on Friday evening. See you Saturday! 🏡`,
      },
    },
    {
      id: 's31', kind: 'pipeline', delayMs: 700, stage: 'audit', title: '6 audit records written',
      lines: ['voice.transcribe · memory.recognize · inventory.match', 'crm.update_lead · calendar.book ×2 · handoff.brief_agent', 'Each with trigger, sources, args, result, approval status'],
      tone: 'success',
    },
  ];

  return {
    id: SCENARIO_ID,
    title: 'Returning buyer sends a WhatsApp voice note',
    spec: '§28',
    customerId: HERO_CUSTOMER_ID,
    leadId: HERO_LEAD_ID,
    channel: 'whatsapp',
    businessPhone: '+1 (305) ••• 4410',
    history,
    historyLabel: '12 days ago',
    steps,
    properties: ctx.properties,
  };
}
