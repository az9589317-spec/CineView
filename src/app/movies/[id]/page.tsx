'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, PlayCircle, Bookmark, Check, Calendar } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { use, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWatchlist } from '@/contexts/watchlist-context';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoaded } = useWatchlist();

  const movieRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'movies', id);
  }, [firestore, id]);

  const { data: movie, isLoading, error } = useDoc<Movie>(movieRef);
  const onWatchlist = movie ? isInWatchlist(movie.id) : false;

  // Debug logging
  useEffect(() => {
    console.log('=== Movie Detail Debug ===');
    console.log('Movie ID:', id);
    console.log('Firestore initialized:', !!firestore);
    console.log('Movie ref:', movieRef);
    console.log('Is loading:', isLoading);
    console.log('Movie data:', movie);
    console.log('Error:', error);
  }, [id, firestore, movieRef, isLoading, movie, error]);

  const handleWatchlistClick = () => {
    if (!movie) return;
    if (onWatchlist) {
      removeFromWatchlist(movie.id, movie.title);
    } else {
      addToWatchlist(movie.id, movie.title);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <Skeleton className="h-[50vh] w-full" />
        <div className="container -mt-32 w-full max-w-5xl">
          <div className="relative z-10 flex flex-col gap-8 md:flex-row">
            <Skeleton className="h-[360px] w-full flex-shrink-0 rounded-lg md:w-64" />
            <div className="flex w-full flex-col gap-4 pt-8 text-white">
              <Skeleton className="h-12 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-24 w-full max-w-prose" />
              <div className="mt-4 flex gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Movie</h1>
        <p className="mt-4 text-foreground/60">{error.message}</p>
        <Button asChild className="mt-6">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  // If not loading and no movie data, show 404
  if (!movie) {
    console.log('Movie not found, calling notFound()');
    notFound();
    return null;
  }


  return (
    <div className="flex flex-col pb-12">
      <section className="relative h-[50vh] w-full">
        <Image
          src={movie.heroImageUrl}
          alt={`Backdrop for ${movie.title}`}
          fill
          priority
          className="object-cover"
          data-ai-hint={movie.heroImageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </section>

      <div className="container -mt-24 w-full max-w-6xl">
        <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row">
          <div className="w-full flex-shrink-0 md:w-64">
            <Image
              src={movie.thumbnailUrl}
              alt={`Poster for ${movie.title}`}
              width={500}
              height={750}
              className="rounded-lg shadow-2xl"
              data-ai-hint={movie.cardImageHint}
            />
          </div>
          <div className="flex w-full flex-col gap-4 pt-8 md:pt-32">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-white md:text-5xl">
              {movie.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-foreground/80">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{movie.rating.toFixed(1)} / 10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{movie.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{movie.year}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {movie.genre.map((g: string) => (
                <Badge key={g} variant="secondary">
                  {g}
                </Badge>
              ))}
            </div>

            <p className="max-w-prose text-foreground/80">
              {movie.longDescription}
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/80">
                <Link href={`/play/${movie.id}`}>
                  <PlayCircle />
                  Play
                </Link>
              </Button>
               <Button size="lg" variant="outline" onClick={handleWatchlistClick} disabled={!isLoaded}>
                 {onWatchlist ? <Check /> : <Bookmark />}
                 {onWatchlist ? 'On Watchlist' : 'Add to Watchlist'}
               </Button>
            </div>
          </div>
        </div>

        <div className="mt-12">
            <h2 className="flex items-center gap-2 font-headline text-2xl font-bold">
                <Users className="h-6 w-6"/>
                Cast
            </h2>
            <div className="mt-4 flex flex-wrap gap-4">
                {movie.cast.map((actor: string) => (
                    <div key={actor} className="rounded-full bg-secondary px-4 py-2 text-secondary-foreground">
                        {actor}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
