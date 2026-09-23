import type { Approval } from '../../domain/types';
import type { Clock } from './clock';

export const approvalsFixture = (t: Clock): Approval[] => [
  {
    id: 'apr_price_1063', createdAt: t.ago({ h: 20 }), actionId: 'listing.update_price', permissionClass: 'approval_required',
    title: 'Reduce BCR-1063 (Brickell Key penthouse) to $2.25M',
    summary: 'Seller Richard Hughes asked to lower the asking price. Ava prepared the listing, website and inventory updates, and a note to 2 interested buyers. Nothing changes until you approve.',
    requestedBy: 'Ava (on seller’s instruction)', status: 'pending',
    diff: [
      { field: 'Asking price', before: '$2,400,000', after: '$2,250,000' },
      { field: 'Website listing', before: '$2.4M', after: '$2.25M · “Price reduced” badge' },
      { field: 'Notify matching buyers', before: '—', after: '2 leads (approved template)' },
    ],
    evidence: [
      { label: 'Seller instruction', detail: '“Let’s bring it down to 2.25, I need to close before December.”', source: 'WhatsApp voice note, yesterday evening (transcribed)' },
      { label: 'Time on market', detail: '41 days · 3 viewings · 0 offers', source: 'CRM' },
      { label: 'Comparables', detail: '3 Brickell Key 4-bed condos sold $2.15M–$2.3M this year', source: 'MLS closed sales' },
    ],
    impact: 'Changes a published price and triggers buyer notifications.',
    preview: { kind: 'listing', title: 'BCR-1063 · 4-bed penthouse, Brickell Key', lines: ['$2,250,000 (was $2.4M)', 'Bay views · smart home · private elevator', 'Price reduced'] },
  },
  {
    id: 'apr_web_gables', createdAt: t.ago({ h: 4 }), actionId: 'website.publish', permissionClass: 'approval_required',
    title: 'Publish “Coral Gables Family Homes” page',
    summary: 'A new landing page generated from your Brain for family buyers in Coral Gables, South Miami and Coconut Grove. Built from approved facts only, with AI-written copy clearly marked as a draft.',
    requestedBy: 'Ava · Website generator', status: 'pending',
    diff: [
      { field: 'Page', before: '—', after: 'baycrestrealty.com/coral-gables-family-homes' },
      { field: 'Listings shown', before: '—', after: '4 fresh listings (stale ones excluded)' },
      { field: 'WhatsApp CTA', before: '—', after: '“Chat with Ava” → +1 (305) ••• 4410' },
    ],
    evidence: [
      { label: 'Sources', detail: '12 owner-verified facts · 3 AI-drafted paragraphs', source: 'Business Brain' },
      { label: 'Brand', detail: 'Approved logo and navy/sand palette', source: 'Brain: Logo & brand colors' },
      { label: 'Why', detail: '31% of this month’s enquiries were families asking about Coral Gables schools', source: 'Conversation analysis' },
    ],
    impact: 'Publicly visible. Never auto-published (spec §13).',
    preview: {
      kind: 'website', title: 'Coral Gables Family Homes: space to grow, minutes from school',
      lines: ['Hero: family homes with guest suites near Coral Gables schools', 'Section: Why Coral Gables for families', 'Listings: BCR-1042, BCR-1037, BCR-1051, BCR-1055', 'FAQ: viewings are free · photo ID required', 'CTA: Chat with Ava on WhatsApp'],
    },
  },
  {
    id: 'apr_fee_elizabeth', createdAt: t.ago({ d: 3 }), actionId: 'fee.discount', permissionClass: 'approval_required',
    title: '50% leasing-fee discount for Elizabeth Shaw',
    summary: 'A repeat landlord asked for a 50% fee discount on a 4th condo. Your policy is no discounts without approval, so Ava told her it would check with you.',
    requestedBy: 'Customer request via Emily', status: 'pending',
    diff: [{ field: 'Leasing fee (4th condo)', before: 'One month’s rent ($3,200)', after: 'Half a month’s rent ($1,600)' }],
    evidence: [
      { label: 'Relationship', detail: '3 condos managed for 14 months, 0 late payments', source: 'CRM' },
      { label: 'Policy', detail: 'No fee discounts without owner approval', source: 'Brain: Discounts' },
    ],
    impact: 'Reduces fee revenue by $1,600.',
  },
  {
    id: 'apr_offer_1018', createdAt: t.ago({ h: 6 }), actionId: 'offer.accept', permissionClass: 'human_only',
    title: 'Offer of $8.3M on BCR-1018 (Sunset Islands)',
    summary: 'An offer came in on the Miami Beach waterfront estate. Accepting offers is human-only, so Ava can’t act on it. It prepared a briefing for Oliver and the seller instead.',
    requestedBy: 'Buyer’s agent (email)', status: 'human_only',
    diff: [{ field: 'Offer vs asking', before: '$8.5M asking', after: '$8.3M offered (−2.4%)' }],
    evidence: [
      { label: 'Competing interest', detail: 'Daniel Wright (cash, second viewing tomorrow)', source: 'CRM' },
      { label: 'Permission', detail: 'offer.accept is human-only', source: 'Brain: Permissions' },
    ],
    impact: 'Legal/financial commitment. The AI prepares the briefing only.',
  },
  {
    id: 'apr_broadcast_wk', createdAt: t.ago({ d: 2, h: 3 }), actionId: 'marketing.broadcast', permissionClass: 'approval_required',
    title: '“New this week” broadcast to 38 buyers', summary: 'Weekly listing digest to opted-in buyers.',
    requestedBy: 'Ava · Weekly marketing workflow', status: 'approved', diff: [], evidence: [{ label: 'Audience', detail: '38 opted-in contacts' }],
    impact: 'Sent 38 messages.', decidedAt: t.ago({ d: 2 }), decidedBy: 'Sarah Mitchell', decisionNote: 'Edited headline, then approved.',
  },
  {
    id: 'apr_disc_lease', createdAt: t.ago({ d: 5 }), actionId: 'fee.discount', permissionClass: 'approval_required',
    title: '20% leasing-fee discount (Wynwood tenant)', summary: 'Tenant asked for a reduced fee.',
    requestedBy: 'Customer request', status: 'rejected', diff: [], evidence: [], impact: '—',
    decidedAt: t.ago({ d: 4 }), decidedBy: 'Sarah Mitchell', decisionNote: 'Not this season.',
  },
];
