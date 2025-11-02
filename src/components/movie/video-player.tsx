'use client';

import { Button } from '@/components/ui/button';
import { Bookmark, Check, PlayCircle } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { useWatchlist } from '@/contexts/watchlist-context';
import Link from 'next/link';

interface VideoPlayerProps {
  movie: Movie;
}

export function VideoPlayer({ movie }: VideoPlayerProps) {
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
    <div className="flex items-center gap-4">
        <Button size="lg" className="bg-accent hover:bg-accent/80" asChild>
            <Link href={`/watch/${movie.id}`}>
                <PlayCircle />
                Play
            </Link>
        </Button>
        <Button
            variant="outline"
            size="lg"
            onClick={handleWatchlistClick}
            disabled={!isLoaded}
            >
            {onWatchlist ? <Check className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
            {onWatchlist ? 'On Watchlist' : 'Add to Watchlist'}
        </Button>
    </div>
  );
}
