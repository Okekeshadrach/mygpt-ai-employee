/** Real Estate Pack entities (spec §15). These never leak into core/. */
import type { ISODate } from '../../domain/types';

export type ListingType = 'sale' | 'rent';
export type Availability = 'available' | 'under_offer' | 'let' | 'sold';

export interface Property {
  id: string;
  ref: string;
  title: string;
  listingType: ListingType;
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
  availability: Availability;
  /** Volatile fact — drives freshness (spec §22) */
  availabilityConfirmedAt: ISODate;
  photo: string;
  description: string;
  agentId: string;
  owner: string;
  source: string;
  updatedAt: ISODate;
}

export interface PropertyView extends Property {
  freshness: 'fresh' | 'stale';
  daysSinceConfirmed: number;
}

export interface BuyerRequirements {
  listingType: ListingType;
  budgetMax: number;
  locations: string[];
  minBedrooms: number;
  needsGuestSuite: boolean;
  /** Tolerance above budget still worth mentioning (e.g. 0.05 = 5%) */
  stretchTolerance?: number;
}

export interface PropertyMatch {
  property: PropertyView;
  score: number;
  reasons: string[];
  gaps: string[];
}

export interface MatchResult {
  scanned: number;
  matches: PropertyMatch[];
  excluded: { property: PropertyView; reason: string }[];
}
