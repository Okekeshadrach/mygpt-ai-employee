'use client';

import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Radio, User } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ApiState } from '@/components/api-state';
import { CHANNEL_LABEL, PriorityBadge, STAGE, StageBadge } from '@/components/badges';
import { LeadDetail } from '@/components/crm/lead-detail';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { cn, formatMoney, timeAgo } from '@/lib/utils';
import type { LeadStage, LeadView, PropertyView, Tenant } from '@/lib/types';

const PIPELINE: LeadStage[] = ['new', 'qualifying', 'qualified', 'viewing_scheduled', 'offer', 'nurturing', 'won', 'lost'];

export default function CrmPage() {
  const { data: leads, error, loading } = useApi<LeadView[]>('/leads', ['lead.updated', 'demo.reset']);
  const { data: tenant } = useApi<Tenant>('/tenant');
  const { data: properties } = useApi<PropertyView[]>('/properties', ['demo.reset']);
  const [selectedId, setSelectedId] = useState<string>();
  const [stageFilter, setStageFilter] = useState<LeadStage | 'all' | 'hot'>('all');

  const filtered = useMemo(
    () =>
      (leads ?? []).filter((l) =>
        stageFilter === 'all' ? true : stageFilter === 'hot' ? l.priority === 'high' : l.stage === stageFilter,
      ),
    [leads, stageFilter],
  );

  // Default selection: whatever the AI touched live, else the most recent lead
  const selected =
    leads?.find((l) => l.id === selectedId) ?? leads?.find((l) => l.liveChangedFields?.length) ?? leads?.[0];
  const counts = (s: LeadStage) => leads?.filter((l) => l.stage === s).length ?? 0;
  const member = (id: string) => tenant?.team.find((t) => t.id === id);
  const detailRef = useRef<HTMLDivElement>(null);

  function select(id: string) {
    setSelectedId(id);
    // Stacked layout (below xl): bring the detail panel into view after picking a lead
    if (window.matchMedia('(max-width: 1279px)').matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  return (
    <div>
      <PageHeader
        step={4}
        title="CRM & Leads"
        description="A lightweight CRM that fills itself. Every conversation updates the lead, its requirements, stage and next action, with no copying from WhatsApp."
        spec={['§6', '§12', '§15', '§16']}
      />
      <ApiState error={error} loading={loading && !leads} />

      {leads && (
        <div className="space-y-5 px-4 py-5 sm:px-8 sm:py-6">
          {/* Stage strip */}
          <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&>button]:shrink-0">
            <button
              onClick={() => setStageFilter('all')}
              className={cn('rounded-lg border bg-card px-3 py-2 text-left text-xs transition', stageFilter === 'all' && 'ring-2 ring-brand')}
            >
              <div className="text-muted-foreground">All leads</div>
              <div className="text-lg font-semibold">{leads.length}</div>
            </button>
            <button
              onClick={() => setStageFilter('hot')}
              className={cn('rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-left text-xs transition', stageFilter === 'hot' && 'ring-2 ring-rose-400')}
            >
              <div className="text-rose-700">High intent</div>
              <div className="text-lg font-semibold text-rose-900">{leads.filter((l) => l.priority === 'high').length}</div>
            </button>
            <div className="mx-1 w-px shrink-0 bg-border" />
            {PIPELINE.map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(stageFilter === s ? 'all' : s)}
                className={cn('rounded-lg border bg-card px-3 py-2 text-left text-xs transition hover:bg-muted/50', stageFilter === s && 'ring-2 ring-brand')}
              >
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className={cn('size-2 rounded-full', STAGE[s].className.split(' ')[0])} />
                  {STAGE[s].label}
                </div>
                <div className="text-lg font-semibold">{counts(s)}</div>
              </button>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
            {/* Lead table */}
            <Card className="overflow-hidden">
              {/* Phones: stacked cards */}
              <ul className="divide-y md:hidden">
                {filtered.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => select(l.id)}
                      className={cn('w-full px-4 py-3 text-left transition-colors', selected?.id === l.id ? 'bg-brand-soft/50' : 'active:bg-muted/40')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[14px] font-medium">{l.customer.name}</span>
                            {l.liveChangedFields?.length ? <Radio className="size-3.5 text-emerald-600" /> : null}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            <span className="capitalize">{l.intent}</span> · {l.locations.slice(0, 2).join(', ')} · {CHANNEL_LABEL[l.source]}
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-[13px] font-semibold">
                          {formatMoney(l.budget.max, l.budget.currency, { compact: true })}
                          {(l.intent === 'rent' || l.intent === 'lease out') && <span className="text-xs font-normal text-muted-foreground">/mo</span>}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <StageBadge stage={l.stage} />
                        {l.priority === 'high' && <PriorityBadge priority="high" />}
                        <span className="ml-auto text-[11px] text-muted-foreground">{timeAgo(l.updatedAt)}</span>
                      </div>
                      <div className="mt-2 flex items-start gap-1.5 text-[12.5px]">
                        {l.nextAction.owner === 'ai' ? (
                          <Bot className="mt-0.5 size-3.5 shrink-0 text-brand" />
                        ) : (
                          <User className="mt-0.5 size-3.5 shrink-0 text-slate-500" />
                        )}
                        <span className="line-clamp-2">
                          {l.nextAction.label}
                          <span className="text-muted-foreground"> · {member(l.assignedTo)?.name}</span>
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Tablet & desktop: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Customer</th>
                      <th className="px-3 py-2.5 font-medium">Stage</th>
                      <th className="px-3 py-2.5 font-medium">Budget</th>
                      <th className="px-3 py-2.5 font-medium">Next action</th>
                      <th className="px-4 py-2.5 text-right font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((l) => (
                      <motion.tr
                        layout
                        key={l.id}
                        onClick={() => select(l.id)}
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/40',
                          selected?.id === l.id && 'bg-brand-soft/50 hover:bg-brand-soft/60',
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{l.customer.name}</span>
                            {l.priority === 'high' && <PriorityBadge priority="high" />}
                            {l.liveChangedFields?.length ? (
                              <span title="Updated live by Ava" className="text-emerald-600"><Radio className="size-3.5" /></span>
                            ) : null}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="capitalize">{l.intent}</span> · {l.locations.slice(0, 2).join(', ')} · {CHANNEL_LABEL[l.source]}
                          </div>
                        </td>
                        <td className="px-3 py-3"><StageBadge stage={l.stage} /></td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium">
                          {formatMoney(l.budget.max, l.budget.currency, { compact: true })}
                          {(l.intent === 'rent' || l.intent === 'lease out') && <span className="text-xs font-normal text-muted-foreground">/mo</span>}
                        </td>
                        <td className="max-w-[260px] px-3 py-3">
                          <div className="flex items-start gap-1.5">
                            {l.nextAction.owner === 'ai' ? (
                              <Bot className="mt-0.5 size-3.5 shrink-0 text-brand" />
                            ) : (
                              <User className="mt-0.5 size-3.5 shrink-0 text-slate-500" />
                            )}
                            <span className="line-clamp-2">{l.nextAction.label}</span>
                          </div>
                          <div className="pl-5 text-[11px] text-muted-foreground">{member(l.assignedTo)?.name}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-muted-foreground">{timeAgo(l.updatedAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t bg-muted/30 px-4 py-2.5 text-[11.5px] text-muted-foreground">
                <span className="flex items-center gap-1"><Bot className="size-3.5 text-brand" /> AI owns the next action</span>
                <span className="flex items-center gap-1"><User className="size-3.5" /> Human owns the next action</span>
                <span className="flex items-center gap-1"><Radio className="size-3.5 text-emerald-600" /> Updated live this session</span>
              </div>
            </Card>

            {/* Detail */}
            <Card ref={detailRef} className="h-fit scroll-mt-16 p-4 sm:p-5 xl:sticky xl:top-4">
              {selected && tenant && (
                <LeadDetail key={selected.id} lead={selected} team={tenant.team} properties={properties ?? []} />
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
