/** Relative timestamps so seeded data always looks current, whenever the demo runs. */
export interface Offset {
  d?: number;
  h?: number;
  m?: number;
}

export interface Clock {
  now: number;
  ago(o: Offset): string;
  ahead(o: Offset): string;
  /** Next occurrence (never today) of a weekday (0=Sun … 6=Sat) at hh:mm local time in `timeZone` */
  nextWeekday(weekday: number, hh: number, mm: number, timeZone: string): string;
}

const ms = (o: Offset) => ((o.d ?? 0) * 24 * 60 + (o.h ?? 0) * 60 + (o.m ?? 0)) * 60 * 1000;

/** Offset of `timeZone` from UTC at instant `at`, in ms (DST-aware, no library needed). */
function tzOffsetMs(at: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour!, +parts.minute!, +parts.second!);
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

export function createClock(now = Date.now()): Clock {
  return {
    now,
    ago: (o) => new Date(now - ms(o)).toISOString(),
    ahead: (o) => new Date(now + ms(o)).toISOString(),
    nextWeekday(weekday, hh, mm, timeZone) {
      const local = new Date(now + tzOffsetMs(new Date(now), timeZone));
      let add = (weekday - local.getUTCDay() + 7) % 7;
      if (add === 0) add = 7;
      const wallClock = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + add, hh, mm);
      // Convert local wall-clock time to UTC using the offset in effect on that day
      return new Date(wallClock - tzOffsetMs(new Date(wallClock), timeZone)).toISOString();
    },
  };
}
