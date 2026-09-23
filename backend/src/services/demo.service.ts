/**
 * Drives the §28 live scenario. The chat script is fixed; the side effects are real calls
 * into the same services the production pipeline will use (CRM, memory, activity/audit,
 * permissions), so the CRM and feed update genuinely, not visually.
 *
 * HOOK: when the real orchestrator exists (core/pipeline.ts), these effects become the
 * outputs of tool calls and this service shrinks to "replay an evaluation scenario".
 */
import type { EffectId, Scenario } from '../domain/demo';
import { getStore } from '../data';
import { createClock } from '../data/fixtures/clock';
import { HERO_CUSTOMER_ID, HERO_LEAD_ID, TENANT_TIMEZONE } from '../data/fixtures';
import { buildScenario, SCENARIO_ID } from '../data/fixtures/scenario';
import { checkPermission } from '../core/permissions';
import { matchProperties } from '../verticals/real-estate/matching';
import type { BuyerRequirements, MatchResult } from '../verticals/real-estate/types';
import { publish } from '../realtime/socket';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { listProperties } from './brain.service';
import { remember, updateLeadLive } from './crm.service';
import { recordActivity } from './activity.service';

const M = 1_000_000;

/** What the voice note tells us, merged with what memory already knew. */
const HERO_REQUIREMENTS: BuyerRequirements = {
  listingType: 'sale',
  budgetMax: 2 * M,
  locations: ['Coral Gables', 'South Miami', 'Coconut Grove', 'Pinecrest'],
  minBedrooms: 3,
  needsGuestSuite: true,
  stretchTolerance: 0.05,
};

async function heroMatch(tenantId: string): Promise<MatchResult> {
  return matchProperties(HERO_REQUIREMENTS, await listProperties(tenantId));
}

function saturdaySlots() {
  const first = createClock().nextWeekday(6, 11, 0, TENANT_TIMEZONE);
  const second = new Date(new Date(first).getTime() + 60 * 60 * 1000).toISOString();
  return { first, second };
}

export async function getScenario(tenantId: string, scenarioId: string): Promise<Scenario> {
  if (scenarioId !== SCENARIO_ID) throw new NotFoundError(`Scenario ${scenarioId} not found`);
  const match = await heroMatch(tenantId);
  const properties = await listProperties(tenantId);
  const tenant = await getStore().getTenant(tenantId);
  const label = new Date(saturdaySlots().first).toLocaleDateString(tenant?.locale ?? 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: tenant?.timezone ?? TENANT_TIMEZONE,
  });
  return buildScenario({ clock: createClock(), match, properties, viewingSlotLabel: label });
}

export async function applyEffect(tenantId: string, effect: EffectId) {
  switch (effect) {
    case 'lead.update_requirements': {
      const match = await heroMatch(tenantId);
      const top = match.matches.slice(0, 3);
      await remember(tenantId, HERO_CUSTOMER_ID, {
        kind: 'conversation', title: 'Returned after 12 days (voice note)',
        detail: 'Recognized by phone; continued from saved context instead of starting over.',
      });
      await remember(tenantId, HERO_CUSTOMER_ID, {
        kind: 'requirement', title: 'Budget raised to $2.0M · guest suite needed',
        detail: 'Wants to be near the children’s school in Coral Gables; guest suite for their nanny.',
      });
      const lead = await updateLeadLive(tenantId, HERO_LEAD_ID, {
        budget: { min: 1.8 * M, max: 2 * M, currency: 'USD' },
        locations: ['Coral Gables', 'South Miami', 'Coconut Grove', 'Pinecrest'],
        requirements: ['3+ bedrooms', 'Guest suite (for nanny)', 'Near school in Coral Gables', 'Low HOA'],
        interestedPropertyIds: top.map((m) => m.property.id),
        stage: 'qualified',
        nextAction: { label: 'Confirm financing, then offer viewings', dueAt: new Date().toISOString(), owner: 'ai' },
        aiSummary: 'Returning buyer, budget now $2.0M, needs a guest suite near the Coral Gables school. Matched 3 fresh listings; one stale listing withheld.',
      });
      await recordActivity(tenantId, {
        type: 'match', channel: 'whatsapp', customerId: HERO_CUSTOMER_ID, leadId: HERO_LEAD_ID, live: true,
        title: `Returning customer matched: Hannah Brooks → ${top.length} properties`,
        description: 'Voice note transcribed, customer recognized, requirements updated from memory + new message.',
        permissionClass: 'autonomous',
        evidence: [
          ...top.map((m) => ({ label: m.property.ref, detail: m.reasons.slice(0, 3).join(' · '), source: 'Inventory (fresh)' })),
          ...match.excluded.map((e) => ({ label: `${e.property.ref} withheld`, detail: e.reason, source: 'Freshness rule (14 days)' })),
        ],
        audit: {
          trigger: 'WhatsApp voice note (0:41), transcribed',
          contextUsed: ['Memory: budget $1.5M–$1.8M, HOA objection, mortgage pending', 'Lead stage: nurturing'],
          brainSources: ['Pricing: Listing prices (volatile, 14d)', 'Hours: Viewing hours', 'Team: James Carter'],
          tool: 'inventory.match',
          args: { budgetMax: '2000000', areas: HERO_REQUIREMENTS.locations.join(', '), minBeds: '3', guestSuite: 'true' },
          result: `${match.scanned} scanned · ${match.matches.length} matched · ${match.excluded.length} stale excluded`,
          approval: 'not_required',
          finalAction: `Lead updated; ${top.length} listings sent`,
        },
      });
      return lead;
    }

    case 'lead.financing_confirmed': {
      await remember(tenantId, HERO_CUSTOMER_ID, {
        kind: 'commitment', title: 'Mortgage pre-approved: $1.4M',
        detail: 'Will cover the remaining ~$600K as a down payment.',
      });
      const lead = await updateLeadLive(tenantId, HERO_LEAD_ID, {
        financing: 'Mortgage pre-approved $1.4M + ~$600K down payment',
        timeline: 'Ready to buy now',
        objections: ['HOA fees (addressed: BCR-1037 at $600/mo)'],
      });
      await recordActivity(tenantId, {
        type: 'lead_qualified', channel: 'whatsapp', customerId: HERO_CUSTOMER_ID, leadId: HERO_LEAD_ID, live: true,
        title: 'Financing confirmed: Hannah Brooks', description: 'All 6 qualification fields now known.',
        permissionClass: 'autonomous',
        evidence: [{ label: 'Customer said', detail: '“The pre-approval came through last week for $1.4M”', source: 'WhatsApp message' }],
        audit: {
          trigger: 'Customer reply', contextUsed: ['Open question: financing'], brainSources: ['Playbook: Qualification fields'],
          tool: 'crm.update_lead', args: { financing: 'mortgage_preapproved', amount: '1400000' }, result: 'Updated',
          approval: 'not_required', finalAction: 'Financing recorded',
        },
      });
      return lead;
    }

    case 'viewing.book': {
      const perm = await checkPermission(tenantId, 'calendar.book');
      if (!perm.allowedToExecute) throw new ForbiddenError(`calendar.book is ${perm.class}`);
      const match = await heroMatch(tenantId);
      const [p1, p2] = match.matches.map((m) => m.property);
      if (!p1 || !p2) throw new BadRequestError('Not enough matching properties to book');
      const { first, second } = saturdaySlots();
      await remember(tenantId, HERO_CUSTOMER_ID, {
        kind: 'viewing', title: `2 viewings booked: ${p1.ref}, ${p2.ref}`,
        detail: 'Saturday 11:00 AM and 12:00 PM with James Carter. Photo ID reminder sent.',
      });
      const lead = await updateLeadLive(tenantId, HERO_LEAD_ID, {
        stage: 'viewing_scheduled',
        appointments: [
          { id: 'apt_live_1', at: first, title: `Viewing: ${p1.ref} ${p1.title}`, location: `${p1.estate}, ${p1.area}`, withTeamMemberId: 'tm_james', status: 'confirmed' },
          { id: 'apt_live_2', at: second, title: `Viewing: ${p2.ref} ${p2.title}`, location: `${p2.estate}, ${p2.area}`, withTeamMemberId: 'tm_james', status: 'confirmed' },
        ],
        nextAction: { label: 'Send Friday-evening reminder; James hosts viewings Sat 11 AM & 12 PM', dueAt: first, owner: 'human', assigneeId: 'tm_james' },
      });
      await recordActivity(tenantId, {
        type: 'viewing_scheduled', channel: 'whatsapp', customerId: HERO_CUSTOMER_ID, leadId: HERO_LEAD_ID, live: true,
        title: 'Viewings booked: Saturday 11 AM & 12 PM', description: `${p1.ref} and ${p2.ref} with James Carter.`,
        permissionClass: perm.class,
        evidence: [
          { label: 'Permission', detail: `calendar.book is ${perm.class}`, source: 'Brain: Permissions' },
          { label: 'Within viewing hours', detail: 'Sat 10 AM–4 PM', source: 'Brain: Viewing hours' },
          { label: 'Agent capacity', detail: 'James 2/4 viewings on Saturday' },
        ],
        audit: {
          trigger: 'Customer chose 11:00 AM slot', contextUsed: ['Matched listings', 'Agent calendar'], brainSources: ['Hours: Viewing hours', 'Team: James Carter'],
          tool: 'calendar.book', args: { agent: 'James Carter', slots: '11:00 AM, 12:00 PM', listings: `${p1.ref}, ${p2.ref}` },
          result: '2 bookings confirmed', approval: 'not_required', finalAction: 'Confirmed to customer after tool success',
        },
      });
      return lead;
    }

    case 'handoff.escalate': {
      const lead = await updateLeadLive(tenantId, HERO_LEAD_ID, {
        priority: 'high',
        priorityEvidence: [
          { label: 'Budget confirmed', detail: '$2.0M (raised from $1.8M)', source: 'Voice note' },
          { label: 'Financing confirmed', detail: 'Mortgage pre-approval $1.4M', source: 'WhatsApp message' },
          { label: 'Viewing booked', detail: '2 viewings on Saturday', source: 'Calendar' },
          { label: 'Strong matches', detail: '3 fresh listings in area with guest suite', source: 'Inventory' },
        ],
        handoff: {
          sentAt: new Date().toISOString(),
          toTeamMemberId: 'tm_james',
          channel: 'WhatsApp + CRM',
          headline: 'High-intent buyer: Hannah Brooks · viewings Sat 11 AM & 12 PM',
          bullets: [
            'Returning buyer (first contact 26 days ago); budget now $2.0M',
            'Mortgage pre-approved $1.4M; ~$600K down payment',
            'Needs a guest suite for their nanny; wants to be near the kids’ school in Coral Gables',
            'Past objection: high HOA. BCR-1037 ($600/mo) addresses it',
            'Booked: BCR-1042 (11 AM) → BCR-1037 (12 PM)',
          ],
          recommendedNextAction: 'Bring the lender’s property checklist. Keep BCR-1051 (garden & pool, slightly over budget) as a backup.',
        },
      });
      await remember(tenantId, HERO_CUSTOMER_ID, {
        kind: 'handoff', title: 'Escalated to James (high intent)',
        detail: 'Briefing with requirements, matches, objections and recommended next action.',
      });
      await recordActivity(tenantId, {
        type: 'escalation', channel: 'whatsapp', customerId: HERO_CUSTOMER_ID, leadId: HERO_LEAD_ID, live: true,
        title: 'High-intent lead escalated to James', description: 'Playbook rule matched. Concise briefing delivered with recommended next action.',
        permissionClass: 'autonomous',
        evidence: [
          { label: 'Budget confirmed', detail: '$2.0M' },
          { label: 'Financing confirmed', detail: 'Mortgage pre-approval $1.4M' },
          { label: 'Viewing requested', detail: 'Booked Sat 11 AM & 12 PM' },
        ],
        audit: {
          trigger: 'Playbook rule “High-intent definition” matched',
          contextUsed: ['Customer memory (5 prior events)', 'Lead: viewing_scheduled'],
          brainSources: ['Playbook: High-intent definition', 'Team: James Carter'],
          tool: 'handoff.brief_agent', args: { to: 'James Carter', channel: 'WhatsApp' },
          result: 'Briefing delivered', approval: 'not_required', finalAction: 'Agent notified within SLA (5 min)',
        },
      });
      return lead;
    }

    default:
      throw new BadRequestError(`Unknown effect ${effect as string}`);
  }
}

export async function resetDemo(tenantId: string) {
  await getStore().reset();
  publish(tenantId, 'demo.reset', { at: new Date().toISOString() });
}
