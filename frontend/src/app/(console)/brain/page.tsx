'use client';

import { useMemo, useState } from 'react';
import {
  BrainCircuit,
  Clock,
  Layers,
  ShieldCheck,
  Building2,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  GitBranch,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ApiState } from '@/components/api-state';
import { FACT_STATUS, FactStatusBadge, PERMISSION, PermissionBadge } from '@/components/badges';
import { PropertyCard } from '@/components/property-card';
import { SpecRef } from '@/components/spec-ref';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApi } from '@/hooks/use-api';
import { cn, timeAgo } from '@/lib/utils';
import type { BrainCategory, BrainResponse, FactStatus, PermissionClass, PropertyView } from '@/lib/types';

const CATEGORIES: { id: BrainCategory; label: string }[] = [
  { id: 'identity', label: 'Business identity' },
  { id: 'offerings', label: 'Products & services' },
  { id: 'pricing', label: 'Pricing & pricing rules' },
  { id: 'hours', label: 'Hours & availability' },
  { id: 'playbook', label: 'Business Playbook' },
  { id: 'policies', label: 'Policies & restrictions' },
  { id: 'team', label: 'Team' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'communication', label: 'Communication style' },
  { id: 'assets', label: 'Brand & generated assets' },
];

export default function BrainPage() {
  const { data, error, loading } = useApi<BrainResponse>('/brain', ['demo.reset']);
  const { data: properties } = useApi<PropertyView[]>('/properties', ['demo.reset']);
  const [filter, setFilter] = useState<FactStatus | 'all'>('all');

  const facts = useMemo(
    () => (data?.facts ?? []).filter((f) => filter === 'all' || f.status === filter),
    [data, filter],
  );

  const ready = data?.readiness.filter((r) => r.status === 'ready').length ?? 0;

  return (
    <div>
      <PageHeader
        step={2}
        title="Business Brain"
        description="The per-business source of truth. Every AI reply retrieves from here first, and every fact shows where it came from and whether it can be trusted."
        spec={['§3', '§5', '§10', '§22']}
      />
      <ApiState error={error} loading={loading && !data} />

      {data && (
        <div className="space-y-6 px-4 py-5 sm:px-8 sm:py-6">
          {/* Summary row */}
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1.6fr]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="size-4 text-brand" /> {data.tenant.name}
                </CardTitle>
                <CardDescription>
                  {data.tenant.industry} · {data.tenant.currency} · {data.tenant.timezone} · {data.tenant.locale} · tenant{' '}
                  <code className="font-mono">{data.tenant.id}</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">Launch readiness</span>
                  <span className="text-sm text-muted-foreground">{ready}/{data.readiness.length} ready</span>
                </div>
                <Progress className="mt-2" value={(ready / data.readiness.length) * 100} />
                <ul className="mt-3 space-y-1.5">
                  {data.readiness.filter((r) => r.status !== 'ready').map((r) => (
                    <li key={r.id} className="flex items-start gap-2 text-xs">
                      {r.status === 'needs_attention' ? (
                        <CircleAlert className="mt-px size-3.5 shrink-0 text-amber-500" />
                      ) : (
                        <CircleDashed className="mt-px size-3.5 shrink-0 text-rose-500" />
                      )}
                      <span>
                        <span className="font-medium">{r.label}</span>
                        <span className="text-muted-foreground">: {r.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Fact status</CardTitle>
                <CardDescription>
                  AI drafts and unconfirmed facts are never presented to customers as truth. Click to filter.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(Object.keys(FACT_STATUS) as FactStatus[]).map((s) => {
                  const meta = FACT_STATUS[s];
                  const Icon = meta.icon;
                  const active = filter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(active ? 'all' : s)}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 text-left transition',
                        active ? 'ring-2 ring-brand' : 'hover:bg-muted/50',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn('flex items-center gap-1.5 text-xs font-medium', meta.className.split(' ').find((c) => c.startsWith('text-')))}>
                          <Icon className="size-3.5" /> {meta.label}
                        </span>
                        <span className="text-lg font-semibold">{data.statusCounts[s] ?? 0}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{meta.description}</div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="facts">
            <TabsList className="scrollbar-thin h-auto w-full justify-start overflow-x-auto sm:w-auto">
              <TabsTrigger value="facts"><BrainCircuit className="size-4" />Facts & Playbook</TabsTrigger>
              <TabsTrigger value="permissions"><ShieldCheck className="size-4" />Permissions</TabsTrigger>
              <TabsTrigger value="inventory"><Building2 className="size-4" />Inventory</TabsTrigger>
              <TabsTrigger value="pack"><Layers className="size-4" />Vertical Pack</TabsTrigger>
            </TabsList>

            {/* Facts */}
            <TabsContent value="facts">
              {filter !== 'all' && (
                <div className="mb-3 text-sm text-muted-foreground">
                  Showing {facts.length} <FactStatusBadge status={filter} /> facts.{' '}
                  <button className="underline" onClick={() => setFilter('all')}>Show all</button>
                </div>
              )}
              <div className="grid gap-4 xl:grid-cols-2">
                {CATEGORIES.map((c) => {
                  const items = facts.filter((f) => f.category === c.id);
                  if (!items.length) return null;
                  return (
                    <Card key={c.id} className={cn(c.id === 'playbook' && 'border-brand/30 ring-1 ring-brand/10')}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          {c.label}
                          {c.id === 'playbook' && <SpecRef sections={['§5']} />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="divide-y">
                        {items.map((f) => (
                          <div key={f.id} className="py-2.5 first:pt-0 last:pb-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-[13px] font-medium">{f.label}</div>
                                <div className={cn('text-[13px] text-foreground/80', f.status === 'rejected' && 'line-through opacity-60')}>{f.value}</div>
                              </div>
                              <FactStatusBadge status={f.status} className="shrink-0" />
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                              <span>{f.source}</span>
                              <span>·</span>
                              <span>updated {timeAgo(f.updatedAt)}</span>
                              <span>·</span>
                              <span className="flex items-center gap-0.5"><GitBranch className="size-3" />v{f.version}</span>
                              {f.volatile && (
                                <span className="flex items-center gap-0.5 rounded bg-orange-50 px-1 text-orange-700">
                                  <Clock className="size-3" /> volatile · fresh for {f.freshForDays}d
                                </span>
                              )}
                            </div>
                            {f.note && <div className="mt-1 text-[11.5px] italic text-muted-foreground">{f.note}</div>}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Permissions */}
            <TabsContent value="permissions">
              <div className="grid gap-4 lg:grid-cols-3">
                {(['autonomous', 'approval_required', 'human_only'] as PermissionClass[]).map((cls) => (
                  <Card key={cls}>
                    <CardHeader className="pb-3">
                      <PermissionBadge value={cls} className="w-fit text-xs" />
                      <CardDescription className="pt-1">
                        {cls === 'autonomous' && 'MyGPT acts on its own, and every action is audited.'}
                        {cls === 'approval_required' && 'MyGPT prepares the action, then waits for the owner.'}
                        {cls === 'human_only' && 'MyGPT cannot act. It prepares a briefing and hands off.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {data.permissions.filter((p) => p.class === cls).map((p) => (
                        <div key={p.actionId} className="rounded-lg border px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-medium">{p.label}</span>
                            <span className={cn('rounded px-1.5 py-px font-mono text-[10px]', p.scope === 'core' ? 'bg-secondary text-muted-foreground' : 'bg-brand-soft text-emerald-800')}>
                              {p.scope}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2 text-[11.5px] text-muted-foreground">
                            <span>{p.rationale}</span>
                          </div>
                          <code className="mt-1 block font-mono text-[10.5px] text-muted-foreground/80">{p.actionId}</code>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Unknown actions default to <span className={cn('font-medium', PERMISSION.human_only.className.split(' ').find((c) => c.startsWith('text-')))}>human only</span>.
                MyGPT never has unlimited authority.
              </p>
            </TabsContent>

            {/* Inventory */}
            <TabsContent value="inventory">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <SpecRef sections={['§15', '§22']} />
                Synced from the agents’ Google Sheet. Listings not re-confirmed within 14 days are
                <span className="font-medium text-orange-700">withheld from customers</span>, not presented as current.
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {properties?.map((p) => <PropertyCard key={p.id} p={p} />)}
              </div>
            </TabsContent>

            {/* Vertical Pack */}
            <TabsContent value="pack">
              {data.pack && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        {data.pack.name} Pack <SpecRef sections={['§2', '§15']} />
                      </CardTitle>
                      <CardDescription>{data.pack.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Terminology mapping</div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(data.pack.terminology).map(([k, v]) => (
                            <span key={k} className="rounded-md border px-2 py-1 font-mono text-[11px]">
                              {k} → <span className="font-semibold text-emerald-700">{v}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Entities</div>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {data.pack.entities.map((e) => (
                            <div key={e.name} className="rounded-md bg-muted/60 px-2.5 py-1.5">
                              <div className="text-[12.5px] font-medium">{e.name}</div>
                              <div className="text-[11px] text-muted-foreground">{e.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Qualification rules</div>
                        {data.pack.qualificationRules.map((r) => (
                          <div key={r.id} className="mb-1.5 rounded-md border px-2.5 py-1.5 text-[12px]">
                            <span className="font-medium">{r.label}:</span> {r.condition} <span className="text-muted-foreground">→ {r.effect}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        Pack workflows <SpecRef sections={['§8']} />
                      </CardTitle>
                      <CardDescription>Trigger → Understand → Decide → Action → Record → Follow-up, run by the universal workflow engine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {data.pack.workflows.map((w) => (
                        <div key={w.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-[12.5px]">
                          <span>
                            <span className="font-medium">{w.trigger}</span>
                            <span className="text-muted-foreground"> → {w.outcome}</span>
                          </span>
                          <span className="flex flex-wrap justify-end gap-1">
                            {w.tools.map((t) => (
                              <code key={t} className="rounded bg-secondary px-1.5 py-px font-mono text-[10px] text-muted-foreground">{t}</code>
                            ))}
                          </span>
                        </div>
                      ))}
                      <div className="mt-4 rounded-lg border border-dashed p-3 text-[12px] text-muted-foreground">
                        <CheckCircle2 className="mr-1 inline size-3.5 text-brand" />
                        <span className="font-medium text-foreground">Architecture test (§27):</span> a Dental Pack swaps these
                        entities, words and workflows for patients, treatments and insurance. It reuses the same Brain, Memory,
                        agent, tools, CRM, permissions and audit.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
