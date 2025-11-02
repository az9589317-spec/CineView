'use client';

import Link from 'next/link';
import { Clapperboard, Search } from 'lucide-react';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Input } from '../ui/input';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Clapperboard className="h-6 w-6 text-accent" />
          <span className="font-headline text-xl font-bold">CineView</span>
        </Link>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <form onSubmit={handleSearch} className="relative hidden w-full max-w-xs md:block">
            <Input
              type="search"
              placeholder="Search movies & series..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </form>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
