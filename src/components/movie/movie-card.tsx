'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Check, PlayCircle } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/contexts/watchlist-context';
import { Skeleton } from '@/components/ui/skeleton';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoaded } = useWatchlist();
  const onWatchlist = isInWatchlist(movie.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWatchlist) {
      removeFromWatchlist(movie.id, movie.title);
    } else {
      addToWatchlist(movie.id, movie.title);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/watch/${movie.id}`}
        className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl aspect-[2/3]">

        <Image
          src={movie.thumbnailUrl}
          alt={`Poster for ${movie.title}`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="transform object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={movie.cardImageHint} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-accent/80 backdrop-blur-sm hover:bg-accent">
              <PlayCircle className="h-8 w-8" />
          </Button>
        </div>

        <div className="absolute right-2 top-2">
          {!isLoaded ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <Button
              size="icon"
              variant="secondary"
              onClick={handleWatchlistClick}
              className="rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-transform duration-200 hover:scale-110 hover:bg-accent hover:text-accent-foreground"
              aria-label={onWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}>
              {onWatchlist ? <Check /> : <Bookmark />}
            </Button>
          )}
        </div>
      </Link>
      <div className="flex flex-col">
        <h3 className="font-headline text-base font-bold text-foreground truncate">
          {movie.title}
        </h3>
        <p className="text-sm text-muted-foreground">{movie.year}</p>
      </div>
    </div>
  );
}
