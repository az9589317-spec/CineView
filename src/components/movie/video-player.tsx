'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bookmark, Check, PlayCircle } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { useWatchlist } from '@/contexts/watchlist-context';

interface VideoPlayerProps {
  movie: Movie;
}

export function VideoPlayer({ movie }: VideoPlayerProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoaded } = useWatchlist();
  const onWatchlist = isInWatchlist(movie.id);

  const handleWatchlistClick = () => {
    if (onWatchlist) {
      removeFromWatchlist(movie.id, movie.title);
    } else {
      addToWatchlist(movie.id, movie.title);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-accent hover:bg-accent/80">
          <PlayCircle />
          Play
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle className="flex items-center justify-between">
            <span>{movie.title}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWatchlistClick}
              disabled={!isLoaded}
            >
              {onWatchlist ? <Check className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
              {onWatchlist ? 'On Watchlist' : 'Add to Watchlist'}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
