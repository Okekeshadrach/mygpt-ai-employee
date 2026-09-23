import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Tenant locale/currency. Replaced by the tenant's settings once auth exists (spec §19). */
export const LOCALE = 'en-US';
export const TIMEZONE = 'America/New_York';

/** Money is stored in major units + currency; format only here (spec §19). */
export function formatMoney(amount: number, currency = 'USD', opts: { compact?: boolean } = {}) {
  if (opts.compact) {
    const symbol = new Intl.NumberFormat(LOCALE, { style: 'currency', currency, maximumFractionDigits: 0 })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value ?? currency;
    if (amount >= 1_000_000_000) return `${symbol}${trim(amount / 1_000_000_000)}B`;
    if (amount >= 1_000_000) return `${symbol}${trim(amount / 1_000_000)}M`;
    if (amount >= 1_000) return `${symbol}${trim(amount / 1_000)}k`;
  }
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
/** Up to 2 decimals, trailing zeros dropped: 1.95 → "1.95", 2.5 → "2.5", 9 → "9" (never rounds 2.05 to 2) */
const trim = (n: number) => String(Number(n.toFixed(2)));

export function timeAgo(iso: string, now = Date.now()) {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const min = 60_000, hour = 60 * min, day = 24 * hour;
  if (abs < min) return diff >= 0 ? 'in a moment' : 'just now';
  if (abs < hour) return rtf.format(Math.round(diff / min), 'minute');
  if (abs < day) return rtf.format(Math.round(diff / hour), 'hour');
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), 'day');
  return rtf.format(Math.round(diff / (30 * day)), 'month');
}

export function formatDateTime(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(iso).toLocaleString(LOCALE, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE, ...opts,
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit', timeZone: TIMEZONE });
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
