/**
 * The universal agent pipeline (spec §7). Every channel feeds this same sequence.
 * Voice notes are transcribed inside `receive`, then follow the identical path (spec §11).
 *
 * Today these definitions drive the scripted demo trace (data/fixtures/scenario.ts).
 * HOOK: the real orchestrator implements one handler per stage here, e.g.
 *   runPipeline(inbound: InboundMessage, ctx: TenantContext) → for each stage → handler(ctx)
 * Channel adapters (backend/src/channels/*, not built yet) only produce InboundMessage.
 */

export const PIPELINE_STAGES = [
  { id: 'receive', label: 'Incoming message', hint: 'Channel adapter normalises transport; voice → transcription' },
  { id: 'identify', label: 'Identify business & customer', hint: 'Tenant by channel number, customer by phone/session' },
  { id: 'retrieve', label: 'Retrieve Brain + Customer Memory', hint: 'Only this tenant’s approved facts and this customer’s history' },
  { id: 'intent', label: 'Understand intent', hint: 'Extract intent, entities and changes vs. memory' },
  { id: 'knowledge', label: 'Retrieve knowledge', hint: 'Approved knowledge + pack data (e.g. inventory), freshness-checked' },
  { id: 'workflow', label: 'Determine workflow', hint: 'Pick the pack workflow; find missing required fields' },
  { id: 'permissions', label: 'Check permissions', hint: 'Autonomous · approval-required · human-only' },
  { id: 'tools', label: 'Execute tools', hint: 'Tool layer calls; only completed results are reported' },
  { id: 'update', label: 'Update memory / CRM', hint: 'Lead, requirements, stage, next action, memory timeline' },
  { id: 'respond', label: 'Respond', hint: 'Reply in the business’s tone, on the same channel' },
  { id: 'audit', label: 'Audit', hint: 'Trigger, context, sources, tool, args, result, approval' },
] as const;

export type PipelineStageId = (typeof PIPELINE_STAGES)[number]['id'];
