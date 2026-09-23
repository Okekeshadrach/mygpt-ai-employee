'use client';

import { BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SPEC_SECTIONS } from '@/lib/spec';
import { cn } from '@/lib/utils';

/** Small "§7" chips that tie each screen back to the product spec, for narrating the architecture. */
export function SpecRef({ sections, className, dark }: { sections: string[]; className?: string; dark?: boolean }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <BookOpen className={cn('size-3.5', dark ? 'text-white/40' : 'text-muted-foreground')} />
      {sections.map((s) => (
        <Tooltip key={s}>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'cursor-help rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] font-medium',
                dark
                  ? 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
                  : 'border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground',
              )}
            >
              {s}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Spec {s}: {SPEC_SECTIONS[s] ?? 'see the product spec'}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
