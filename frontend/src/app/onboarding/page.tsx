'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  FastForward,
  Mic,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { SpecRef } from '@/components/spec-ref';
import { RichText } from '@/components/rich-text';
import { ApiState } from '@/components/api-state';
import { FactStatusBadge, PERMISSION } from '@/components/badges';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useApi } from '@/hooks/use-api';
import { cn } from '@/lib/utils';
import type { BrainCategory, OnboardingScript, OnboardingTurn, PermissionClass } from '@/lib/types';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const CATEGORY_LABEL: Record<BrainCategory, string> = {
  identity: 'Business identity',
  offerings: 'Products & services',
  pricing: 'Pricing',
  hours: 'Hours & availability',
  team: 'Team',
  policies: 'Policies',
  faqs: 'FAQs',
  playbook: 'Business Playbook',
  communication: 'Communication style',
  assets: 'Assets',
};

export default function OnboardingPage() {
  const { data: script, error, loading } = useApi<OnboardingScript>('/onboarding');
  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const turns = script?.turns ?? [];
  const next = turns[shown];
  const done = script ? shown >= turns.length : false;
  const visible = turns.slice(0, shown);

  // Owner "sends" their pre-filled answer → AI types → AI replies
  async function send() {
    if (!next || next.role !== 'owner' || typing) return;
    setShown((n) => n + 1);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 1100));
    setTyping(false);
    setShown((n) => n + 1);
  }

  useEffect(() => {
    if (!autoplay || typing || done) return;
    const t = setTimeout(() => void send(), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, typing, shown, done]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [shown, typing]);

  const brain = useMemo(() => {
    const facts: NonNullable<OnboardingTurn['facts']> = [];
    const caps: string[] = [];
    const perms: { label: string; class: PermissionClass }[] = [];
    visible.forEach((t) => {
      facts.push(...(t.facts ?? []));
      caps.push(...(t.capabilities ?? []));
      perms.push(...(t.permissions ?? []));
    });
    return { facts, caps, perms };
  }, [visible]);

  const ownerTurns = turns.filter((t) => t.role === 'owner').length;
  const answered = visible.filter((t) => t.role === 'owner').length;

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card px-3 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/" className="shrink-0"><Logo /></Link>
          <div className="hidden h-6 w-px bg-border md:block" />
          <div className="hidden min-w-0 md:block">
            <div className="truncate text-sm font-medium">Onboarding: Baycrest Realty</div>
            <div className="truncate text-xs text-muted-foreground">Step 1 of 6 · the Brain is built before any customer conversation</div>
          </div>
          <SpecRef sections={['§4', '§5', '§14']} className="hidden xl:flex" />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAutoplay((a) => !a)} disabled={done}>
            {autoplay ? <Pause /> : <Play />}
            <span className="hidden sm:inline">{autoplay ? 'Pause' : 'Auto-play'}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShown(turns.length)} disabled={done}>
            <FastForward />
            <span className="hidden sm:inline">Skip to end</span>
          </Button>
          <Button asChild size="sm" variant={done ? 'brand' : 'outline'}>
            <Link href="/brain">
              <span className="hidden sm:inline">Open Business Brain</span>
              <span className="sm:hidden">Brain</span> <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      <ApiState error={error} loading={loading && !script} />

      {script && (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px]">
          {/* Conversation */}
          <section className="flex min-h-0 flex-col">
            <div ref={chatRef} className="scrollbar-thin flex-1 overflow-y-auto">
              <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
                <AnimatePresence initial={false}>
                  {visible.map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex gap-3', t.role === 'owner' && 'flex-row-reverse')}
                    >
                      <div
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                          t.role === 'ai' ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white' : 'bg-ink text-white',
                        )}
                      >
                        {t.role === 'ai' ? <Sparkles className="size-4" /> : 'SM'}
                      </div>
                      <div className={cn('max-w-[85%] space-y-2 sm:max-w-[80%]', t.role === 'owner' && 'items-end text-right')}>
                        <div
                          className={cn(
                            'inline-block rounded-2xl px-4 py-3 text-left text-[14.5px] leading-relaxed',
                            t.role === 'ai' ? 'rounded-tl-sm border bg-card shadow-sm' : 'rounded-tr-sm bg-ink text-white',
                          )}
                        >
                          <RichText text={t.text} />
                        </div>
                        {t.role === 'owner' && (t.facts?.length || t.permissions?.length) ? (
                          <div className="flex flex-wrap justify-end gap-1 text-[11px] text-muted-foreground">
                            <BrainCircuit className="size-3.5 text-brand" />
                            {t.facts?.length ? `${t.facts.length} fact${t.facts.length > 1 ? 's' : ''} added` : ''}
                            {t.facts?.length && t.permissions?.length ? ' · ' : ''}
                            {t.permissions?.length ? `${t.permissions.length} permission${t.permissions.length > 1 ? 's' : ''} set` : ''}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {typing && (
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="flex gap-1 rounded-2xl border bg-card px-4 py-3.5 shadow-sm">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${i * 120}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                {done && <Readiness script={script} />}
              </div>
            </div>

            {/* Composer: the owner's next answer is pre-filled so the presenter just presses send */}
            {!done && (
              <div className="border-t bg-card px-3 py-3 sm:px-6 sm:py-4">
                {/* Phones/tablets: the Brain side panel is hidden, so summarize what's been captured */}
                <div className="mx-auto mb-2 flex max-w-2xl items-center gap-1.5 text-[11.5px] text-muted-foreground lg:hidden">
                  <BrainCircuit className="size-3.5 text-brand" />
                  Business Brain: {plural(brain.facts.length, 'fact')} · {plural(brain.caps.length, 'capability', 'capabilities')} · {plural(brain.perms.length, 'permission')}
                </div>
                <div className="mx-auto flex max-w-2xl items-end gap-2 sm:gap-3">
                  <div className="max-h-28 flex-1 overflow-y-auto rounded-2xl border bg-background px-3 py-2.5 text-[14px] text-foreground/90 shadow-inner sm:max-h-none sm:px-4 sm:py-3 sm:text-[14.5px]">
                    {next?.role === 'owner' && !typing ? next.text : <span className="text-muted-foreground">MyGPT is thinking…</span>}
                  </div>
                  <Button size="icon" variant="ghost" className="hidden rounded-full sm:inline-flex" title="Voice onboarding (coming soon)">
                    <Mic />
                  </Button>
                  <Button size="icon" variant="brand" className="rounded-full" onClick={() => void send()} disabled={typing || next?.role !== 'owner'}>
                    <ArrowUp />
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Brain being built */}
          <aside className="scrollbar-thin hidden min-h-0 overflow-y-auto border-l bg-card lg:block">
            <div className="sticky top-0 z-10 border-b bg-card/95 px-6 py-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BrainCircuit className="size-4 text-brand" /> Business Brain
                </div>
                <span className="text-xs text-muted-foreground">{done ? 'Built' : 'Building…'}</span>
              </div>
              <Progress className="mt-3" value={(answered / Math.max(ownerTurns, 1)) * 100} />
              <div className="mt-2 text-xs text-muted-foreground">
                {plural(brain.facts.length, 'fact')} · {plural(brain.caps.length, 'capability', 'capabilities')} · {plural(brain.perms.length, 'permission')}
              </div>
            </div>

            <div className="space-y-6 px-6 py-5">
              {brain.caps.length > 0 && (
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Capabilities discovered
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {brain.caps.map((c) => (
                        <motion.span
                          key={c}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-full border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-medium text-emerald-800"
                        >
                          {c}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {Object.entries(
                brain.facts.reduce<Record<string, typeof brain.facts>>((acc, f) => {
                  (acc[f.category] ??= []).push(f);
                  return acc;
                }, {}),
              ).map(([cat, facts]) => (
                <div key={cat}>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {CATEGORY_LABEL[cat as BrainCategory]}
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {facts.map((f) => (
                        <motion.div
                          key={f.label}
                          initial={{ opacity: 0, x: 12, backgroundColor: 'rgba(16,185,129,0.12)' }}
                          animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(16,185,129,0)' }}
                          transition={{ duration: 0.5, backgroundColor: { duration: 2 } }}
                          className="rounded-lg border px-3 py-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[13px] font-medium">{f.label}</div>
                            <FactStatusBadge status={f.status} className="shrink-0" />
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{f.value}</div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}

              {brain.perms.length > 0 && (
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Permission policy
                  </div>
                  <div className="space-y-1.5">
                    {brain.perms.map((p) => (
                      <motion.div key={p.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between rounded-lg border px-3 py-2 text-[13px]">
                        {p.label}
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className={cn('size-2 rounded-full', PERMISSION[p.class].dot)} />
                          {PERMISSION[p.class].label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Readiness({ script }: { script: OnboardingScript }) {
  const ready = script.readiness.filter((r) => r.status === 'ready').length;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Brain readiness</h3>
            <SpecRef sections={['§4']} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            A practical checklist of what’s missing before launch, not a quality score.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">
            {ready}
            <span className="text-base text-muted-foreground">/{script.readiness.length}</span>
          </div>
          <div className="text-xs text-muted-foreground">ready</div>
        </div>
      </div>
      <Progress className="mt-4" value={(ready / script.readiness.length) * 100} />
      <ul className="mt-5 divide-y">
        {script.readiness.map((r) => (
          <li key={r.id} className="flex items-start gap-3 py-2.5">
            {r.status === 'ready' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            ) : r.status === 'needs_attention' ? (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
            ) : (
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-rose-500" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-xs text-muted-foreground">{r.detail}</div>
            </div>
            <span className="font-mono text-[10.5px] text-muted-foreground">{r.spec}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="brand">
          <Link href="/brain">
            Review the Business Brain <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/approvals">Review drafted website</Link>
        </Button>
      </div>
    </motion.div>
  );
}
