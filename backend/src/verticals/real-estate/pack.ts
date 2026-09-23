/**
 * Real Estate Vertical Pack: the first reference implementation (spec §15).
 * Pure configuration consumed by the universal core.
 */
import type { VerticalPack } from '../../core/vertical-pack';

export const realEstatePack: VerticalPack = {
  id: 'real-estate',
  name: 'Real Estate',
  status: 'live',
  summary:
    'Lead qualification, property inventory and matching, viewings, follow-ups and agent handoff for sales and rental brokerages.',
  terminology: {
    offering: 'property',
    appointment: 'viewing',
    staff: 'agent',
    order: 'offer',
  },
  customerTypes: ['buyer', 'seller', 'tenant', 'landlord'],
  entities: [
    { name: 'Property', description: 'Inventory item with volatile price/availability' },
    { name: 'Listing', description: 'A property published for sale or rent' },
    { name: 'Buyer / Tenant', description: 'Demand side: budget, area, requirements, financing' },
    { name: 'Seller / Landlord', description: 'Supply side: mandate, asking price, documents' },
    { name: 'Viewing', description: 'Pack name for the universal Appointment' },
    { name: 'Offer', description: 'Price proposal on a listing (human-only to accept)' },
    { name: 'Property document', description: 'Title report, deed, seller disclosures, survey, floor plan' },
  ],
  requiredLeadFields: ['intent', 'budget', 'preferred location', 'bedrooms', 'timeline', 'financing'],
  qualificationRules: [
    {
      id: 'q.high_intent',
      label: 'High intent',
      condition: 'Budget confirmed AND financing confirmed AND viewing requested',
      effect: 'Priority → high; notify assigned agent with handoff briefing',
    },
    {
      id: 'q.qualified',
      label: 'Qualified',
      condition: 'Intent, budget, area and bedrooms known',
      effect: 'Stage → qualified; recommend properties',
    },
    {
      id: 'q.stretch',
      label: 'Budget stretch',
      condition: 'Listing ≤ 5% above stated budget',
      effect: 'May be shown, with the gap stated explicitly',
    },
  ],
  workflows: [
    { id: 'wf.new_lead', trigger: 'New lead', outcome: 'Qualify', tools: ['crm.create_lead', 'brain.search'] },
    { id: 'wf.recommend', trigger: 'Qualified lead', outcome: 'Recommend matching properties', tools: ['inventory.match'] },
    { id: 'wf.offer_viewing', trigger: 'Strong interest', outcome: 'Offer viewing slots', tools: ['calendar.availability'] },
    { id: 'wf.schedule', trigger: 'Viewing requested', outcome: 'Schedule / coordinate', tools: ['calendar.book', 'crm.update_lead'] },
    { id: 'wf.missed', trigger: 'Missed viewing', outcome: 'Follow up and rebook', tools: ['message.send'] },
    { id: 'wf.alternatives', trigger: 'Property unavailable', outcome: 'Find alternatives', tools: ['inventory.match'] },
    { id: 'wf.escalate', trigger: 'High-intent lead', outcome: 'Notify / hand off to agent', tools: ['handoff.brief_agent'] },
    { id: 'wf.returning', trigger: 'Returning customer', outcome: 'Continue from saved context', tools: ['memory.search'] },
  ],
  tools: [
    { id: 'inventory.match', label: 'Match approved inventory', defaultPermission: 'autonomous' },
    { id: 'calendar.book', label: 'Book viewing in agent’s free slots', defaultPermission: 'autonomous' },
    { id: 'listing.update_price', label: 'Change a listing price', defaultPermission: 'approval_required' },
    { id: 'offer.accept', label: 'Accept / sign an offer', defaultPermission: 'human_only' },
  ],
};
