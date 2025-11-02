'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, ListVideo, Sparkles, Upload } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/watchlist', label: 'Watchlist', icon: ListVideo },
  { href: '/ai-summary', label: 'AI Summary', icon: Sparkles },
];

const adminEmails = ['jupiterbania472@gmail.com', 'az9589317@gmail.com'];

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const isAdmin = user && user.email && adminEmails.includes(user.email);

  return (
    <nav className="hidden items-center space-x-4 md:flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent',
            pathname === item.href ? 'text-accent' : 'text-foreground/60'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/upload"
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent',
            pathname === '/upload' ? 'text-accent' : 'text-foreground/60'
          )}
        >
          <Upload className="h-4 w-4" />
          Upload Movie
        </Link>
      )}
    </nav>
  );
}
