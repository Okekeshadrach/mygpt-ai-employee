'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Gauge, Loader2, Play, Radio, RotateCcw, Users } from 'lucide-react';
import { WhatsAppThread, type ShownMessage } from '@/components/live/whatsapp-thread';
import { PipelineTrace, type TraceEntry } from '@/components/live/pipeline-trace';
import { LeadDetail } from '@/components/crm/lead-detail';
import { SpecRef } from '@/components/spec-ref';
import { ApiState } from '@/components/api-state';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { cn, sleep } from '@/lib/utils';
import type { LeadView, PipelineStage, PipelineStageId, PropertyView, Scenario, Tenant } from '@/lib/types';

const SCENARIO_ID = 'returning-buyer-voice-note';
type Status = 'idle' | 'playing' | 'paused' | 'done';

export default function LivePage() {
  const { data: scenario, error, loading, refetch: refetchScenario } = useApi<Scenario>(`/demo/scenarios/${SCENARIO_ID}`);
  const { data: stages } = useApi<PipelineStage[]>('/pipeline');
  const { data: tenant } = useApi<Tenant>('/tenant');
  const { data: properties } = useApi<PropertyView[]>('/properties', ['demo.reset']);
  const leadPath = scenario ? `/leads/${scenario.leadId}` : null;
  const { data: lead, setData: setLead, refetch: refetchLead } = useApi<LeadView>(leadPath, ['lead.updated', 'demo.reset']);

  const [shown, setShown] = useState<ShownMessage[]>([]);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [typing, setTyping] = useState<'ai' | 'customer' | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [pauseLabel, setPauseLabel] = useState<string>();
  const [currentStage, setCurrentStage] = useState<PipelineStageId>();
  const [speed, setSpeed] = useState(1);
  const [resetting, setResetting] = useState(false);
  const [effectsApplied, setEffectsApplied] = useState<string[]>([]);
  // Below xl the three columns become tabs; badges count what happened in the hidden tabs.
  const [panel, setPanel] = useState<'chat' | 'pipeline' | 'crm'>('chat');
  const [seen, setSeen] = useState({ pipeline: 0, crm: 0 });

  const runId = useRef(0);
  const cursor = useRef(0);
  const turnStart = useRef(Date.now());
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (scenario && cursor.current === 0) {
      const first = scenario.steps[0];
      setPauseLabel(first?.kind === 'message' ? first.pauseBefore : undefined);
    }
  }, [scenario]);

  // Stop any running playback when leaving the page
  useEffect(() => () => void runId.current++, []);

  const play = useCallback(async () => {
    if (!scenario) return;
    const id = ++runId.current;
    const alive = () => runId.current === id;
    const wait = async (ms: number) => {
      await sleep(ms / speedRef.current);
      return alive();
    };
    setStatus('playing');
    let resumedHere = true;

    for (let i = cursor.current; i < scenario.steps.length; i++) {
      const step = scenario.steps[i]!;
      if (step.kind === 'message' && step.pauseBefore && !resumedHere) {
        cursor.current = i;
        setPauseLabel(step.pauseBefore);
        setStatus('paused');
        setCurrentStage(undefined);
        return;
      }
      resumedHere = false;
      if (!(await wait(step.delayMs))) return;

      switch (step.kind) {
        case 'message': {
          if (step.message.from === 'customer') {
            setTyping('customer');
            if (!(await wait(step.message.kind === 'voice' ? 1600 : 1100))) return;
            setTyping(null);
            turnStart.current = Date.now();
          }
          setShown((s) => [...s, { message: step.message, at: new Date().toISOString() }]);
          break;
        }
        case 'typing': {
          setCurrentStage('respond');
          setTyping(step.from);
          if (!(await wait(step.durationMs))) return;
          setTyping(null);
          break;
        }
        case 'pipeline': {
          setCurrentStage(step.stage);
          if (step.stage === 'receive') {
            setShown((s) => s.map((m) => (m.message.kind === 'voice' ? { ...m, transcribed: true } : m)));
          }
          setTrace((t) => [
            ...t,
            { id: step.id, kind: 'stage', stage: step.stage, title: step.title, lines: step.lines, evidence: step.evidence, tone: step.tone, elapsedMs: Date.now() - turnStart.current },
          ]);
          break;
        }
        case 'effect': {
          setCurrentStage('update');
          try {
            const updated = await api.post<LeadView>(`/demo/effects/${step.effect}`);
            if (!alive()) return;
            setLead(updated);
            setEffectsApplied((e) => [...e, step.label]);
            setTrace((t) => [...t, { id: step.id, kind: 'effect', title: step.label, lines: [], elapsedMs: Date.now() - turnStart.current }]);
          } catch (err) {
            setTrace((t) => [
              ...t,
              { id: step.id, kind: 'stage', stage: 'tools', title: `Tool failed: ${step.effect}`, lines: [(err as Error).message, 'Customer not told it succeeded (§24)'], tone: 'warn', elapsedMs: Date.now() - turnStart.current },
            ]);
          }
          break;
        }
      }
      cursor.current = i + 1;
    }
    setStatus('done');
    setCurrentStage(undefined);
    setPauseLabel(undefined);
  }, [scenario, setLead]);

  async function restart() {
    runId.current++;
    setResetting(true);
    try {
      await api.post('/demo/reset');
    } finally {
      cursor.current = 0;
      setShown([]);
      setTrace([]);
      setTyping(null);
      setEffectsApplied([]);
      setSeen({ pipeline: 0, crm: 0 });
      setCurrentStage(undefined);
      setStatus('idle');
      await Promise.all([refetchScenario(), refetchLead()]);
      setResetting(false);
    }
  }

  const team = tenant?.team ?? [];
  const unread = {
    pipeline: panel === 'pipeline' ? 0 : Math.max(0, trace.length - seen.pipeline),
    crm: panel === 'crm' ? 0 : Math.max(0, effectsApplied.length - seen.crm),
  };
  function openPanel(p: 'chat' | 'pipeline' | 'crm') {
    setPanel(p);
    setSeen({ pipeline: trace.length, crm: effectsApplied.length });
  }
  const show = (p: 'chat' | 'pipeline' | 'crm') => (panel === p ? 'flex' : 'hidden xl:flex');
  const allProps = properties ?? scenario?.properties ?? [];

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:h-screen">
      {/* Header + controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-card px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">Step 3 of 6</span>
            <SpecRef sections={['§6', '§7', '§11', '§15', '§28']} className="hidden sm:flex" />
          </div>
          <h1 className="mt-0.5 text-base font-semibold tracking-tight sm:text-xl">A returning buyer sends a WhatsApp voice note</h1>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.75 : 1))} title="Playback speed">
            <Gauge /> {speed}×
          </Button>
          <Button variant="outline" size="sm" onClick={() => void restart()} disabled={resetting}>
            {resetting ? <Loader2 className="animate-spin" /> : <RotateCcw />}
            <span className="hidden sm:inline">Restart</span>
          </Button>
          <Button
            variant="brand"
            size="sm"
            data-testid="play"
            className="min-w-0 flex-1 sm:min-w-[230px] sm:flex-none"
            disabled={!scenario || status === 'playing' || status === 'done'}
            onClick={() => void play()}
          >
            {status === 'playing' ? (
              <>
                <Loader2 className="animate-spin" /> MyGPT is working…
              </>
            ) : status === 'done' ? (
              'Scenario complete ✓'
            ) : (
              <>
                <Play /> {pauseLabel ?? 'Play'}
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/crm">
              Next: CRM <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>

      <ApiState error={error} loading={loading && !scenario} />

      {scenario && (
        <div className="flex border-b bg-card xl:hidden">
          {([
            ['chat', 'WhatsApp', 0],
            ['pipeline', 'AI pipeline', unread.pipeline],
            ['crm', 'CRM', unread.crm],
          ] as const).map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => openPanel(id)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium transition-colors',
                panel === id ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
              {count > 0 && (
                <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold leading-4 text-white">{count}</span>
              )}
              {panel === id && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand" />}
            </button>
          ))}
        </div>
      )}

      {scenario && (
        <div className="flex min-h-0 flex-1 flex-col xl:grid xl:grid-cols-[380px_minmax(0,1fr)_400px]">
          {/* Customer's channel */}
          <div className={cn(show('chat'), 'min-h-0 flex-1 flex-col bg-muted/40 p-3 sm:p-5 xl:border-r')}>
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <span>Channel · WhatsApp</span>
              <span className="normal-case tracking-normal">{scenario.businessPhone}</span>
            </div>
            <div className="mx-auto min-h-0 w-full max-w-md flex-1 xl:max-w-none">
              <WhatsAppThread
                customerName={lead?.customer.name ?? 'Hannah Brooks'}
                customerPhone={lead?.customer.phone ?? ''}
                history={scenario.history}
                historyLabel={scenario.historyLabel}
                shown={shown}
                typing={typing}
                properties={allProps}
              />
            </div>
          </div>

          {/* Universal pipeline */}
          <div className={cn(show('pipeline'), 'min-h-0 flex-1 flex-col bg-background')}>
            <div className="flex items-center justify-between border-b bg-card px-4 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                MyGPT Core · universal agent pipeline
              </div>
              <SpecRef sections={['§7', '§9', '§10']} />
            </div>
            <div className="min-h-0 flex-1">
              <PipelineTrace stages={stages ?? []} entries={trace} current={currentStage} />
            </div>
          </div>

          {/* CRM, updated live */}
          <div className={cn(show('crm'), 'min-h-0 flex-1 flex-col bg-card xl:border-l')}>
            <div className="flex items-center justify-between border-b px-4 py-2.5 sm:px-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <Users className="size-3.5" /> CRM · Customer Memory
              </div>
              <span className={cn('flex items-center gap-1.5 text-[11px]', effectsApplied.length ? 'text-emerald-700' : 'text-muted-foreground')}>
                <Radio className={cn('size-3.5', status === 'playing' && 'animate-pulse')} />
                {effectsApplied.length ? `${effectsApplied.length} live update${effectsApplied.length > 1 ? 's' : ''}` : 'Listening'}
              </span>
            </div>
            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {lead ? (
                <LeadDetail lead={lead} team={team} properties={allProps} compact />
              ) : (
                <div className="text-sm text-muted-foreground">Loading lead…</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
