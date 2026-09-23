import type { Tenant } from '../../domain/types';
import type { Clock } from './clock';

export const DEMO_TENANT_ID = 'tnt_baycrest';
export const TENANT_TIMEZONE = 'America/New_York';

export const tenantFixture = (t: Clock): Tenant => ({
  id: DEMO_TENANT_ID,
  name: 'Baycrest Realty',
  industry: 'Residential real estate',
  verticalPack: 'real-estate',
  tagline: 'Homes across Coral Gables, Coconut Grove, Brickell & Miami Beach',
  locations: ['Coral Gables', 'South Miami', 'Coconut Grove', 'Pinecrest', 'Brickell', 'Miami Beach', 'Key Biscayne', 'Edgewater', 'Kendall', 'Wynwood'],
  whatsapp: '+1 (305) ••• 4410',
  email: 'hello@baycrestrealty.com',
  website: 'baycrestrealty.com',
  currency: 'USD',
  locale: 'en-US',
  timezone: TENANT_TIMEZONE,
  owner: { name: 'Sarah Mitchell', role: 'Managing Broker', initials: 'SM' },
  aiEmployeeName: 'Ava',
  liveSince: t.ago({ d: 19 }),
  team: [
    { id: 'tm_james', name: 'James Carter', role: 'Sales Lead · Coral Gables & South Miami', phone: '+1 (305) ••• 0142', specialties: ['Coral Gables', 'South Miami', 'Coconut Grove', 'Pinecrest', 'Kendall'], initials: 'JC' },
    { id: 'tm_oliver', name: 'Oliver Bennett', role: 'Senior Agent · Brickell, Miami Beach & Key Biscayne', phone: '+1 (786) ••• 2291', specialties: ['Brickell', 'Miami Beach', 'Key Biscayne', 'Edgewater'], initials: 'OB' },
    { id: 'tm_emily', name: 'Emily Clarke', role: 'Rentals & Property Management', phone: '+1 (305) ••• 7730', specialties: ['Rentals', 'Landlord management'], initials: 'EC' },
    { id: 'tm_sarah', name: 'Sarah Mitchell', role: 'Managing Broker · Approvals', phone: '+1 (305) ••• 5518', specialties: ['Approvals', 'Pricing'], initials: 'SM' },
  ],
});
