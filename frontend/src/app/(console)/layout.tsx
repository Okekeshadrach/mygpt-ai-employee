'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, Menu } from 'lucide-react';
import { Sidebar, usePendingApprovals } from '@/components/console/sidebar';
import { Logo } from '@/components/logo';

/**
 * Owner console shell. Desktop (lg+): sticky sidebar. Mobile/tablet: top bar + slide-out drawer.
 * HOOK(auth): guard this layout with the session (owner/agent roles) once real auth exists.
 * Today every visitor is "Sarah, Managing Broker".
 */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const pending = usePendingApprovals();
  // The live demo needs the full width for phone + pipeline + CRM, so collapse the nav to a rail.
  const collapsed = pathname.startsWith('/live');

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-ink px-3 text-white lg:hidden">
        <button onClick={() => setMenuOpen(true)} className="rounded-md p-2 hover:bg-white/10" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <Logo dark />
        <Link href="/approvals" className="relative rounded-md p-2 hover:bg-white/10" aria-label="Approvals">
          <CheckCheck className="size-5" />
          {pending > 0 && (
            <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-semibold text-ink">
              {pending}
            </span>
          )}
        </Link>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
            >
              <Sidebar drawer onNavigate={() => setMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Sidebar collapsed={collapsed} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
