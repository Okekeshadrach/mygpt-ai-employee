'use client';

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck,
  CircleUserRound,
  Flag,
  History,
  MessageSquare,
  Send,
  Sparkles,
  Target,
  ThumbsDown,
  UserCheck,
  Eye,
  Handshake,
  StickyNote,
  Radio,
} from 'lucide-react';
import { Flash } from './flash';
import { CHANNEL_LABEL, PriorityBadge, StageBadge } from '@/components/badges';
import { cn, formatDateTime, formatMoney, timeAgo } from '@/lib/utils';
import type { LeadView, MemoryEvent, PropertyView, TeamMember } from '@/lib/types';

const MEMORY_ICON: Record<MemoryEvent['kind'], typeof History> = {
  conversation: MessageSquare,
  requirement: Target,
  objection: ThumbsDown,
  viewing: Eye,
  commitment: Handshake,
  stage_change: Flag,
  handoff: UserCheck,
  note: StickyNote,
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-2 py-1.5 text-[13px]">
      <div className="text-muted-foreground">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children, action }: { title: string; icon: typeof History; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <Icon className="size-3.5" /> {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function LeadDetail({
  lead,
  team,
  properties,
  compact,
}: {
  lead: LeadView;
  team: TeamMember[];
  properties: PropertyView[];
  compact?: boolean;
}) {
  const member = (id?: string) => team.find((t) => t.id === id);
  const interested = lead.interestedPropertyIds.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as PropertyView[];
  const memory = [...lead.customer.memory].sort((a, b) => b.at.localeCompare(a.at));
  const budget =
    (lead.budget.min ? `${formatMoney(lead.budget.min, lead.budget.currency, { compact: true })}–` : 'up to ') +
    formatMoney(lead.budget.max, lead.budget.currency, { compact: true });

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-ink text-sm font-semibold text-white">
          {lead.customer.name.split(' ').map((p) => p[0]).join('')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{lead.customer.name}</span>
            <span className="rounded bg-secondary px-1.5 py-px text-[10.5px] capitalize text-muted-foreground">{lead.customer.customerType}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {lead.customer.phone} · via {CHANNEL_LABEL[lead.source]} · first seen {timeAgo(lead.customer.firstSeenAt)}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Flash watch={lead.stage} className="mx-0 px-0">
              <StageBadge stage={lead.stage} />
            </Flash>
            <Flash watch={lead.priority} className="mx-0 px-0">
              <PriorityBadge priority={lead.priority} />
            </Flash>
            {lead.liveChangedFields?.length ? (
              <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] font-medium text-emerald-800">
                <Radio className="size-3" /> Updated live by Ava
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* AI summary */}
      <Flash watch={lead.aiSummary}>
        <div className="flex gap-2 rounded-lg bg-muted/60 p-3 text-[13px] leading-relaxed">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand" />
          <span>{lead.aiSummary}</span>
        </div>
      </Flash>

      {/* Handoff briefing (spec §15 human handoff) */}
      <AnimatePresence>
        {lead.handoff && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700">
                <Send className="size-3.5" /> Handoff briefing → {member(lead.handoff.toTeamMemberId)?.name}
              </div>
              <span className="text-[11px] text-muted-foreground">{timeAgo(lead.handoff.sentAt)} · {lead.handoff.channel}</span>
            </div>
            <div className="mt-2 text-[13.5px] font-medium">{lead.handoff.headline}</div>
            <ul className="mt-2 space-y-1 text-[12.5px] text-foreground/80">
              {lead.handoff.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-rose-400" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-[12.5px]">
              <span className="font-medium">Recommended next action:</span> {lead.handoff.recommendedNextAction}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requirements */}
      <Section title="Requirements" icon={Target}>
        <div className="divide-y rounded-lg border px-3">
          <Row label="Intent"><span className="capitalize">{lead.intent}</span> · {lead.timeline}</Row>
          <Row label="Budget"><Flash watch={lead.budget}><span className="font-medium">{budget}</span></Flash></Row>
          <Row label="Areas"><Flash watch={lead.locations}>{lead.locations.join(', ')}</Flash></Row>
          <Row label="Needs">
            <Flash watch={lead.requirements}>
              <div className="flex flex-wrap gap-1">
                {lead.requirements.map((r) => (
                  <span key={r} className="rounded bg-secondary px-1.5 py-0.5 text-[11.5px]">{r}</span>
                ))}
              </div>
            </Flash>
          </Row>
          <Row label="Financing"><Flash watch={lead.financing}>{lead.financing}</Flash></Row>
          {lead.objections.length > 0 && (
            <Row label="Objections"><Flash watch={lead.objections}>{lead.objections.join('; ')}</Flash></Row>
          )}
          <Row label="Assigned">{member(lead.assignedTo)?.name ?? '—'}</Row>
        </div>
      </Section>

      {/* Next action */}
      <Flash watch={lead.nextAction}>
        <div className="flex items-start gap-3 rounded-lg border border-brand/30 bg-brand-soft/60 px-3 py-2.5">
          <Flag className="mt-0.5 size-4 shrink-0 text-brand" />
          <div className="text-[13px]">
            <div className="font-medium">Next action: {lead.nextAction.label}</div>
            <div className="text-xs text-muted-foreground">
              {lead.nextAction.owner === 'ai' ? 'Ava (AI)' : member(lead.nextAction.assigneeId)?.name ?? 'Human'} · due {timeAgo(lead.nextAction.dueAt)}
            </div>
          </div>
        </div>
      </Flash>

      {/* Priority evidence (spec §16: no black-box scores) */}
      <Section title="Why this priority" icon={CircleUserRound}>
        <Flash watch={lead.priorityEvidence}>
          <ul className="space-y-1">
            {lead.priorityEvidence.map((e) => (
              <li key={e.label} className="flex items-start gap-2 text-[12.5px]">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                <span>
                  <span className="font-medium">{e.label}</span>: {e.detail}
                  {e.source && <span className="text-muted-foreground"> · {e.source}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Flash>
      </Section>

      {/* Properties */}
      {interested.length > 0 && (
        <Section title="Properties discussed" icon={Eye}>
          <Flash watch={lead.interestedPropertyIds}>
            <div className={cn('grid gap-2', compact ? 'grid-cols-3' : 'grid-cols-3')}>
              {interested.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-lg border">
                  <img src={p.photo} alt={p.title} className="aspect-[4/3] w-full object-cover" />
                  <div className="px-2 py-1.5">
                    <div className="font-mono text-[10px] text-muted-foreground">{p.ref}</div>
                    <div className="text-[11.5px] font-medium">{formatMoney(p.price, p.currency, { compact: true })}</div>
                  </div>
                </div>
              ))}
            </div>
          </Flash>
        </Section>
      )}

      {/* Appointments */}
      {lead.appointments.length > 0 && (
        <Section title="Viewings" icon={CalendarCheck}>
          <Flash watch={lead.appointments}>
            <div className="space-y-1.5">
              {lead.appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-[12.5px]">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.location} · with {member(a.withTeamMemberId)?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatDateTime(a.at)}</div>
                    <div className="text-[11px] capitalize text-emerald-700">{a.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </Flash>
        </Section>
      )}

      {/* Memory timeline (spec §6, §16) */}
      <Section title="Memory timeline" icon={History}>
        <ol className="relative space-y-3 border-l pl-4">
          <AnimatePresence initial={false}>
            {(compact ? memory.slice(0, 5) : memory).map((m) => {
              const Icon = MEMORY_ICON[m.kind];
              return (
                <motion.li key={m.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="relative">
                  <span
                    className={cn(
                      'absolute -left-[25px] top-0.5 flex size-[18px] items-center justify-center rounded-full border bg-card',
                      m.live && 'border-brand bg-brand text-white',
                    )}
                  >
                    <Icon className="size-2.5" />
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12.5px] font-medium">{m.title}</span>
                    <span className="shrink-0 text-[10.5px] text-muted-foreground">{timeAgo(m.at)}</span>
                  </div>
                  <div className="text-[12px] text-muted-foreground">{m.detail}</div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </Section>

      {!compact && lead.humanNotes.length > 0 && (
        <Section title="Human notes" icon={StickyNote}>
          {lead.humanNotes.map((n) => (
            <p key={n} className="rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">{n}</p>
          ))}
        </Section>
      )}
    </div>
  );
}
