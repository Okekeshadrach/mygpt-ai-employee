import type { Lead, LeadView, MemoryEvent } from '../domain/types';
import { getStore } from '../data';
import { publish } from '../realtime/socket';
import { NotFoundError } from '../utils/errors';

const STAGE_ORDER: Record<Lead['stage'], number> = {
  viewing_scheduled: 0, offer: 1, qualified: 2, qualifying: 3, new: 4, nurturing: 5, won: 6, lost: 7,
};

export async function listLeads(tenantId: string): Promise<LeadView[]> {
  const store = getStore();
  const [leads, customers] = await Promise.all([store.listLeads(tenantId), store.listCustomers(tenantId)]);
  return leads
    .map((l) => {
      const customer = customers.find((c) => c.id === l.customerId);
      if (!customer) throw new NotFoundError(`Customer ${l.customerId} missing for lead ${l.id}`);
      return { ...l, customer };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]);
}

export async function getLead(tenantId: string, leadId: string): Promise<LeadView> {
  const store = getStore();
  const lead = await store.getLead(tenantId, leadId);
  if (!lead) throw new NotFoundError(`Lead ${leadId} not found`);
  const customer = await store.getCustomer(tenantId, lead.customerId);
  if (!customer) throw new NotFoundError(`Customer ${lead.customerId} not found`);
  return { ...lead, customer };
}

/** Update a lead, mark which fields changed live, broadcast to CRM panels. */
export async function updateLeadLive(tenantId: string, leadId: string, patch: Partial<Lead>) {
  const store = getStore();
  const current = await store.getLead(tenantId, leadId);
  if (!current) throw new NotFoundError(`Lead ${leadId} not found`);
  const changed = Object.keys(patch).filter((k) => k !== 'liveChangedFields');
  const liveChangedFields = [...new Set([...(current.liveChangedFields ?? []), ...changed])];
  await store.updateLead(tenantId, leadId, { ...patch, liveChangedFields });
  const view = await getLead(tenantId, leadId);
  publish(tenantId, 'lead.updated', view);
  return view;
}

let mem = 0;
export async function remember(tenantId: string, customerId: string, event: Omit<MemoryEvent, 'id' | 'at' | 'live'>) {
  return getStore().appendMemory(tenantId, customerId, {
    ...event,
    id: `mem_live_${Date.now().toString(36)}_${++mem}`,
    at: new Date().toISOString(),
    live: true,
  });
}
