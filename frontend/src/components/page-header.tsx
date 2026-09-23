import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpecRef } from '@/components/spec-ref';
import { WALKTHROUGH } from '@/lib/spec';

export function PageHeader({
  step,
  title,
  description,
  spec,
  actions,
}: {
  /** Index into WALKTHROUGH, drives the eyebrow and the "next" button */
  step: number;
  title: string;
  description: string;
  spec: string[];
  actions?: React.ReactNode;
}) {
  const next = WALKTHROUGH[step + 1];
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-card/60 px-4 pb-4 pt-5 backdrop-blur sm:gap-4 sm:px-8 sm:pb-5 sm:pt-6">
      <div className="min-w-0 max-w-3xl">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Step {step} of {WALKTHROUGH.length - 1}
          </span>
          <SpecRef sections={spec} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {next && (
          <Button asChild variant="outline" size="sm">
            <Link href={next.href}>
              Next: {next.short}
              <ArrowRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
