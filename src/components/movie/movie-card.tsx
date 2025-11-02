'use client';

import Image from 'next/image';
import { Bookmark, Check, PlayCircle } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/contexts/watchlist-context';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoPlayer } from './video-player';

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
    <div className="group relative block w-full cursor-pointer overflow-hidden rounded-lg">
      <Image
        src={movie.thumbnailUrl}
        alt={`Poster for ${movie.title}`}
        width={500}
        height={750}
        className="transform object-cover transition-transform duration-300 group-hover:scale-105"
        data-ai-hint={movie.cardImageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <VideoPlayer movie={movie} trigger={
            <Button size="icon" className="h-14 w-14 rounded-full bg-accent/80 backdrop-blur-sm hover:bg-accent">
                <PlayCircle className="h-8 w-8" />
            </Button>
        }/>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-headline text-lg font-bold text-white drop-shadow-md">
          {movie.title}
        </h3>
        <p className="text-sm text-white/80 drop-shadow-sm">{movie.year}</p>
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
            aria-label={onWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {onWatchlist ? <Check /> : <Bookmark />}
          </Button>
        )}
      </div>
    </div>
  );
}
