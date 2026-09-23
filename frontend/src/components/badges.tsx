import {
  Ban,
  BadgeCheck,
  Clock3,
  FileDown,
  Hand,
  Lock,
  Sparkles,
  Zap,
  CircleDashed,
  Flame,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FactStatus, LeadStage, PermissionClass } from '@/lib/types';

export const FACT_STATUS: Record<FactStatus, { label: string; className: string; icon: typeof BadgeCheck; description: string }> = {
  owner_verified: { label: 'Owner-verified', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: BadgeCheck, description: 'Provided or confirmed by the owner' },
  imported: { label: 'Imported', className: 'border-sky-200 bg-sky-50 text-sky-700', icon: FileDown, description: 'From an approved source' },
  ai_draft: { label: 'AI draft', className: 'border-violet-200 bg-violet-50 text-violet-700', icon: Sparkles, description: 'Never shown to customers as fact' },
  pending_confirmation: { label: 'Pending confirmation', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: Clock3, description: 'Waiting for the owner' },
  stale: { label: 'Stale', className: 'border-orange-200 bg-orange-50 text-orange-700', icon: CircleDashed, description: 'Expired; not used as current' },
  rejected: { label: 'Rejected', className: 'border-zinc-200 bg-zinc-100 text-zinc-500', icon: Ban, description: 'Disabled by the owner' },
};

export function FactStatusBadge({ status, className }: { status: FactStatus; className?: string }) {
  const s = FACT_STATUS[status];
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn(s.className, className)}>
      <Icon />
      {s.label}
    </Badge>
  );
}

export const PERMISSION: Record<PermissionClass, { label: string; className: string; icon: typeof Zap; dot: string }> = {
  autonomous: { label: 'Autonomous', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: Zap, dot: 'bg-emerald-500' },
  approval_required: { label: 'Approval required', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: Hand, dot: 'bg-amber-500' },
  human_only: { label: 'Human only', className: 'border-rose-200 bg-rose-50 text-rose-700', icon: Lock, dot: 'bg-rose-500' },
};

export function PermissionBadge({ value, className }: { value: PermissionClass; className?: string }) {
  const p = PERMISSION[value];
  const Icon = p.icon;
  return (
    <Badge variant="outline" className={cn(p.className, className)}>
      <Icon />
      {p.label}
    </Badge>
  );
}

export const STAGE: Record<LeadStage, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-sky-100 text-sky-800' },
  qualifying: { label: 'Qualifying', className: 'bg-indigo-100 text-indigo-800' },
  qualified: { label: 'Qualified', className: 'bg-violet-100 text-violet-800' },
  viewing_scheduled: { label: 'Viewing scheduled', className: 'bg-emerald-100 text-emerald-800' },
  offer: { label: 'Offer / negotiation', className: 'bg-amber-100 text-amber-800' },
  nurturing: { label: 'Nurturing', className: 'bg-slate-100 text-slate-700' },
  won: { label: 'Won', className: 'bg-teal-100 text-teal-800' },
  lost: { label: 'Lost', className: 'bg-zinc-100 text-zinc-500' },
};

export function StageBadge({ stage, className }: { stage: LeadStage; className?: string }) {
  const s = STAGE[stage];
  return <Badge className={cn('border-transparent', s.className, className)}>{s.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  if (priority === 'high')
    return (
      <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
        <Flame />
        High intent
      </Badge>
    );
  return (
    <Badge variant="outline" className={priority === 'medium' ? 'text-slate-600' : 'text-slate-400'}>
      {priority === 'medium' ? 'Medium' : 'Low'}
    </Badge>
  );
}

export const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  web_chat: 'Website chat',
  referral: 'Referral',
  instagram: 'Instagram',
  phone: 'Phone',
};
