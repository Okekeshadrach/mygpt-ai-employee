'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { getSocket, type RealtimeEvent } from '@/lib/socket';

/**
 * Fetch `{ data }` from the API and refetch whenever one of `refreshOn` realtime events fires.
 * Keeps the last good data while refetching (no flicker during the pitch).
 */
export function useApi<T>(path: string | null, refreshOn: RealtimeEvent[] = []) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);
  const pathRef = useRef(path);
  pathRef.current = path;

  const refetch = useCallback(async () => {
    const p = pathRef.current;
    if (!p) return;
    try {
      const d = await api.get<T>(p);
      if (pathRef.current === p) {
        setData(d);
        setError(undefined);
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void refetch();
  }, [path, refetch]);

  const events = refreshOn.join('|');
  useEffect(() => {
    if (!events) return;
    const socket = getSocket();
    const list = events.split('|');
    const handler = () => void refetch();
    list.forEach((e) => socket.on(e, handler));
    return () => list.forEach((e) => socket.off(e, handler));
  }, [events, refetch]);

  return { data, error, loading, refetch, setData };
}

/** Subscribe to realtime events with a callback receiving the payload. */
export function useRealtime<P = unknown>(event: RealtimeEvent, cb: (payload: P) => void) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    const socket = getSocket();
    const handler = (p: P) => cbRef.current(p);
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event]);
}

/** Socket connection state, used for the "live" indicator in the sidebar. */
export function useSocketStatus() {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const socket = getSocket();
    const on = () => setConnected(true);
    const off = () => setConnected(false);
    setConnected(socket.connected);
    socket.on('connect', on);
    socket.on('disconnect', off);
    socket.on('connect_error', off);
    return () => {
      socket.off('connect', on);
      socket.off('disconnect', off);
      socket.off('connect_error', off);
    };
  }, []);
  return connected;
}
