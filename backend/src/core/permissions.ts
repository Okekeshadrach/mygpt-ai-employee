/**
 * Single enforcement point for the permission model (spec §10).
 * Rules are tenant data (stored with the Brain), not code, so they're configurable per business.
 * Unknown actions default to human_only: MyGPT never has unlimited authority.
 */
import type { PermissionClass, PermissionRule } from '../domain/types';
import { getStore } from '../data';

export interface PermissionDecision {
  actionId: string;
  class: PermissionClass;
  allowedToExecute: boolean;
  rule?: PermissionRule;
}

export async function checkPermission(tenantId: string, actionId: string): Promise<PermissionDecision> {
  const rules = await getStore().listPermissionRules(tenantId);
  const rule = rules.find((r) => r.actionId === actionId);
  const cls: PermissionClass = rule?.class ?? 'human_only';
  return { actionId, class: cls, allowedToExecute: cls === 'autonomous', rule };
}
