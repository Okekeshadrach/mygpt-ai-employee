/**
 * Realtime fan-out (Socket.IO). One room per tenant: `tenant:<id>`.
 * With ENABLE_REDIS_ADAPTER=true, events are pub/sub'd through Redis so any number of backend
 * instances stay in sync (same pattern as fansibly). Falls back to in-memory if Redis is down.
 */
import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../config';

export type RealtimeEvent = 'lead.updated' | 'activity.created' | 'approval.updated' | 'demo.reset';

let io: Server | undefined;

async function attachRedisAdapter(server: Server) {
  try {
    const [{ createClient }, { createAdapter }] = await Promise.all([
      import('redis'),
      import('@socket.io/redis-adapter'),
    ]);
    const reconnectStrategy = (retries: number) =>
      retries > 5 ? new Error('Redis unavailable') : Math.min(retries * 200, 1000);
    const pub = createClient({ url: config.redisUrl, socket: { reconnectStrategy, connectTimeout: 3000 } });
    const sub = pub.duplicate();
    pub.on('error', (e) => console.warn('[realtime] redis pub error:', e.message));
    sub.on('error', (e) => console.warn('[realtime] redis sub error:', e.message));
    await Promise.all([pub.connect(), sub.connect()]);
    server.adapter(createAdapter(pub, sub));
    console.log(`[realtime] Socket.IO redis adapter attached (${config.redisUrl})`);
  } catch (err) {
    console.warn(`[realtime] Redis adapter unavailable, using in-memory adapter: ${(err as Error).message}`);
  }
}

export async function initRealtime(httpServer: HttpServer) {
  io = new Server(httpServer, { cors: { origin: config.corsOrigin } });
  if (config.enableRedisAdapter) await attachRedisAdapter(io);

  io.on('connection', (socket) => {
    // HOOK(auth): derive tenant from the authenticated session, not client-supplied auth.
    const tenantId = String(socket.handshake.auth?.tenantId ?? config.defaultTenantId);
    socket.join(`tenant:${tenantId}`);
  });
}

export function publish(tenantId: string, event: RealtimeEvent, payload: unknown) {
  io?.to(`tenant:${tenantId}`).emit(event, payload);
}
