'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BedDouble, CheckCheck, FileAudio, Mic, Phone, Play, Sparkles, Video } from 'lucide-react';
import { PropertyPrice } from '@/components/property-card';
import { RichText } from '@/components/rich-text';
import { cn, formatTime } from '@/lib/utils';
import type { ChatMessage, PropertyView } from '@/lib/types';

export interface ShownMessage {
  message: ChatMessage;
  at: string;
  transcribed?: boolean;
}

const WAVE = [4, 9, 14, 7, 12, 18, 10, 6, 13, 16, 8, 5, 11, 15, 9, 6, 12, 17, 10, 7, 13, 8, 5, 10, 14, 7];

function VoiceNote({ durationSec, transcript, transcribed }: { durationSec: number; transcript: string; transcribed?: boolean }) {
  return (
    <div className="w-[270px]">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-[13px] font-semibold text-white">HB</div>
          <Mic className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-white p-0.5 text-sky-500" />
        </div>
        <Play className="size-5 shrink-0 fill-slate-500 text-slate-500" />
        <div className="flex h-7 flex-1 items-center gap-[2px]">
          {WAVE.map((h, i) => (
            <span key={i} className="w-[3px] rounded-full bg-slate-400" style={{ height: h + 4 }} />
          ))}
        </div>
      </div>
      <div className="mt-0.5 pl-[52px] text-[11px] text-slate-500">
        0:{String(durationSec).padStart(2, '0')}
      </div>
      <AnimatePresence>
        {transcribed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-md border-l-2 border-sky-400 bg-sky-50/80 px-2.5 py-2 text-[12.5px] leading-snug text-slate-700">
              <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-sky-600">
                <FileAudio className="size-3" /> Transcribed by MyGPT
              </div>
              “{transcript}”
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PropertyCards({ ids, properties }: { ids: string[]; properties: PropertyView[] }) {
  return (
    <div className="flex w-[258px] flex-col gap-1.5">
      {ids.map((id) => {
        const p = properties.find((x) => x.id === id);
        if (!p) return null;
        return (
          <div key={id} className="flex overflow-hidden rounded-lg bg-white/70 ring-1 ring-black/5">
            <img src={p.photo} alt={p.title} className="h-[70px] w-[76px] shrink-0 object-cover" />
            <div className="min-w-0 px-2.5 py-1.5">
              <div className="truncate text-[12.5px] font-semibold text-slate-800">{p.title}</div>
              <div className="truncate text-[11px] text-slate-500">{p.estate}, {p.area} · <span className="font-mono text-[10px]">{p.ref}</span></div>
              <div className="mt-1 flex items-center gap-2 text-[11.5px]">
                <span className="font-semibold text-emerald-700"><PropertyPrice p={p} compact /></span>
                <span className="flex items-center gap-0.5 text-slate-500"><BedDouble className="size-3" />{p.bedrooms}</span>
                {p.hasGuestSuite && <span className="whitespace-nowrap rounded bg-slate-100 px-1 text-[10px] font-medium text-slate-600">Guest suite</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WhatsAppThread({
  customerName,
  customerPhone,
  history,
  historyLabel,
  shown,
  typing,
  properties,
}: {
  customerName: string;
  customerPhone: string;
  history: ChatMessage[];
  historyLabel: string;
  shown: ShownMessage[];
  typing: 'ai' | 'customer' | null;
  properties: PropertyView[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [shown, typing]);

  const bubble = (m: ChatMessage, at: string, transcribed?: boolean, faded?: boolean) => {
    const out = m.from === 'ai';
    return (
      <motion.div
        key={m.id}
        initial={faded ? false : { opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={cn('flex', out ? 'justify-end' : 'justify-start', faded && 'opacity-70')}
      >
        <div
          className={cn(
            'relative max-w-[86%] rounded-lg px-2.5 pb-1.5 pt-1.5 text-[13.5px] leading-snug text-slate-800 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]',
            out ? 'rounded-tr-none bg-wa-out' : 'rounded-tl-none bg-white',
          )}
        >
          {out && !faded && (
            <div className="mb-0.5 flex items-center gap-1 text-[10.5px] font-medium text-emerald-700">
              <Sparkles className="size-3" /> Ava · AI assistant
            </div>
          )}
          {m.kind === 'text' && <RichText text={m.text} />}
          {m.kind === 'voice' && <VoiceNote durationSec={m.durationSec} transcript={m.transcript} transcribed={transcribed} />}
          {m.kind === 'property_cards' && <PropertyCards ids={m.propertyIds} properties={properties} />}
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[10.5px] text-slate-500">
            {formatTime(at)}
            {out && <CheckCheck className="size-3.5 text-wa-tick" />}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border-[6px] border-ink bg-ink shadow-2xl">
      {/* WhatsApp header */}
      <div className="flex items-center gap-2.5 bg-wa-header px-3 py-2.5 text-white">
        <ArrowLeft className="size-5" />
        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-[13px] font-semibold">HB</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-medium leading-tight">{customerName}</div>
          <div className="truncate text-[11.5px] text-white/75">{typing === 'customer' ? 'recording audio…' : typing === 'ai' ? 'Ava is typing…' : customerPhone}</div>
        </div>
        <Video className="size-5" />
        <Phone className="size-[18px]" />
      </div>

      <div ref={scrollRef} className="wa-wallpaper scrollbar-thin flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        <div className="mx-auto w-fit rounded-md bg-[#fdf4c5] px-3 py-1 text-center text-[11px] text-slate-600 shadow-sm">
          🔒 Messages are handled by Baycrest Realty’s AI assistant
        </div>
        <div className="mx-auto w-fit rounded-md bg-white/90 px-2.5 py-0.5 text-[11px] text-slate-500 shadow-sm">{historyLabel}</div>
        {history.map((m) => bubble(m, m.at ?? new Date().toISOString(), false, true))}
        <div className="mx-auto w-fit rounded-md bg-white/90 px-2.5 py-0.5 text-[11px] text-slate-500 shadow-sm">Today</div>
        <AnimatePresence initial={false}>{shown.map((s) => bubble(s.message, s.at, s.transcribed))}</AnimatePresence>
        {typing && (
          <div className={cn('flex', typing === 'ai' ? 'justify-end' : 'justify-start')}>
            <div className={cn('flex gap-1 rounded-lg px-3 py-2.5 shadow-sm', typing === 'ai' ? 'bg-wa-out' : 'bg-white')}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer (decorative: messages come from the customer's phone) */}
      <div className="flex items-center gap-2 bg-[#f0f2f5] px-2.5 py-2">
        <div className="flex-1 rounded-full bg-white px-4 py-2 text-[13px] text-slate-400">Message</div>
        <div className="flex size-9 items-center justify-center rounded-full bg-wa-header text-white">
          <Mic className="size-4" />
        </div>
      </div>
    </div>
  );
}
