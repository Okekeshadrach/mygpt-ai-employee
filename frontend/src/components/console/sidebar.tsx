'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Activity,
  BrainCircuit,
  CheckCheck,
  Home,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Users,
  Loader2,
  X,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useApi, useSocketStatus } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Approval, Tenant } from '@/lib/types';

const NAV = [
  { href: '/', label: 'Platform', icon: Home },
  { href: '/onboarding', label: 'Onboarding', icon: Sparkles },
  { href: '/brain', label: 'Business Brain', icon: BrainCircuit },
  { href: '/live', label: 'Live conversation', icon: MessageCircle },
  { href: '/crm', label: 'CRM & Leads', icon: Users },
  { href: '/activity', label: 'Activity & Audit', icon: Activity },
  { href: '/approvals', label: 'Approvals', icon: CheckCheck },
];

/** Unread approval count, shared by the sidebar and the mobile top bar. */
export function usePendingApprovals() {
  const { data } = useApi<Approval[]>('/approvals', ['approval.updated', 'demo.reset']);
  return data?.filter((a) => a.status === 'pending').length ?? 0;
}

/**
 * Desktop: sticky rail (lg+). Mobile/tablet: rendered inside a slide-out drawer (`drawer`),
 * with `onNavigate` closing it after a link is tapped.
 */
export function Sidebar({ collapsed, drawer, onNavigate }: { collapsed?: boolean; drawer?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const connected = useSocketStatus();
  const { data: tenant } = useApi<Tenant>('/tenant');
  const pending = usePendingApprovals();
  const [resetting, setResetting] = useState(false);

  async function reset() {
    setResetting(true);
    try {
      await api.post('/demo/reset');
      window.location.reload();
    } finally {
      setResetting(false);
    }
  }

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col bg-ink text-white',
        drawer
          ? 'h-full w-[272px] max-w-[85vw]'
          : cn('sticky top-0 hidden h-screen transition-[width] duration-300 lg:flex', collapsed ? 'w-[68px]' : 'w-[244px]'),
      )}
    >
      <div className={cn('flex h-16 items-center', collapsed ? 'justify-center' : 'justify-between px-5')}>
        {collapsed ? (
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600">
            <div className="size-2.5 rounded-full bg-white" />
          </div>
        ) : (
          <Logo dark />
        )}
        {drawer && (
          <button onClick={onNavigate} className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close menu">
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Tenant switcher (single tenant in the demo; HOOK(auth): real tenant list) */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <div className="text-[13px] font-medium leading-tight">{tenant?.name ?? 'Baycrest Realty'}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/50">
            <span className="rounded bg-emerald-400/15 px-1 py-px text-[10px] font-medium text-emerald-300">Real Estate Pack</span>
            {tenant?.timezone ?? 'America/New_York'}
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 px-3">
        {!collapsed && <div className="px-2 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Walkthrough</div>}
        {NAV.map((item, i) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center px-0',
              )}
            >
              <Icon className={cn('size-4 shrink-0', active && 'text-emerald-300')} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.href === '/approvals' && pending > 0 ? (
                    <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-semibold text-ink">{pending}</span>
                  ) : (
                    <span className="font-mono text-[10px] text-white/25">{i}</span>
                  )}
                </>
              )}
            </Link>
          );
          return collapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <div className={cn('space-y-2 border-t border-white/10 p-3', collapsed && 'px-2')}>
        <div className={cn('flex items-center gap-2 px-1 text-[11px] text-white/50', collapsed && 'justify-center')}>
          <span className={cn('size-1.5 rounded-full', connected ? 'bg-emerald-400 animate-pulse' : 'bg-white/30')} />
          {!collapsed && (connected ? 'Realtime connected' : 'Realtime offline')}
        </div>
        <button
          onClick={reset}
          disabled={resetting}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-white/55 transition-colors hover:bg-white/5 hover:text-white',
            collapsed && 'justify-center px-0',
          )}
          title="Restore seeded demo data"
        >
          {resetting ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
          {!collapsed && 'Reset demo data'}
        </button>
      </div>
    </aside>
  );
}
