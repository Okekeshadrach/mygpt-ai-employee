'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Globe, Home, Loader2, Lock, ShieldAlert, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ApiState } from '@/components/api-state';
import { PermissionBadge } from '@/components/badges';
import { SpecRef } from '@/components/spec-ref';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { cn, timeAgo } from '@/lib/utils';
import type { Approval } from '@/lib/types';

export default function ApprovalsPage() {
  const { data, error, loading, refetch } = useApi<Approval[]>('/approvals', ['approval.updated', 'demo.reset']);
  const pending = data?.filter((a) => a.status === 'pending') ?? [];
  const humanOnly = data?.filter((a) => a.status === 'human_only') ?? [];
  const decided = data?.filter((a) => a.status === 'approved' || a.status === 'rejected') ?? [];

  return (
    <div>
      <PageHeader
        step={6}
        title="Approvals"
        description="MyGPT never has unlimited authority. It prepares restricted actions with the evidence and exact changes, and nothing happens until the owner decides."
        spec={['§10', '§13', '§20']}
      />
      <ApiState error={error} loading={loading && !data} />

      {data && (
        <div className="grid gap-6 px-4 py-5 sm:px-8 sm:py-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              Waiting for Sarah
              <span className="rounded-full bg-amber-400 px-2 text-xs font-semibold text-ink">{pending.length}</span>
            </div>
            <AnimatePresence initial={false}>
              {pending.map((a) => (
                <motion.div key={a.id} layout exit={{ opacity: 0, x: 40, height: 0 }} transition={{ duration: 0.35 }}>
                  <ApprovalCard approval={a} onDecided={refetch} />
                </motion.div>
              ))}
            </AnimatePresence>
            {pending.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">All caught up. Nothing is waiting for approval.</Card>
            )}

            {humanOnly.map((a) => (
              <Card key={a.id} className="border-rose-200 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <PermissionBadge value="human_only" />
                    <h3 className="mt-2 text-[15px] font-semibold">{a.title}</h3>
                    <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{a.summary}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Diff approval={a} />
                  <EvidenceList approval={a} />
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-800">
                  <Lock className="size-4 shrink-0" />
                  The AI cannot execute this, even with approval. A briefing has been sent to Oliver; the decision stays with a human.
                </div>
              </Card>
            ))}
          </div>

          {/* History + policy */}
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Decision history</div>
                <SpecRef sections={['§21']} />
              </div>
              <ul className="mt-3 space-y-2.5">
                <AnimatePresence initial={false}>
                  {decided.map((a) => (
                    <motion.li
                      key={a.id}
                      layout
                      initial={{ opacity: 0, backgroundColor: 'rgba(16,185,129,0.18)' }}
                      animate={{ opacity: 1, backgroundColor: 'rgba(16,185,129,0)' }}
                      transition={{ backgroundColor: { duration: 2.5 } }}
                      className="rounded-lg border px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[12.5px] font-medium leading-snug">{a.title}</span>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold capitalize',
                            a.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600',
                          )}
                        >
                          {a.status}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {a.decidedBy} · {a.decidedAt ? timeAgo(a.decidedAt) : ''}
                        {a.decisionNote ? ` · “${a.decisionNote}”` : ''}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </Card>
            <Card className="p-5 text-[12.5px] text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldAlert className="size-4 text-amber-500" /> Why these need approval
              </div>
              <p>Rules come from the owner’s permission policy in the Business Brain, configurable per business and per vertical.</p>
              <ul className="mt-2 space-y-1">
                <li>• Changing a listing price: <span className="text-amber-700">approval required</span></li>
                <li>• Publishing website pages: <span className="text-amber-700">approval required</span>, never auto-published</li>
                <li>• Fee discounts: <span className="text-amber-700">approval required</span></li>
                <li>• Accepting offers, payments, contracts: <span className="text-rose-700">human only</span></li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function Diff({ approval }: { approval: Approval }) {
  if (!approval.diff.length) return null;
  return (
    <div className="rounded-lg border">
      <div className="border-b bg-muted/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Exact changes</div>
      <div className="divide-y">
        {approval.diff.map((d) => (
          <div key={d.field} className="px-3 py-2 text-[12.5px]">
            <div className="text-[11px] text-muted-foreground">{d.field}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              {d.before === '—' ? (
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">new</span>
              ) : (
                <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700 line-through decoration-rose-300">{d.before}</span>
              )}
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-800">{d.after}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceList({ approval }: { approval: Approval }) {
  return (
    <div className="rounded-lg border">
      <div className="border-b bg-muted/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Evidence</div>
      <ul className="divide-y">
        {approval.evidence.map((e) => (
          <li key={e.label} className="px-3 py-2 text-[12.5px]">
            <span className="font-medium">{e.label}</span>: {e.detail}
            {e.source && <div className="text-[11px] text-muted-foreground">{e.source}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Preview({ approval }: { approval: Approval }) {
  const p = approval.preview;
  if (!p) return null;
  if (p.kind === 'website') {
    return (
      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center gap-1.5 border-b bg-muted/60 px-3 py-1.5">
          <span className="size-2 rounded-full bg-rose-300" />
          <span className="size-2 rounded-full bg-amber-300" />
          <span className="size-2 rounded-full bg-emerald-300" />
          <span className="ml-2 flex items-center gap-1 rounded bg-background px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
            <Globe className="size-3" /> baycrestrealty.com/coral-gables-family-homes
          </span>
          <span className="ml-auto rounded bg-violet-100 px-1.5 py-px text-[10px] font-semibold text-violet-700">DRAFT</span>
        </div>
        <div className="bg-gradient-to-br from-[#14213d] to-[#1f3a5f] px-5 py-6 text-white">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#e9d8a6]">Baycrest Realty</div>
          <div className="mt-1 font-display text-2xl italic">{p.title}</div>
          <div className="mt-3 inline-block rounded-full bg-[#e9d8a6] px-3 py-1 text-[11px] font-semibold text-[#14213d]">Chat with Ava on WhatsApp</div>
        </div>
        <ul className="space-y-1 px-4 py-3 text-[12px] text-muted-foreground">
          {p.lines.map((l) => <li key={l}>• {l}</li>)}
        </ul>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-12 items-center justify-center rounded-lg bg-muted"><Home className="size-5 text-muted-foreground" /></div>
      <div>
        <div className="text-[13px] font-medium">{p.title}</div>
        {p.lines.map((l, i) => (
          <div key={l} className={cn('text-[12px]', i === 0 ? 'font-semibold text-emerald-700' : 'text-muted-foreground')}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function ApprovalCard({ approval: a, onDecided }: { approval: Approval; onDecided: () => void }) {
  const [busy, setBusy] = useState<'approved' | 'rejected'>();
  const [note, setNote] = useState('');

  async function decide(decision: 'approved' | 'rejected') {
    setBusy(decision);
    try {
      await api.post(`/approvals/${a.id}/decision`, { decision, note: note || undefined });
      onDecided();
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <Card className="border-amber-200 p-4 shadow-md sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PermissionBadge value="approval_required" />
            <code className="font-mono text-[10.5px] text-muted-foreground">{a.actionId}</code>
          </div>
          <h3 className="mt-2 text-[15px] font-semibold">{a.title}</h3>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{a.summary}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{timeAgo(a.createdAt)}</div>
          <div>by {a.requestedBy}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          <Diff approval={a} />
          <Preview approval={a} />
        </div>
        <EvidenceList approval={a} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
        <span className="text-[12px] text-muted-foreground">Impact: {a.impact}</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note to the team…"
          className="h-9 w-full rounded-md border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring sm:ml-auto sm:w-auto sm:min-w-[200px] sm:flex-1 md:max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={() => void decide('rejected')} disabled={!!busy}>
          {busy === 'rejected' ? <Loader2 className="animate-spin" /> : <X />} Reject
        </Button>
        <Button variant="brand" size="sm" onClick={() => void decide('approved')} disabled={!!busy}>
          {busy === 'approved' ? <Loader2 className="animate-spin" /> : <Check />} Approve
        </Button>
      </div>
    </Card>
  );
}
