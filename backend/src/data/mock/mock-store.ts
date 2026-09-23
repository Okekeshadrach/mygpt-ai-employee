/**
 * In-memory DataStore seeded from fixtures. Mutations (live demo, approvals) persist until
 * reset() or process restart. Returns copies so callers can't mutate state by accident.
 */
import type { DataStore } from '../store';
import type { Customer, Lead, MemoryEvent, Approval, ActivityEvent } from '../../domain/types';
import { seedDatasets, type TenantDataset } from '../fixtures';
import { NotFoundError } from '../../utils/errors';

const clone = <T>(v: T): T => structuredClone(v);

export class MockStore implements DataStore {
  readonly kind = 'mock' as const;
  private data: Map<string, TenantDataset> = seedDatasets();

  private ds(tenantId: string): TenantDataset {
    const d = this.data.get(tenantId);
    if (!d) throw new NotFoundError(`Tenant ${tenantId} not found`);
    return d;
  }

  async getTenant(tenantId: string) {
    return clone(this.data.get(tenantId)?.tenant);
  }
  async listBrainFacts(tenantId: string) {
    return clone(this.ds(tenantId).brain);
  }
  async listPermissionRules(tenantId: string) {
    return clone(this.ds(tenantId).permissions);
  }
  async getOnboardingScript(tenantId: string) {
    return clone(this.ds(tenantId).onboarding);
  }
  async listProperties(tenantId: string) {
    return clone(this.ds(tenantId).properties);
  }

  async listCustomers(tenantId: string) {
    return clone(this.ds(tenantId).customers);
  }
  async getCustomer(tenantId: string, customerId: string) {
    return clone(this.ds(tenantId).customers.find((c) => c.id === customerId));
  }
  async updateCustomer(tenantId: string, customerId: string, patch: Partial<Customer>) {
    const c = this.ds(tenantId).customers.find((x) => x.id === customerId);
    if (!c) throw new NotFoundError(`Customer ${customerId} not found`);
    Object.assign(c, patch);
    return clone(c);
  }
  async appendMemory(tenantId: string, customerId: string, event: MemoryEvent) {
    const c = this.ds(tenantId).customers.find((x) => x.id === customerId);
    if (!c) throw new NotFoundError(`Customer ${customerId} not found`);
    c.memory.push(event);
    c.lastInteractionAt = event.at;
    return clone(c);
  }

  async listLeads(tenantId: string) {
    return clone(this.ds(tenantId).leads);
  }
  async getLead(tenantId: string, leadId: string) {
    return clone(this.ds(tenantId).leads.find((l) => l.id === leadId));
  }
  async updateLead(tenantId: string, leadId: string, patch: Partial<Lead>) {
    const l = this.ds(tenantId).leads.find((x) => x.id === leadId);
    if (!l) throw new NotFoundError(`Lead ${leadId} not found`);
    Object.assign(l, patch, { updatedAt: new Date().toISOString() });
    return clone(l);
  }

  async listActivity(tenantId: string) {
    return clone(this.ds(tenantId).activity);
  }
  async addActivity(tenantId: string, event: ActivityEvent) {
    this.ds(tenantId).activity.unshift(event);
    return clone(event);
  }

  async listApprovals(tenantId: string) {
    return clone(this.ds(tenantId).approvals);
  }
  async getApproval(tenantId: string, approvalId: string) {
    return clone(this.ds(tenantId).approvals.find((a) => a.id === approvalId));
  }
  async updateApproval(tenantId: string, approvalId: string, patch: Partial<Approval>) {
    const a = this.ds(tenantId).approvals.find((x) => x.id === approvalId);
    if (!a) throw new NotFoundError(`Approval ${approvalId} not found`);
    Object.assign(a, patch);
    return clone(a);
  }

  async reset() {
    this.data = seedDatasets();
  }
}
