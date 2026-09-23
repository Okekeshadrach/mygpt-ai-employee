import { Loader2, PlugZap } from 'lucide-react';
import { API_URL } from '@/lib/api';

/** Loading / backend-down states, with an actionable message instead of a blank screen. */
export function ApiState({ error, loading }: { error?: Error; loading?: boolean }) {
  if (error) {
    return (
      <div className="m-4 flex items-start sm:m-8 gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <PlugZap className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-semibold">The MyGPT API isn’t responding</p>
          <p className="mt-1 text-amber-800">{error.message}</p>
          <p className="mt-2 text-amber-800">
            Start everything from the repo root with <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">pnpm dev</code>{' '}
            (expects the API at <code className="font-mono text-xs">{API_URL}</code>).
          </p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading…
      </div>
    );
  }
  return null;
}
