'use client';

import { useWatchlist } from '@/contexts/watchlist-context';
import { movies } from '@/lib/data';
import { MovieCard } from '@/components/movie/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListVideo } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WatchlistPage() {
  const { watchlist, isLoaded } = useWatchlist();

  const watchlistMovies = movies.filter((movie) => watchlist.includes(movie.id));

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 font-headline text-4xl font-bold tracking-tighter">
        My Watchlist
      </h1>
      {!isLoaded ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
          ))}
        </div>
      ) : watchlistMovies.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {watchlistMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border text-center">
            <ListVideo className="h-16 w-16 text-muted-foreground" />
            <h2 className="font-headline text-2xl font-semibold">Your watchlist is empty</h2>
            <p className="text-muted-foreground">Add movies to your watchlist to see them here.</p>
            <Button asChild>
                <Link href="/">Browse Movies</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
