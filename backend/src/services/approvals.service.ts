import { getStore } from '../data';
import { publish } from '../realtime/socket';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { recordActivity } from './activity.service';

export async function listApprovals(tenantId: string) {
  const approvals = await getStore().listApprovals(tenantId);
  const rank = { pending: 0, human_only: 1, approved: 2, rejected: 3 } as const;
  // Stable sort: pending keep their queue order; decided ones newest first
  return approvals.sort(
    (a, b) => rank[a.status] - rank[b.status] || (a.decidedAt && b.decidedAt ? b.decidedAt.localeCompare(a.decidedAt) : 0),
  );
}

/**
 * Owner decision on an approval-required action (spec §10).
 * HOOK(auth): `decidedBy` must come from the authenticated owner/role, not a default.
 */
export async function decideApproval(
  tenantId: string,
  approvalId: string,
  decision: 'approved' | 'rejected',
  note?: string,
  decidedBy = 'Sarah Mitchell',
) {
  const store = getStore();
  const approval = await store.getApproval(tenantId, approvalId);
  if (!approval) throw new NotFoundError(`Approval ${approvalId} not found`);
  if (approval.status === 'human_only') {
    throw new ForbiddenError('Human-only actions cannot be approved for the AI to execute');
  }
  if (approval.status !== 'pending') throw new BadRequestError(`Approval already ${approval.status}`);

  const updated = await store.updateApproval(tenantId, approvalId, {
    status: decision,
    decidedAt: new Date().toISOString(),
    decidedBy,
    decisionNote: note,
  });
  publish(tenantId, 'approval.updated', updated);

  await recordActivity(tenantId, {
    type: 'approval_decided',
    title: `${decision === 'approved' ? 'Approved' : 'Rejected'} by ${decidedBy.split(' ')[0]}: ${approval.title}`,
    description:
      decision === 'approved'
        ? 'Owner approved. The prepared action was executed and recorded.'
        : 'Owner rejected. Nothing was changed; the requester has been informed.',
    permissionClass: 'approval_required',
    evidence: approval.evidence.slice(0, 2),
    live: true,
    audit: {
      trigger: `Approval request ${approval.id}`,
      contextUsed: [approval.summary],
      brainSources: ['Permissions: ' + approval.actionId],
      tool: approval.actionId,
      args: Object.fromEntries(approval.diff.map((d) => [d.field, d.after])),
      result: decision === 'approved' ? 'Executed after approval' : 'Not executed',
      approval: decision,
      finalAction: decision === 'approved' ? 'Change applied' : 'Discarded',
      humanOverride: note || undefined,
    },
  });
  return updated;
}
