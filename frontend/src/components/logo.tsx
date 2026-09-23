import { cn } from '@/lib/utils';

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 shadow-sm">
        <div className="size-2.5 rounded-full bg-white" />
        <div className="absolute right-1 top-1 size-1 rounded-full bg-white/70" />
      </div>
      <span className={cn('text-[15px] font-semibold tracking-tight', dark ? 'text-white' : 'text-foreground')}>
        MyGPT
      </span>
    </div>
  );
}
