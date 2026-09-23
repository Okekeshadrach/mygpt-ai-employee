/**
 * /api/v1. Thin handlers only: parse input → call a service → return `{ data }`.
 * Spec section per route group is noted so the API itself narrates the architecture.
 */
import { Router } from 'express';
import { handle } from '../utils/async-handler';
import { BadRequestError } from '../utils/errors';
import * as brain from '../services/brain.service';
import * as crm from '../services/crm.service';
import * as activity from '../services/activity.service';
import * as approvals from '../services/approvals.service';
import * as demo from '../services/demo.service';
import { PIPELINE_STAGES } from '../core/pipeline';
import { verticalPacks } from '../verticals';
import type { EffectId } from '../domain/demo';

export const api = Router();

// Tenant & overview (§16 Daily Business Brief)
api.get('/tenant', handle((req) => brain.getTenant(req.tenantId)));
api.get('/overview', handle((req) => brain.getOverview(req.tenantId)));

// Architecture (§2, §7, §27)
api.get('/verticals', handle(async () => verticalPacks));
api.get('/pipeline', handle(async () => PIPELINE_STAGES));

// Business Brain + onboarding (§3, §4, §5, §10, §22)
api.get('/brain', handle((req) => brain.getBrain(req.tenantId)));
api.get('/onboarding', handle((req) => brain.getOnboarding(req.tenantId)));
api.get('/properties', handle((req) => brain.listProperties(req.tenantId)));

// CRM + Customer Memory (§6, §12)
api.get('/leads', handle((req) => crm.listLeads(req.tenantId)));
api.get('/leads/:id', handle((req) => crm.getLead(req.tenantId, req.params.id)));

// Activity feed + audit trail (§16, §21)
api.get('/activity', handle((req) => activity.listActivity(req.tenantId)));

// Approvals (§10, §13)
api.get('/approvals', handle((req) => approvals.listApprovals(req.tenantId)));
api.post(
  '/approvals/:id/decision',
  handle((req) => {
    const { decision, note } = (req.body ?? {}) as { decision?: string; note?: string };
    if (decision !== 'approved' && decision !== 'rejected') {
      throw new BadRequestError('decision must be "approved" or "rejected"');
    }
    return approvals.decideApproval(req.tenantId, req.params.id, decision, note);
  }),
);

// Demo harness (§28). Not part of the product API
api.get('/demo/scenarios/:id', handle((req) => demo.getScenario(req.tenantId, req.params.id)));
api.post(
  '/demo/effects/:effect',
  handle((req) => demo.applyEffect(req.tenantId, req.params.effect as EffectId)),
);
api.post('/demo/reset', handle(async (req) => {
  await demo.resetDemo(req.tenantId);
  return { ok: true };
}));
