// Same-origin by default: next.config.mjs proxies /api and /socket.io to the backend.
// Set these only to bypass the proxy and hit the API directly.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';
export const SOCKET_URL: string | undefined = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
/** HOOK(auth): comes from the session once auth exists. */
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'tnt_baycrest';

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', 'x-tenant-id': TENANT_ID, ...init?.headers },
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(`Can't reach the MyGPT API at ${API_URL}. Is the backend running?`, 0, 'UNREACHABLE');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error?.message ?? res.statusText, res.status, body?.error?.code);
  return body.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
};
