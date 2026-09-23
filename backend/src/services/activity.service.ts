import type { ActivityEvent } from '../domain/types';
import { getStore } from '../data';
import { publish } from '../realtime/socket';

let seq = 0;
export const newActivityId = () => `act_live_${Date.now().toString(36)}_${++seq}`;

export async function listActivity(tenantId: string) {
  const events = await getStore().listActivity(tenantId);
  return events.sort((a, b) => b.at.localeCompare(a.at));
}

/** Every important AI action lands here: feed + audit trail (spec §16, §21). */
export async function recordActivity(tenantId: string, event: Omit<ActivityEvent, 'id' | 'at'> & { at?: string }) {
  const saved = await getStore().addActivity(tenantId, {
    ...event,
    id: newActivityId(),
    at: event.at ?? new Date().toISOString(),
  });
  publish(tenantId, 'activity.created', saved);
  return saved;
}
