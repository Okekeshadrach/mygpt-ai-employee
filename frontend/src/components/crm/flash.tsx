'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Highlights its content in emerald whenever `watch` changes (not on first render).
 * Used to make live CRM updates visible during the demo.
 */
export function Flash({ watch, children, className }: { watch: unknown; children: React.ReactNode; className?: string }) {
  const key = JSON.stringify(watch);
  const first = useRef(true);
  useEffect(() => {
    first.current = false;
  }, []);
  return (
    <motion.div
      key={key}
      initial={first.current ? false : { backgroundColor: 'rgba(16,185,129,0.22)' }}
      animate={{ backgroundColor: 'rgba(16,185,129,0)' }}
      transition={{ duration: 2.4, ease: 'easeOut' }}
      className={cn('-mx-2 rounded-md px-2', className)}
    >
      {children}
    </motion.div>
  );
}
