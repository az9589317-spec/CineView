'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, PlayCircle } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { use } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();

  const movieRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'movies', id);
  }, [firestore, id]);

  const { data: movie, isLoading } = useDoc<Movie>(movieRef);

  if (isLoading) {
    return (
        <div className="flex flex-col">
          <Skeleton className="h-[50vh] w-full" />
          <div className="container -mt-32 w-full max-w-5xl">
            <div className="relative z-10 flex flex-col gap-8 md:flex-row">
              <Skeleton className="h-[360px] w-full flex-shrink-0 md:w-64" />
              <div className="flex flex-col gap-4 pt-8 text-white">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-3/4" />
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-24 w-full max-w-prose" />
                <div className="mt-4">
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
            </div>
            <div className="mt-12">
              <Skeleton className="h-8 w-32" />
              <div className="mt-4 flex flex-wrap gap-4">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      );
  }

  if (!movie) {
    if (!isLoading) {
      notFound();
    }
    return null; // Return null while loading to prevent premature notFound call
  }

  return (
    <div className="flex flex-col">
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

      <div className="container -mt-32 w-full max-w-5xl">
        <div className="relative z-10 flex flex-col gap-8 md:flex-row">
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
          <div className="flex flex-col gap-4 pt-8 text-white">
            <p className="text-sm text-foreground/70">{movie.year}</p>
            <h1 className="font-headline text-4xl font-bold tracking-tighter md:text-5xl">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {movie.genre.map((g: string) => (
                <Badge key={g} variant="secondary">
                  {g}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{movie.rating.toFixed(1)} / 10</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{movie.duration}</span>
              </div>
            </div>
            <p className="max-w-prose text-foreground/80">
              {movie.longDescription}
            </p>
            <div className="mt-4">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/80">
                <Link href={`/play/${movie.id}`}>
                  <PlayCircle />
                  Play
                </Link>
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
