/**
 * DataStore — the seam between business logic and persistence.
 *
 * Routes → services → getStore() → DataStore. Nothing above this interface knows whether data
 * comes from in-memory fixtures (MockStore) or Postgres (PostgresStore, later via Prisma).
 * Every method is tenant-scoped: tenantId is always the first argument (spec §20).
 */
import type {
  ActivityEvent,
  Approval,
  BrainFact,
  Customer,
  Lead,
  MemoryEvent,
  PermissionRule,
  Tenant,
} from '../domain/types';
import type { Property } from '../verticals/real-estate/types';
import type { OnboardingScript } from '../domain/demo';

export interface DataStore {
  readonly kind: 'mock' | 'postgres';

  getTenant(tenantId: string): Promise<Tenant | undefined>;

  // Business Brain
  listBrainFacts(tenantId: string): Promise<BrainFact[]>;
  listPermissionRules(tenantId: string): Promise<PermissionRule[]>;
  getOnboardingScript(tenantId: string): Promise<OnboardingScript>;

  // Vertical data (Real Estate Pack). HOOK: generalise to pack-scoped repositories when a 2nd pack lands.
  listProperties(tenantId: string): Promise<Property[]>;

  // Customer Memory + CRM
  listCustomers(tenantId: string): Promise<Customer[]>;
  getCustomer(tenantId: string, customerId: string): Promise<Customer | undefined>;
  updateCustomer(tenantId: string, customerId: string, patch: Partial<Customer>): Promise<Customer>;
  appendMemory(tenantId: string, customerId: string, event: MemoryEvent): Promise<Customer>;
  listLeads(tenantId: string): Promise<Lead[]>;
  getLead(tenantId: string, leadId: string): Promise<Lead | undefined>;
  updateLead(tenantId: string, leadId: string, patch: Partial<Lead>): Promise<Lead>;

  // Activity feed + audit trail
  listActivity(tenantId: string): Promise<ActivityEvent[]>;
  addActivity(tenantId: string, event: ActivityEvent): Promise<ActivityEvent>;

  // Approvals
  listApprovals(tenantId: string): Promise<Approval[]>;
  getApproval(tenantId: string, approvalId: string): Promise<Approval | undefined>;
  updateApproval(tenantId: string, approvalId: string, patch: Partial<Approval>): Promise<Approval>;

  /** Demo only: restore seeded state. PostgresStore should re-run seeds or refuse in production. */
  reset(): Promise<void>;
}
