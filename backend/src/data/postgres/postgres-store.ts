/**
 * PostgresStore: placeholder for the real data layer.
 *
 * HOOK (next build step, spec §26 "Design Universal Brain and tenant architecture"):
 *   1. Add Prisma (`pnpm --filter @mygpt/backend add prisma @prisma/client`), model the tables
 *      drafted in backend/db/migrations/000_draft_schema.sql.
 *   2. Implement every DataStore method below with tenant_id in every WHERE clause
 *      (or Postgres RLS with `SET app.tenant_id`), never trusting ids alone (spec §20).
 *   3. Flip USE_MOCK_DATA=false. Routes and services do not change.
 */
import type { DataStore } from '../store';
import { NotImplementedError } from '../../utils/errors';

const todo = (method: string): never => {
  throw new NotImplementedError(`PostgresStore.${method} is not implemented yet. Set USE_MOCK_DATA=true`);
};

export class PostgresStore implements DataStore {
  readonly kind = 'postgres' as const;

  constructor(readonly databaseUrl: string) {
    if (!databaseUrl) todo('constructor (DATABASE_URL missing)');
  }

  getTenant = async () => todo('getTenant');
  listBrainFacts = async () => todo('listBrainFacts');
  listPermissionRules = async () => todo('listPermissionRules');
  getOnboardingScript = async () => todo('getOnboardingScript');
  listProperties = async () => todo('listProperties');
  listCustomers = async () => todo('listCustomers');
  getCustomer = async () => todo('getCustomer');
  updateCustomer = async () => todo('updateCustomer');
  appendMemory = async () => todo('appendMemory');
  listLeads = async () => todo('listLeads');
  getLead = async () => todo('getLead');
  updateLead = async () => todo('updateLead');
  listActivity = async () => todo('listActivity');
  addActivity = async () => todo('addActivity');
  listApprovals = async () => todo('listApprovals');
  getApproval = async () => todo('getApproval');
  updateApproval = async () => todo('updateApproval');
  reset = async () => todo('reset');
}
