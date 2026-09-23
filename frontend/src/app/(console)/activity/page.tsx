'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarCheck,
  CheckCheck,
  ChevronDown,
  Hand,
  MessageSquare,
  Radio,
  Repeat,
  Search,
  Siren,
  UserPlus,
  UserCheck,
  Clock,
  Users,
  CalendarDays,
  Timer,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ApiState } from '@/components/api-state';
import { CHANNEL_LABEL, PermissionBadge } from '@/components/badges';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { cn, timeAgo } from '@/lib/utils';
import type { ActivityEvent, ActivityType, Overview } from '@/lib/types';

const TYPE: Record<ActivityType, { label: string; icon: typeof MessageSquare; className: string }> = {
  conversation: { label: 'Conversation', icon: MessageSquare, className: 'bg-sky-100 text-sky-700' },
  lead_captured: { label: 'Lead captured', icon: UserPlus, className: 'bg-indigo-100 text-indigo-700' },
  lead_qualified: { label: 'Lead qualified', icon: UserCheck, className: 'bg-violet-100 text-violet-700' },
  match: { label: 'Customer matched', icon: Search, className: 'bg-teal-100 text-teal-700' },
  viewing_scheduled: { label: 'Viewing scheduled', icon: CalendarCheck, className: 'bg-emerald-100 text-emerald-700' },
  follow_up: { label: 'Follow-up', icon: Repeat, className: 'bg-slate-100 text-slate-700' },
  escalation: { label: 'Escalation', icon: Siren, className: 'bg-rose-100 text-rose-700' },
  approval_requested: { label: 'Awaiting approval', icon: Hand, className: 'bg-amber-100 text-amber-700' },
  approval_decided: { label: 'Approval decided', icon: CheckCheck, className: 'bg-amber-50 text-amber-800' },
  issue: { label: 'Needs attention', icon: AlertTriangle, className: 'bg-orange-100 text-orange-700' },
};

const FILTERS: { id: string; label: string; types?: ActivityType[] }[] = [
  { id: 'all', label: 'All' },
  { id: 'leads', label: 'Leads', types: ['lead_captured', 'lead_qualified', 'match'] },
  { id: 'viewings', label: 'Viewings', types: ['viewing_scheduled', 'follow_up'] },
  { id: 'escalations', label: 'Escalations', types: ['escalation'] },
  { id: 'approvals', label: 'Approvals', types: ['approval_requested', 'approval_decided'] },
  { id: 'issues', label: 'Issues & guardrails', types: ['issue'] },
];

export default function ActivityPage() {
  const { data: events, error, loading } = useApi<ActivityEvent[]>('/activity', ['activity.created', 'demo.reset']);
  const { data: overview } = useApi<Overview>('/overview', ['activity.created', 'approval.updated', 'demo.reset']);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState<string>();

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    return (events ?? []).filter((e) => !f?.types || f.types.includes(e.type));
  }, [events, filter]);

  const s = overview?.stats;
  const tiles = s
    ? [
        { label: 'Conversations today', value: s.conversationsToday, icon: MessageSquare },
        { label: 'Leads captured (7d)', value: s.leadsCaptured7d, icon: Users },
        { label: 'Viewings booked (7d)', value: s.viewingsBooked7d, icon: CalendarDays },
        { label: 'Escalations (24h)', value: s.escalationsOpen, icon: Siren },
        { label: 'Awaiting approval', value: s.approvalsPending, icon: Hand },
        { label: 'Avg. first response', value: `${s.avgFirstResponseSec}s`, icon: Timer },
      ]
    : [];

  return (
    <div>
      <PageHeader
        step={5}
        title="AI Activity Feed & Audit Trail"
        description="What your AI employee did, and why. Every entry opens to show the evidence and a full audit record: trigger, context, Brain sources, tool, arguments, result and approval status."
        spec={['§16', '§21', '§24']}
      />
      <ApiState error={error} loading={loading && !events} />

      {events && (
        <div className="space-y-5 px-4 py-5 sm:px-8 sm:py-6">
          {/* Daily brief */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {tiles.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="p-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs">{label}</span>
                  <Icon className="size-4" />
                </div>
                <div className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</div>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition',
                    filter === f.id ? 'border-ink bg-ink text-white' : 'bg-card hover:bg-muted',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Radio className="size-3.5 text-emerald-600" /> New events stream in live
            </span>
          </div>

          <Card className="divide-y overflow-hidden">
            <AnimatePresence initial={false}>
              {shown.map((e) => {
                const t = TYPE[e.type];
                const Icon = t.icon;
                const isOpen = open === e.id;
                return (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, backgroundColor: 'rgba(16,185,129,0.14)' }}
                    animate={{ opacity: 1, backgroundColor: 'rgba(16,185,129,0)' }}
                    transition={{ backgroundColor: { duration: 2.5 } }}
                  >
                    <button onClick={() => setOpen(isOpen ? undefined : e.id)} className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-muted/30 sm:gap-3.5 sm:px-5">
                      <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', t.className)}>
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-medium">{e.title}</span>
                          {e.live && (
                            <span className="rounded-full bg-brand-soft px-1.5 py-px text-[10px] font-semibold text-emerald-800">LIVE</span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[12.5px] text-muted-foreground">{e.description}</div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <PermissionBadge value={e.permissionClass} />
                          <span>{t.label}</span>
                          {e.channel && <span>· {CHANNEL_LABEL[e.channel]}</span>}
                          <span>· tool <code className="font-mono">{e.audit.tool}</code></span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground sm:gap-2 sm:text-xs">
                        <Clock className="hidden size-3 sm:block" />
                        {timeAgo(e.at)}
                        <ChevronDown className={cn('size-4 transition', isOpen && 'rotate-180')} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-4 bg-muted/30 px-4 pb-5 pt-1 sm:px-5 sm:pl-[68px] lg:grid-cols-2">
                            <div>
                              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Evidence</div>
                              <ul className="space-y-1.5">
                                {e.evidence.map((ev) => (
                                  <li key={ev.label} className="rounded-lg border bg-card px-3 py-2 text-[12.5px]">
                                    <span className="font-medium">{ev.label}</span>: {ev.detail}
                                    {ev.source && <div className="text-[11px] text-muted-foreground">Source: {ev.source}</div>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Audit record</div>
                              <dl className="divide-y rounded-lg border bg-card text-[12px]">
                                {[
                                  ['Trigger', e.audit.trigger],
                                  ['Context used', e.audit.contextUsed.join(' · ')],
                                  ['Brain sources', e.audit.brainSources.join(' · ')],
                                  ['Tool', e.audit.tool],
                                  ['Result', e.audit.result],
                                  ['Approval', e.audit.approval.replace('_', ' ')],
                                  ['Final action', e.audit.finalAction],
                                  ...(e.audit.humanOverride ? [['Human override', e.audit.humanOverride]] : []),
                                  ...(e.audit.error ? [['Error', e.audit.error]] : []),
                                  ['Timestamp', new Date(e.at).toISOString()],
                                ].map(([k, v]) => (
                                  <div key={k} className="grid grid-cols-[92px_1fr] gap-2 px-3 py-1.5 sm:grid-cols-[110px_1fr]">
                                    <dt className="text-muted-foreground">{k}</dt>
                                    <dd className={cn(k === 'Tool' || k === 'Timestamp' ? 'font-mono text-[11px]' : '')}>{v}</dd>
                                  </div>
                                ))}
                                {Object.keys(e.audit.args).length > 0 && (
                                  <div className="grid grid-cols-[92px_1fr] gap-2 px-3 py-1.5 sm:grid-cols-[110px_1fr]">
                                    <dt className="text-muted-foreground">Arguments</dt>
                                    <dd>
                                      <pre className="overflow-x-auto rounded bg-ink px-2 py-1.5 font-mono text-[10.5px] text-emerald-200">
                                        {JSON.stringify(e.audit.args, null, 2)}
                                      </pre>
                                    </dd>
                                  </div>
                                )}
                              </dl>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Card>
        </div>
      )}
    </div>
  );
}
