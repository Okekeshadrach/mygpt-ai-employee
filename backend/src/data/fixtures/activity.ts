import type { ActivityEvent } from '../../domain/types';
import type { Clock } from './clock';

export const activityFixture = (t: Clock): ActivityEvent[] => [
  {
    id: 'act_020', at: t.ago({ m: 31 }), type: 'lead_captured', channel: 'web_chat', customerId: 'cus_sophie', leadId: 'lead_sophie',
    title: 'New lead captured: Sophie Harris', description: 'Website visitor asking about pre-construction condos with payment plans.',
    permissionClass: 'autonomous',
    evidence: [{ label: 'Intent', detail: 'Buy · pre-construction · payment plan' }, { label: 'Budget', detail: '≈ $800K (stated)' }],
    audit: {
      trigger: 'Inbound web chat message', contextUsed: ['New visitor, no prior memory'], brainSources: ['FAQ: Can I pay in installments?'],
      tool: 'crm.create_lead', args: { name: 'Sophie Harris', intent: 'buy', area: 'Kendall' }, result: 'lead_sophie created',
      approval: 'not_required', finalAction: 'Lead created; answered installments FAQ from approved fact',
    },
  },
  {
    id: 'act_019', at: t.ago({ m: 52 }), type: 'conversation', channel: 'instagram', customerId: 'cus_lucy', leadId: 'lead_lucy',
    title: 'Instagram enquiry moved to WhatsApp', description: 'Lucy Walker asked about BCR-1060. Ava confirmed availability and what the rent includes.',
    permissionClass: 'autonomous',
    evidence: [{ label: 'Listing freshness', detail: 'BCR-1060 availability confirmed 2 days ago', source: 'Inventory sheet' }],
    audit: {
      trigger: 'Instagram DM', contextUsed: ['New customer'], brainSources: ['Rental fees', 'Listing BCR-1060'],
      tool: 'faq.answer', args: { listing: 'BCR-1060' }, result: 'Answered from approved facts', approval: 'not_required',
      finalAction: 'Replied + moved to WhatsApp with consent',
    },
  },
  {
    id: 'act_018', at: t.ago({ h: 2 }), type: 'escalation', channel: 'web_chat', customerId: 'cus_daniel', leadId: 'lead_daniel',
    title: 'High-intent lead escalated to Oliver', description: 'Daniel Wright shared proof of funds and asked for a second viewing of BCR-1018.',
    permissionClass: 'autonomous',
    evidence: [
      { label: 'Budget confirmed', detail: '$9M cash' },
      { label: 'Financing confirmed', detail: 'Bank letter attached', source: 'WhatsApp attachment' },
      { label: 'Viewing requested', detail: 'Second viewing with spouse' },
    ],
    audit: {
      trigger: 'Playbook rule “High-intent definition” matched', contextUsed: ['Customer memory: 1 prior viewing', 'Lead stage: qualified'],
      brainSources: ['Playbook: High-intent definition', 'Team: Oliver Bennett'], tool: 'handoff.brief_agent',
      args: { to: 'Oliver Bennett', channel: 'WhatsApp' }, result: 'Briefing delivered (read by Oliver)', approval: 'not_required',
      finalAction: 'Agent briefed with recommended next action',
    },
  },
  {
    id: 'act_017', at: t.ago({ h: 3 }), type: 'issue',
    title: 'Stale listing withheld: BCR-1033', description: 'Availability not re-confirmed for 23 days, so it’s excluded from matches. James asked to re-confirm.',
    permissionClass: 'autonomous',
    evidence: [{ label: 'Freshness rule', detail: 'Listings expire after 14 days', source: 'Brain: Listing prices (volatile)' }],
    audit: {
      trigger: 'Nightly freshness check', contextUsed: ['Inventory sync'], brainSources: ['Pricing: Listing prices (freshForDays 14)'],
      tool: 'message.follow_up', args: { to: 'James Carter', listing: 'BCR-1033' }, result: 'Reminder sent', approval: 'not_required',
      finalAction: 'Listing hidden from customer answers until re-confirmed',
    },
  },
  {
    id: 'act_016', at: t.ago({ h: 4 }), type: 'approval_requested', title: 'Website page ready for approval',
    description: '“Coral Gables Family Homes” landing page generated from approved Brain facts. Waiting for Sarah.',
    permissionClass: 'approval_required',
    evidence: [{ label: 'Sources', detail: '12 owner-verified facts, 3 AI-drafted paragraphs (marked draft)' }],
    audit: {
      trigger: 'Missing asset identified at onboarding', contextUsed: ['Brand assets', 'Offerings'], brainSources: ['Logo & brand colors', 'What we do', 'Sales'],
      tool: 'website.publish', args: { page: '/coral-gables-family-homes' }, result: 'Prepared, not published', approval: 'pending',
      finalAction: 'Queued for owner approval',
    },
  },
  {
    id: 'act_015', at: t.ago({ h: 5 }), type: 'match', channel: 'whatsapp', customerId: 'cus_chloe', leadId: 'lead_chloe',
    title: 'Matched Chloe Evans → BCR-1055', description: '2-bed near Miracle Mile, $3,800/mo, within budget and available now.',
    permissionClass: 'autonomous',
    evidence: [{ label: 'Budget', detail: '$3,800 ≤ $4,000/mo' }, { label: 'Area', detail: 'Coral Gables (requested)' }, { label: 'Fresh', detail: 'Confirmed 4 days ago' }],
    audit: {
      trigger: 'Customer message', contextUsed: ['Requirements from memory'], brainSources: ['Inventory (38 listings)'],
      tool: 'inventory.match', args: { intent: 'rent', beds: '2', area: 'Coral Gables' }, result: '1 match, 0 stale excluded', approval: 'not_required',
      finalAction: 'Sent listing card',
    },
  },
  {
    id: 'act_014', at: t.ago({ h: 7 }), type: 'issue', channel: 'whatsapp',
    title: 'Refused prompt-injection attempt', description: 'A message asked Ava to “ignore previous instructions” and share a seller’s phone number. Refused; nothing disclosed.',
    permissionClass: 'human_only',
    evidence: [{ label: 'Policy', detail: 'Never expose another party’s data', source: 'Reliability rules §24' }],
    audit: {
      trigger: 'Inbound WhatsApp (unknown number)', contextUsed: ['No customer match'], brainSources: ['Policies'],
      tool: 'none', args: {}, result: 'Request refused', approval: 'blocked', finalAction: 'Polite refusal; flagged for review',
    },
  },
  {
    id: 'act_013', at: t.ago({ h: 9 }), type: 'escalation', channel: 'whatsapp',
    title: 'Unknown question escalated, not guessed', description: 'Customer asked about flood-insurance history on a Pinecrest street. Not in the Brain, so James was asked instead of guessing.',
    permissionClass: 'autonomous',
    evidence: [{ label: 'Brain lookup', detail: 'No approved fact found for “flood insurance claims”' }],
    audit: {
      trigger: 'Customer question', contextUsed: ['Lead: prospective buyer'], brainSources: ['(none matched)'],
      tool: 'handoff.brief_agent', args: { to: 'James Carter', question: 'Flood-insurance history, Pinecrest' }, result: 'Delivered', approval: 'not_required',
      finalAction: 'Told customer an agent will confirm today',
    },
  },
  {
    id: 'act_012', at: t.ago({ h: 20 }), type: 'approval_requested', channel: 'whatsapp', customerId: 'cus_richard', leadId: 'lead_richard',
    title: 'Price change requested: BCR-1063', description: 'Seller asked to reduce $2.4M → $2.25M. Prepared the update and waiting for Sarah.',
    permissionClass: 'approval_required',
    evidence: [{ label: 'Seller instruction', detail: 'Voice note, transcribed' }, { label: 'Days on market', detail: '41' }],
    audit: {
      trigger: 'Seller voice note', contextUsed: ['Listing agreement', 'Listing history'], brainSources: ['Team: Sarah approves prices'],
      tool: 'listing.update_price', args: { listing: 'BCR-1063', from: '2400000', to: '2250000' }, result: 'Prepared, not applied',
      approval: 'pending', finalAction: 'Queued for owner approval',
    },
  },
  {
    id: 'act_011', at: t.ago({ d: 1 }), type: 'follow_up', customerId: 'cus_samuel', leadId: 'lead_samuel', channel: 'whatsapp',
    title: 'Day-7 follow-up completed: Samuel Green', description: 'Still saving for a down payment; moved to monthly nurture per the Playbook.',
    permissionClass: 'autonomous',
    evidence: [{ label: 'Cadence', detail: 'Day 1 ✓ · Day 3 ✓ · Day 7 ✓', source: 'Playbook: Follow-up cadence' }],
    audit: {
      trigger: 'Scheduled follow-up due', contextUsed: ['Lead stage: nurturing'], brainSources: ['Playbook: Follow-up cadence'],
      tool: 'message.follow_up', args: { template: 'day_7_check_in' }, result: 'Delivered, customer replied', approval: 'not_required',
      finalAction: 'Next check-in scheduled in 30 days',
    },
  },
  {
    id: 'act_010', at: t.ago({ d: 1, h: 2 }), type: 'lead_qualified', customerId: 'cus_thomas', leadId: 'lead_thomas', channel: 'whatsapp',
    title: 'Lead qualified: Thomas Reed', description: 'Budget $2.5M cash confirmed. 4-bed in Coral Gables/Coconut Grove for his parents.',
    permissionClass: 'autonomous',
    evidence: [{ label: 'Required fields', detail: '6 of 6 collected' }],
    audit: {
      trigger: 'Customer message', contextUsed: ['Memory: requirements'], brainSources: ['Playbook: Qualification fields'],
      tool: 'crm.update_lead', args: { stage: 'qualified' }, result: 'Updated', approval: 'not_required', finalAction: 'Stage → qualified',
    },
  },
  {
    id: 'act_009', at: t.ago({ d: 1, h: 6 }), type: 'issue', channel: 'whatsapp', customerId: 'cus_chloe',
    title: 'Payment request declined → human', description: 'Customer asked where to wire a deposit. Ava didn’t share wire instructions and handed over to Emily.',
    permissionClass: 'human_only',
    evidence: [{ label: 'Permission', detail: 'payment.request is human-only' }, { label: 'Policy', detail: 'Never share wire instructions', source: 'Brain: Payments & wire instructions' }],
    audit: {
      trigger: 'Customer message', contextUsed: ['Lead: Chloe Evans'], brainSources: ['Policies: Payments & wire instructions'],
      tool: 'payment.request', args: {}, result: 'Not executed', approval: 'blocked', finalAction: 'Handed to Emily with context',
    },
  },
  {
    id: 'act_008', at: t.ago({ d: 2 }), type: 'approval_decided', title: 'Broadcast approved by Sarah',
    description: '“New this week” listing broadcast sent to 38 opted-in buyers.',
    permissionClass: 'approval_required',
    evidence: [{ label: 'Audience', detail: '38 contacts who opted in to listing updates' }],
    audit: {
      trigger: 'Weekly marketing workflow', contextUsed: ['Opted-in contacts'], brainSources: ['Communication: Tone'],
      tool: 'marketing.broadcast', args: { recipients: '38' }, result: 'Sent (38 delivered)', approval: 'approved',
      finalAction: 'Broadcast delivered', humanOverride: 'Sarah edited the headline before approving',
    },
  },
];
