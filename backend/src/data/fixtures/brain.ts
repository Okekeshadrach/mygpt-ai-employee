import type { BrainFact, PermissionRule } from '../../domain/types';
import type { Clock } from './clock';

let n = 0;
const id = () => `bf_${String(++n).padStart(3, '0')}`;

export const brainFixture = (t: Clock): BrainFact[] => {
  n = 0;
  const onboarding = 'Onboarding interview (owner)';
  const sheet = 'Google Sheets · “Baycrest Listings 2026”';
  return [
    // Identity
    { id: id(), category: 'identity', label: 'Business name', value: 'Baycrest Realty LLC', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'identity', label: 'What we do', value: 'Residential sales and rentals across Coral Gables, Coconut Grove, Brickell and Miami Beach, plus property management for landlords.', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 2 },
    { id: id(), category: 'identity', label: 'Head office', value: '2150 Ponce de Leon Blvd, Coral Gables, FL', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'identity', label: 'WhatsApp Business line', value: '+1 (305) ••• 4410 (verified business profile)', status: 'imported', source: 'WhatsApp Business profile', updatedAt: t.ago({ d: 20 }), version: 1 },
    { id: id(), category: 'identity', label: 'Track record', value: 'Founded 2012 · 900+ homes sold or leased', status: 'pending_confirmation', source: 'AI-extracted from 2019 website “About” page', updatedAt: t.ago({ d: 20 }), version: 1, note: 'Figure is 5+ years old. Owner to confirm before customers see it.' },

    // Offerings
    { id: id(), category: 'offerings', label: 'Sales', value: 'Single-family homes, townhouses and condos from $600K to $12M', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'offerings', label: 'Rentals', value: 'Monthly rents from $2,800 to $15,000; furnished condos in Edgewater and Brickell', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'offerings', label: 'Property management', value: 'Rent collection, maintenance and tenant screening for landlords (managed by Emily)', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'offerings', label: 'Active listings', value: '38 listings synced from the agents’ inventory sheet', status: 'imported', source: sheet, updatedAt: t.ago({ h: 3 }), version: 57, volatile: true, freshForDays: 14 },
    { id: id(), category: 'offerings', label: 'Vacation rentals', value: 'Not offered', status: 'rejected', source: 'Owner disabled AI suggestion', updatedAt: t.ago({ d: 18 }), version: 2, note: 'AI proposed adding short-term rentals from competitor research; owner rejected.' },

    // Pricing
    { id: id(), category: 'pricing', label: 'Buyer representation', value: '2.5% of purchase price, per signed buyer agreement', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'pricing', label: 'Rental fees', value: 'Leasing fee of one month’s rent; security deposit of one month’s rent', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'pricing', label: 'Discounts', value: 'No fee discounts without owner approval', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'pricing', label: 'Listing prices', value: 'Per listing, from inventory sheet. Volatile: re-confirmed every 14 days', status: 'imported', source: sheet, updatedAt: t.ago({ h: 3 }), version: 57, volatile: true, freshForDays: 14 },
    { id: id(), category: 'pricing', label: 'HOA fees by community', value: 'Sunset Drive townhouses $600–$1,450/mo · Brickell Key condos $1,800/mo · Pinecrest $900/mo', status: 'pending_confirmation', source: 'Collected from listings by AI', updatedAt: t.ago({ d: 2 }), version: 1, note: 'Owner said “I’ll send these later”. Shown to customers per listing only.' },

    // Hours
    { id: id(), category: 'hours', label: 'Office hours', value: 'Mon–Fri 9 AM–6 PM · Sat 10 AM–4 PM · Closed Sunday', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'hours', label: 'Viewing hours', value: 'Mon–Sat 10 AM–4 PM · 45-min slots · max 4 viewings per agent per day', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 2 },
    { id: id(), category: 'hours', label: 'AI coverage', value: 'Ava answers 24/7 on WhatsApp and web chat; humans reply within 2 business hours', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'hours', label: 'Holiday closures', value: '2025 holiday calendar', status: 'stale', source: 'Imported from old website', updatedAt: t.ago({ d: 262 }), version: 1, volatile: true, freshForDays: 365, note: 'Expired. Owner asked to upload 2026 closures.' },

    // Team
    { id: id(), category: 'team', label: 'James Carter', value: 'Sales Lead: Coral Gables, South Miami, Coconut Grove, Pinecrest, Kendall', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'team', label: 'Oliver Bennett', value: 'Senior Agent: Brickell, Miami Beach, Key Biscayne, Edgewater', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'team', label: 'Emily Clarke', value: 'All rentals and landlord property management', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'team', label: 'Sarah Mitchell', value: 'Managing Broker: approves prices, discounts, publishing', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },

    // Policies
    { id: id(), category: 'policies', label: 'Viewing ID requirement', value: 'Photo ID required for all viewings (gated-community security)', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'policies', label: 'Price negotiation', value: 'Never promise or imply a price reduction; offers go to the agent', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'policies', label: 'Payments & wire instructions', value: 'Never request payment or share wire instructions (wire-fraud risk). All money matters → human', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'policies', label: 'Title & disclosures', value: 'Share title reports and seller disclosures only after proof of funds or pre-approval', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'policies', label: 'Lead data retention', value: 'Delete inactive lead data after 24 months', status: 'ai_draft', source: 'AI draft from state privacy guidance', updatedAt: t.ago({ d: 6 }), version: 1, note: 'Draft. Not active until owner approves.' },

    // FAQs
    { id: id(), category: 'faqs', label: 'Do you charge for viewings?', value: 'No, viewings are free.', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'faqs', label: 'Can I pay in installments?', value: 'Only on pre-construction condos with a developer deposit schedule, as marked in the listing.', status: 'imported', source: 'Website FAQ page', updatedAt: t.ago({ d: 20 }), version: 1 },
    { id: id(), category: 'faqs', label: 'Do you help with mortgages?', value: 'We refer you to partner lenders; we don’t give financial advice.', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'faqs', label: 'Are flood zones disclosed?', value: 'Every listing shows its FEMA flood zone and elevation certificate where available.', status: 'pending_confirmation', source: 'AI draft from owner’s voice note', updatedAt: t.ago({ d: 4 }), version: 1 },

    // Playbook (spec §5)
    { id: id(), category: 'playbook', label: 'Qualification fields', value: 'Intent · budget · area · bedrooms · timeline · financing (cash / mortgage)', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'playbook', label: 'High-intent definition', value: 'Budget confirmed + financing confirmed + viewing requested → alert the area agent within 5 minutes', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'playbook', label: 'Follow-up cadence', value: 'Day 1, day 3, day 7, then every 14 days. Stop on “not interested”', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'playbook', label: 'Escalate to a human when…', value: 'Complaints, legal questions, offers, payments, or any question the Brain can’t answer', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'playbook', label: 'Objection: HOA fees too high', value: 'Show total monthly cost and suggest lower-HOA communities nearby', status: 'ai_draft', source: 'Learned from 14 conversations', updatedAt: t.ago({ d: 1 }), version: 1, note: 'Controlled learning: suggested by AI, waiting for owner approval (spec §5).' },

    // Communication
    { id: id(), category: 'communication', label: 'Tone', value: 'Warm, professional, concise. Light emoji on WhatsApp is fine', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'communication', label: 'Languages', value: 'English and Spanish. Replies in the customer’s language', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },
    { id: id(), category: 'communication', label: 'AI disclosure', value: 'Introduces itself as “Ava, Baycrest’s AI assistant” and always confirms it is AI if asked', status: 'owner_verified', source: onboarding, updatedAt: t.ago({ d: 21 }), version: 1 },

    // Assets (spec §14)
    { id: id(), category: 'assets', label: 'Logo & brand colors', value: 'Navy + sand wordmark (SVG)', status: 'imported', source: 'Existing website', updatedAt: t.ago({ d: 20 }), version: 1 },
    { id: id(), category: 'assets', label: 'Website', value: 'New “Coral Gables Family Homes” page generated from the Brain', status: 'ai_draft', source: 'Website generator', updatedAt: t.ago({ h: 5 }), version: 3, note: 'Awaiting owner approval to publish (see Approvals).' },
    { id: id(), category: 'assets', label: 'Property brochure template', value: 'One-page letter-size brochure with QR code to WhatsApp', status: 'ai_draft', source: 'Asset generator', updatedAt: t.ago({ d: 3 }), version: 1 },
  ];
};

export const permissionsFixture = (): PermissionRule[] => [
  // Autonomous
  { actionId: 'faq.answer', label: 'Answer questions from approved Brain facts', class: 'autonomous', rationale: 'Only owner-verified or imported facts are used', scope: 'core' },
  { actionId: 'crm.create_lead', label: 'Capture new leads', class: 'autonomous', rationale: 'Low risk; fully audited', scope: 'core' },
  { actionId: 'crm.update_lead', label: 'Update CRM & customer memory', class: 'autonomous', rationale: 'Low risk; fully audited', scope: 'core' },
  { actionId: 'inventory.match', label: 'Match approved, fresh inventory', class: 'autonomous', rationale: 'Stale listings are never shown as current', scope: 'real-estate' },
  { actionId: 'calendar.book', label: 'Book viewings in agents’ free slots', class: 'autonomous', rationale: 'Within viewing hours and agent capacity only', scope: 'real-estate' },
  { actionId: 'message.follow_up', label: 'Send approved follow-up messages', class: 'autonomous', rationale: 'Uses the owner’s follow-up cadence', scope: 'core' },
  { actionId: 'handoff.brief_agent', label: 'Escalate / brief a human agent', class: 'autonomous', rationale: 'Escalating is always safe', scope: 'core' },
  // Approval required
  { actionId: 'listing.update_price', label: 'Change a listing price', class: 'approval_required', rationale: 'Affects the seller’s listing agreement and published info', scope: 'real-estate' },
  { actionId: 'website.publish', label: 'Publish website pages', class: 'approval_required', rationale: 'Never auto-publish (spec §13)', scope: 'core' },
  { actionId: 'fee.discount', label: 'Offer a fee discount', class: 'approval_required', rationale: 'Owner policy: no discounts without approval', scope: 'core' },
  { actionId: 'marketing.broadcast', label: 'WhatsApp broadcast to 25+ contacts', class: 'approval_required', rationale: 'Sensitive marketing action', scope: 'core' },
  // Human only
  { actionId: 'offer.accept', label: 'Accept or sign an offer', class: 'human_only', rationale: 'Legal/financial commitment', scope: 'real-estate' },
  { actionId: 'payment.request', label: 'Request or move money', class: 'human_only', rationale: 'Spending/collecting money is human-controlled', scope: 'core' },
  { actionId: 'contract.sign', label: 'Sign contracts or give legal advice', class: 'human_only', rationale: 'Legal commitment', scope: 'core' },
  { actionId: 'record.delete', label: 'Delete customer or critical records', class: 'human_only', rationale: 'Irreversible', scope: 'core' },
];
