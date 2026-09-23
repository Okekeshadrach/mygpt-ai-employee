/**
 * Property matching (spec §15 "Property matching").
 * Deterministic and explainable: every match carries the reasons and the gaps, and anything
 * stale is excluded rather than presented as current (spec §22, §24).
 */
import type {
  BuyerRequirements,
  MatchResult,
  Property,
  PropertyMatch,
  PropertyView,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function withFreshness(p: Property, freshForDays: number, now = Date.now()): PropertyView {
  const days = Math.floor((now - new Date(p.availabilityConfirmedAt).getTime()) / DAY_MS);
  return { ...p, daysSinceConfirmed: days, freshness: days > freshForDays ? 'stale' : 'fresh' };
}

/** Compact, currency-aware money for evidence strings, e.g. "$1.95M" (spec §19). */
function money(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: amount >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: amount >= 10_000 ? 2 : 0,
  }).format(amount);
}

export function matchProperties(
  req: BuyerRequirements,
  inventory: PropertyView[],
): MatchResult {
  const stretch = req.stretchTolerance ?? 0.05;
  const matches: PropertyMatch[] = [];
  const excluded: MatchResult['excluded'] = [];

  for (const p of inventory) {
    if (p.listingType !== req.listingType) continue;
    if (p.availability !== 'available') continue;

    const inArea = req.locations.some((l) =>
      [p.area, p.estate ?? ''].some((a) => a.toLowerCase().includes(l.toLowerCase())),
    );
    if (!inArea) continue;
    if (p.bedrooms < req.minBedrooms) continue;

    if (p.freshness === 'stale') {
      excluded.push({
        property: p,
        reason: `Availability last confirmed ${p.daysSinceConfirmed} days ago. Not presented as current; flagged for agent re-confirmation`,
      });
      continue;
    }

    const reasons: string[] = [];
    const gaps: string[] = [];
    let score = 50;

    if (p.price <= req.budgetMax) {
      reasons.push(`Within budget (${money(p.price, p.currency)} ≤ ${money(req.budgetMax, p.currency)})`);
      score += 20;
    } else if (p.price <= req.budgetMax * (1 + stretch)) {
      gaps.push(`${Math.round(((p.price - req.budgetMax) / req.budgetMax) * 100)}% above stated budget`);
      score += 5;
    } else {
      continue;
    }

    reasons.push(`${p.bedrooms}-bed in ${p.estate ?? p.area}`);
    if (req.needsGuestSuite) {
      if (p.hasGuestSuite) {
        reasons.push('Has guest suite (requested)');
        score += 15;
      } else {
        gaps.push('No guest suite');
        score -= 20;
      }
    }
    if (p.hoaPerMonth !== undefined) {
      reasons.push(`HOA ${money(p.hoaPerMonth, p.currency)}/mo`);
    }
    score += Math.min(p.bedrooms - req.minBedrooms, 2) * 3;

    matches.push({ property: p, score, reasons, gaps });
  }

  matches.sort((a, b) => b.score - a.score);
  return { scanned: inventory.length, matches, excluded };
}
