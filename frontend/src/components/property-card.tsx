/* eslint-disable @next/next/no-img-element */
import { BedDouble, Bath, Home, CircleDashed, ShieldCheck } from 'lucide-react';
import { cn, formatMoney } from '@/lib/utils';
import type { PropertyView } from '@/lib/types';

export function PropertyPrice({ p, compact }: { p: PropertyView; compact?: boolean }) {
  return (
    <>
      {formatMoney(p.price, p.currency, { compact })}
      {p.pricePeriod === 'per_month' && <span className="text-[0.8em] font-normal opacity-70">/mo</span>}
    </>
  );
}

/** Inventory card for the Brain screen, with freshness shown explicitly (spec §22). */
export function PropertyCard({ p }: { p: PropertyView }) {
  const stale = p.freshness === 'stale';
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', stale && 'border-orange-200')}>
      <div className="relative aspect-[16/10] bg-muted">
        <img src={p.photo} alt={p.title} className={cn('h-full w-full object-cover', stale && 'grayscale-[60%]')} />
        <div className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10.5px] text-white">{p.ref}</div>
        <div
          className={cn(
            'absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium',
            stale ? 'bg-orange-100 text-orange-800' : 'bg-white/90 text-emerald-700',
          )}
        >
          {stale ? <CircleDashed className="size-3" /> : <ShieldCheck className="size-3" />}
          {stale ? `Stale: ${p.daysSinceConfirmed}d, withheld` : `Confirmed ${p.daysSinceConfirmed}d ago`}
        </div>
        {p.availability !== 'available' && (
          <div className="absolute bottom-2 left-2 rounded-md bg-amber-400 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase text-ink">
            {p.availability === 'let' ? 'leased' : p.availability.replace('_', ' ')}
          </div>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-medium leading-snug">{p.title}</div>
          <div className="shrink-0 text-sm font-semibold">
            <PropertyPrice p={p} compact />
          </div>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {p.estate ? `${p.estate}, ` : ''}
          {p.area} · {p.listingType === 'sale' ? 'For sale' : 'For rent'}
        </div>
        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="size-3.5" />{p.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="size-3.5" />{p.bathrooms}</span>
          <span className="flex items-center gap-1"><Home className="size-3.5" />{p.sizeSqft.toLocaleString('en-US')} sq ft</span>
          {p.hasGuestSuite && <span className="rounded bg-secondary px-1.5 py-px text-[10.5px] font-medium text-foreground">Guest suite</span>}
        </div>
      </div>
    </div>
  );
}
