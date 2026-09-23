'use client';

import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL, TENANT_ID } from './api';

export type RealtimeEvent = 'lead.updated' | 'activity.created' | 'approval.updated' | 'demo.reset';

let socket: Socket | undefined;

/** One shared connection per tab; joins the tenant room server-side. */
export function getSocket(): Socket {
  if (!socket) {
    const opts = {
      auth: { tenantId: TENANT_ID },
      // Polling first, then upgrade: works through the Next.js proxy and any reverse proxy.
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1500,
    };
    socket = SOCKET_URL ? io(SOCKET_URL, opts) : io(opts);
  }
  return socket;
}
