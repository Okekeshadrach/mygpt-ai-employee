import type { FactStatus, Overview } from '../domain/types';
import { getStore } from '../data';
import { getPack } from '../verticals';
import { withFreshness } from '../verticals/real-estate/matching';
import { NotFoundError } from '../utils/errors';

/** Freshness window for volatile inventory facts, read from the Brain (spec §22). */
export async function inventoryFreshDays(tenantId: string): Promise<number> {
  const facts = await getStore().listBrainFacts(tenantId);
  return facts.find((f) => f.label === 'Listing prices')?.freshForDays ?? 14;
}

export async function getTenant(tenantId: string) {
  const tenant = await getStore().getTenant(tenantId);
  if (!tenant) throw new NotFoundError(`Tenant ${tenantId} not found`);
  return tenant;
}

export async function getBrain(tenantId: string) {
  const store = getStore();
  const [tenant, facts, permissions, onboarding] = await Promise.all([
    getTenant(tenantId),
    store.listBrainFacts(tenantId),
    store.listPermissionRules(tenantId),
    store.getOnboardingScript(tenantId),
  ]);
  const statusCounts = facts.reduce(
    (acc, f) => ({ ...acc, [f.status]: (acc[f.status] ?? 0) + 1 }),
    {} as Partial<Record<FactStatus, number>>,
  );
  return {
    tenant,
    pack: getPack(tenant.verticalPack),
    facts,
    statusCounts,
    permissions,
    readiness: onboarding.readiness,
  };
}

export async function listProperties(tenantId: string) {
  const freshDays = await inventoryFreshDays(tenantId);
  const props = await getStore().listProperties(tenantId);
  return props.map((p) => withFreshness(p, freshDays));
}

export async function getOnboarding(tenantId: string) {
  return getStore().getOnboardingScript(tenantId);
}

export async function getOverview(tenantId: string): Promise<Overview> {
  const store = getStore();
  const [tenant, leads, activity, approvals, onboarding] = await Promise.all([
    getTenant(tenantId),
    store.listLeads(tenantId),
    store.listActivity(tenantId),
    store.listApprovals(tenantId),
    store.getOnboardingScript(tenantId),
  ]);
  const since = (days: number) => Date.now() - days * 86_400_000;
  const within = (iso: string, days: number) => new Date(iso).getTime() >= since(days);
  return {
    tenant,
    stats: {
      // Baseline volume + anything recorded in this session
      conversationsToday: 23 + activity.filter((a) => a.live && a.type === 'conversation').length,
      leadsCaptured7d: leads.filter((l) => within(l.createdAt, 7)).length + 11,
      viewingsBooked7d: 6 + leads.flatMap((l) => l.appointments).filter((a) => a.id.startsWith('apt_live')).length,
      escalationsOpen: activity.filter((a) => a.type === 'escalation' && within(a.at, 1)).length,
      approvalsPending: approvals.filter((a) => a.status === 'pending').length,
      avgFirstResponseSec: 9,
    },
    brainReadiness: {
      ready: onboarding.readiness.filter((r) => r.status === 'ready').length,
      total: onboarding.readiness.length,
    },
  };
}
