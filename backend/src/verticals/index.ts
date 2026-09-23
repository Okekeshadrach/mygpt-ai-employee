/**
 * Vertical Pack registry. Adding an industry = adding an entry here + its pack folder.
 * If that ever requires editing core/, the abstraction is wrong (spec §27).
 */
import type { VerticalPack } from '../core/vertical-pack';
import { realEstatePack } from './real-estate/pack';

function planned(id: string, name: string, summary: string, entities: string[]): VerticalPack {
  return {
    id,
    name,
    status: 'planned',
    summary,
    terminology: {},
    customerTypes: [],
    entities: entities.map((e) => ({ name: e, description: '' })),
    requiredLeadFields: [],
    qualificationRules: [],
    workflows: [],
    tools: [],
  };
}

export const verticalPacks: VerticalPack[] = [
  realEstatePack,
  planned('dental', 'Dental', 'Patients, treatments, dentists, appointments and insurance.', ['Patient', 'Treatment', 'Dentist', 'Insurance plan']),
  planned('restaurant', 'Restaurant', 'Reservations, menus, orders and delivery.', ['Reservation', 'Menu item', 'Order']),
  planned('legal', 'Legal Services', 'Matter intake, conflict checks and consultations.', ['Client', 'Matter', 'Consultation']),
  planned('ecommerce', 'E-commerce', 'Products, orders, returns and delivery tracking.', ['Product', 'Order', 'Return']),
  planned('cleaning', 'Cleaning Services', 'Quotes, recurring bookings and crews.', ['Quote', 'Booking', 'Crew']),
  planned('fitness', 'Gym / Fitness', 'Memberships, classes and trainers.', ['Member', 'Class', 'Trainer']),
  planned('insurance', 'Insurance', 'Quotes, policies and claims intake.', ['Policy', 'Quote', 'Claim']),
  planned('travel', 'Travel', 'Itineraries, bookings and visas.', ['Trip', 'Booking', 'Traveller']),
];

export function getPack(id: string): VerticalPack | undefined {
  return verticalPacks.find((p) => p.id === id);
}
