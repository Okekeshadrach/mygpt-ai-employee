'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, CircleDot, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Evidence, PipelineStage, PipelineStageId } from '@/lib/types';

export interface TraceEntry {
  id: string;
  kind: 'stage' | 'effect';
  stage?: PipelineStageId;
  title: string;
  lines: string[];
  evidence?: Evidence[];
  tone?: 'default' | 'warn' | 'success';
  elapsedMs: number;
}

/** The universal pipeline (spec §7) rendered as a live trace. */
export function PipelineTrace({
  stages,
  entries,
  current,
}: {
  stages: PipelineStage[];
  entries: TraceEntry[];
  current?: PipelineStageId;
}) {
  const reached = new Set(entries.map((e) => e.stage).filter(Boolean));
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries.length]);

  const label = (id?: PipelineStageId) => stages.find((s) => s.id === id)?.label ?? id;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Stage rail */}
      <div className="flex flex-wrap gap-1.5 border-b p-4">
        {stages.map((s, i) => {
          const active = current === s.id;
          const done = reached.has(s.id);
          return (
            <div
              key={s.id}
              title={s.hint}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-300',
                active
                  ? 'animate-pulse-ring border-brand bg-brand text-white'
                  : done
                    ? 'border-brand/30 bg-brand-soft text-emerald-800'
                    : 'border-border bg-card text-muted-foreground',
              )}
            >
              <span className={cn('font-mono text-[9.5px]', active ? 'text-white/80' : 'opacity-60')}>{i + 1}</span>
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Trace log */}
      <div ref={listRef} className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto p-4">
        {entries.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <CircleDot className="mb-3 size-8 text-muted-foreground/40" />
            <p className="max-w-xs">
              Press <span className="font-medium text-foreground">Play</span>. Each step the AI takes appears here as it
              happens: the same pipeline for every channel and every industry.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {entries.map((e) =>
            e.kind === 'effect' ? (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-lg border border-dashed border-brand/40 bg-brand-soft/60 px-3 py-2 text-[12.5px] font-medium text-emerald-800"
              >
                <Database className="size-3.5" /> {e.title}
                <span className="ml-auto font-mono text-[10px] font-normal text-emerald-700/70">write committed</span>
              </motion.div>
            ) : (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-xl border bg-card p-3.5 shadow-sm',
                  e.tone === 'warn' && 'border-amber-200',
                  e.tone === 'success' && 'border-emerald-200',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {e.tone === 'warn' ? (
                      <AlertTriangle className="size-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className={cn('size-4', e.tone === 'success' ? 'text-emerald-600' : 'text-slate-400')} />
                    )}
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label(e.stage)}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">+{(e.elapsedMs / 1000).toFixed(1)}s</span>
                </div>
                <div className="mt-1 text-[13.5px] font-medium">{e.title}</div>
                <ul className="mt-1.5 space-y-0.5">
                  {e.lines.map((l) => (
                    <li key={l} className={cn('text-[12.5px] leading-snug text-foreground/75', l.startsWith('✕') && 'text-orange-700')}>
                      {l}
                    </li>
                  ))}
                </ul>
                {e.evidence && e.evidence.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {e.evidence.map((ev) => (
                      <span key={ev.label} className="rounded-md bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground" title={ev.source}>
                        <span className="font-medium text-foreground/80">{ev.label}</span> · {ev.detail}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ),
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
