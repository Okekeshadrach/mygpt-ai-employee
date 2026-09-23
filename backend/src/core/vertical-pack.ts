/**
 * The contract every Vertical Pack fulfils (spec §2B, §27).
 * The core only knows this interface — never a specific industry.
 */
import type { PermissionClass } from '../domain/types';

export interface PackEntity {
  name: string;
  description: string;
}

export interface PackWorkflow {
  id: string;
  /** Spec §8 shape: Trigger → Understand → Decide → Action → Record → Follow-up */
  trigger: string;
  outcome: string;
  tools: string[];
}

export interface PackTool {
  id: string;
  label: string;
  defaultPermission: PermissionClass;
}

export interface QualificationRule {
  id: string;
  label: string;
  /** Human-readable condition, shown as evidence when it fires */
  condition: string;
  effect: string;
}

export interface VerticalPack {
  id: string;
  name: string;
  status: 'live' | 'planned';
  summary: string;
  /** Maps universal concepts to industry words, e.g. appointment → "viewing" */
  terminology: Record<string, string>;
  customerTypes: string[];
  entities: PackEntity[];
  requiredLeadFields: string[];
  qualificationRules: QualificationRule[];
  workflows: PackWorkflow[];
  tools: PackTool[];
}
