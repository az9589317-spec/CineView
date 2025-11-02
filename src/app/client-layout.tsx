'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlayPage = pathname?.startsWith('/play');

  return (
    <div className={cn({ 'bg-black': isPlayPage })}>
      {!isPlayPage && <Header />}
      <main className={cn({ 'pt-16': !isPlayPage })}>{children}</main>
      <Toaster />
    </div>
  );
}
