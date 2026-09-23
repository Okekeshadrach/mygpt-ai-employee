import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  Workflow,
  Wrench,
  ShieldCheck,
  Users,
  MessageCircle,
  History,
  ScrollText,
  Globe2,
  Layers,
  Mic,
  CheckCircle2,
  Hand,
  Lock,
  Zap,
  Play,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { SpecRef } from '@/components/spec-ref';
import { Button } from '@/components/ui/button';

const CORE = [
  { icon: BrainCircuit, label: 'Business Brain', note: 'Per-tenant source of truth' },
  { icon: History, label: 'Customer Memory', note: 'Recognizes returning customers' },
  { icon: Workflow, label: 'Workflow engine', note: 'Trigger → decide → act → follow up' },
  { icon: Wrench, label: 'Tool layer', note: 'Calendar, CRM, email, website…' },
  { icon: ShieldCheck, label: 'Permissions', note: 'Autonomous · approval · human-only' },
  { icon: Users, label: 'CRM foundation', note: 'Updates itself, no copying' },
  { icon: MessageCircle, label: 'Channels', note: 'WhatsApp, web chat, voice notes' },
  { icon: ScrollText, label: 'Audit trail', note: 'Every action traceable' },
  { icon: Globe2, label: 'Global by default', note: 'Language, currency, timezone' },
];

const PACKS = [
  { name: 'Real Estate', live: true, words: 'properties · viewings · buyers · landlords' },
  { name: 'Dental', words: 'patients · treatments · insurance' },
  { name: 'Restaurant', words: 'reservations · menus · orders' },
  { name: 'Legal', words: 'matters · consultations' },
  { name: 'E-commerce', words: 'products · orders · returns' },
  { name: 'Fitness', words: 'members · classes · trainers' },
  { name: 'Insurance', words: 'quotes · policies · claims' },
  { name: 'Travel', words: 'trips · bookings · visas' },
];

const STEPS = [
  { href: '/onboarding', n: 1, title: 'Onboarding builds the Brain', body: 'A 10-minute conversation teaches MyGPT how the business works, then shows what’s missing before launch.', spec: ['§4', '§5'] },
  { href: '/brain', n: 2, title: 'The Business Brain', body: 'Every fact tagged by source and status. Volatile facts like price and availability expire.', spec: ['§3', '§22'] },
  { href: '/live', n: 3, title: 'A customer sends a voice note', body: 'Transcribed, recognized, matched to inventory, qualified, booked and escalated, live.', spec: ['§7', '§28'] },
  { href: '/crm', n: 4, title: 'The CRM fills itself', body: 'Lead stage, next action, memory timeline and a handoff briefing, with no manual entry.', spec: ['§6', '§12'] },
  { href: '/activity', n: 5, title: 'Activity feed + audit', body: 'What the AI did today, and the evidence behind every decision. No black-box scores.', spec: ['§16', '§21'] },
  { href: '/approvals', n: 6, title: 'The owner stays in control', body: 'Price changes and website publishing wait for sign-off. Money and contracts stay human-only.', spec: ['§10', '§13'] },
];

export default function Landing() {
  return (
    <div className="bg-ink text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-fade pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Logo dark />
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 sm:inline">Interactive prototype</span>
            <Button asChild size="sm" variant="secondary">
              <Link href="/brain">Open console</Link>
            </Button>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-6 sm:pb-24 sm:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
          <div>
            <SpecRef sections={['§1', '§29']} dark className="mb-6" />
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              An AI employee that{' '}
              <span className="font-display font-normal italic text-emerald-300">already knows</span> your business.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              MyGPT learns how a business operates, talks to its customers on WhatsApp and web chat, remembers every
              relationship, and acts only within the permissions the owner sets. It isn’t a chatbot. It’s staff.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="brand">
                <Link href="/onboarding">
                  Start the walkthrough <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/live">
                  <Play /> Jump to the live demo
                </Link>
              </Button>
            </div>
          </div>

          {/* "Today" card: the AI employee at work */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-semibold">A</div>
                  <div>
                    <div className="text-sm font-medium">Ava · AI employee</div>
                    <div className="text-xs text-white/50">Baycrest Realty, Miami</div>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> On shift
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[
                  ['23', 'conversations today'],
                  ['9s', 'first response'],
                  ['6', 'viewings booked'],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-white/[0.04] px-2 py-3">
                    <div className="text-xl font-semibold">{v}</div>
                    <div className="mt-0.5 text-[10.5px] leading-tight text-white/45">{l}</div>
                  </div>
                ))}
              </div>
              <ul className="mt-5 space-y-3 text-[13px]">
                {[
                  { icon: Mic, text: 'Transcribed a voice note and recognized a returning buyer', tone: 'text-sky-300' },
                  { icon: CheckCircle2, text: 'Booked 2 viewings for Saturday and briefed the agent', tone: 'text-emerald-300' },
                  { icon: Hand, text: 'Price change on BCR-1063 is waiting for the owner', tone: 'text-amber-300' },
                  { icon: Lock, text: 'Declined to share wire instructions and handed over to a human', tone: 'text-rose-300' },
                ].map(({ icon: Icon, text, tone }) => (
                  <li key={text} className="flex items-start gap-2.5 text-white/75">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core + Packs */}
      <section className="border-t border-white/10 bg-[#0d1526]">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <SpecRef sections={['§2', '§27']} dark className="mb-4" />
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                Build the core once.{' '}
                <span className="font-display font-normal italic text-emerald-300">Configure the vertical</span> many times.
              </h2>
              <p className="mt-4 text-white/60">
                Every business gets the same intelligence and infrastructure. A Vertical Pack teaches it the industry:
                its entities, words, workflows and rules. Real estate is the first reference implementation, not the
                company’s identity.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-6">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              <Layers className="size-4" /> MyGPT Core: universal, shared by every business
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CORE.map(({ icon: Icon, label, note }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink/60 px-4 py-3">
                  <Icon className="size-5 text-emerald-300" />
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-white/45">{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto h-8 w-px bg-gradient-to-b from-emerald-400/40 to-transparent" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PACKS.map((p) => (
              <div
                key={p.name}
                className={
                  p.live
                    ? 'rounded-xl border border-emerald-400/50 bg-emerald-400/10 p-4 ring-1 ring-emerald-400/30'
                    : 'rounded-xl border border-white/10 bg-white/[0.02] p-4'
                }
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{p.name} Pack</div>
                  {p.live ? (
                    <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-semibold text-ink">LIVE</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider text-white/35">config</span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-white/45">{p.words}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-white/45">
            The architecture test: adding the Dental Pack reuses the Brain, Memory, Agent, Workflows, Tools, CRM,
            Channels, Permissions and Audit <em>unchanged</em>.
          </p>
        </div>
      </section>

      {/* Control */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <SpecRef sections={['§10', '§24']} dark className="mb-4" />
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">Never unlimited authority.</h2>
          <p className="mt-3 max-w-2xl text-white/60">Every action the AI can take has a permission class, set by the owner.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: Zap, t: 'Autonomous', c: 'text-emerald-300 border-emerald-400/30', d: 'Answer from approved facts, capture leads, update the CRM, book viewings in free slots, follow up.' },
              { icon: Hand, t: 'Approval required', c: 'text-amber-300 border-amber-400/30', d: 'The AI prepares the action and waits: price changes, discounts, publishing the website, broadcasts.' },
              { icon: Lock, t: 'Human only', c: 'text-rose-300 border-rose-400/30', d: 'The AI prepares a briefing, and a human acts: payments, contracts, accepting offers, deleting records.' },
            ].map(({ icon: Icon, t, c, d }) => (
              <div key={t} className={`rounded-2xl border bg-white/[0.02] p-6 ${c}`}>
                <Icon className="size-6" />
                <div className="mt-4 text-lg font-medium text-white">{t}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Walkthrough */}
      <section className="border-t border-white/10 bg-[#0d1526]">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight">The walkthrough</h2>
          <p className="mt-3 text-white/60">One real-estate business, one day, end to end.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-emerald-400/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl italic text-emerald-300">{s.n}</span>
                  <SpecRef sections={s.spec} dark />
                </div>
                <div className="mt-4 font-medium">{s.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
                <div className="mt-4 flex items-center gap-1 text-sm text-emerald-300 opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-white/40">
          <Logo dark className="opacity-70" />
          <span>Interactive prototype · reference business: Baycrest Realty, Miami (Real Estate Pack) · spec v1</span>
        </div>
      </footer>
    </div>
  );
}
