import type {
  ActivityEvent,
  Approval,
  BrainFact,
  Customer,
  Lead,
  PermissionRule,
  Tenant,
} from '../../domain/types';
import type { OnboardingScript } from '../../domain/demo';
import type { Property } from '../../verticals/real-estate/types';
import { createClock } from './clock';
import { tenantFixture } from './tenant';
import { brainFixture, permissionsFixture } from './brain';
import { propertiesFixture } from './properties';
import { customersFixture, leadsFixture } from './crm';
import { activityFixture } from './activity';
import { approvalsFixture } from './approvals';
import { onboardingFixture } from './onboarding';

export interface TenantDataset {
  tenant: Tenant;
  brain: BrainFact[];
  permissions: PermissionRule[];
  properties: Property[];
  customers: Customer[];
  leads: Lead[];
  activity: ActivityEvent[];
  approvals: Approval[];
  onboarding: OnboardingScript;
}

/** Builds every seeded tenant, with timestamps relative to `now`. */
export function seedDatasets(now = Date.now()): Map<string, TenantDataset> {
  const t = createClock(now);
  const baycrest: TenantDataset = {
    tenant: tenantFixture(t),
    brain: brainFixture(t),
    permissions: permissionsFixture(),
    properties: propertiesFixture(t),
    customers: customersFixture(t),
    leads: leadsFixture(t),
    activity: activityFixture(t),
    approvals: approvalsFixture(t),
    onboarding: onboardingFixture(),
  };
  return new Map([[baycrest.tenant.id, baycrest]]);
}

export { DEMO_TENANT_ID, TENANT_TIMEZONE } from './tenant';
export { HERO_CUSTOMER_ID, HERO_LEAD_ID } from './crm';
