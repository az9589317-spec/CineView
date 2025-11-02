
'use client';

import { MovieCarousel } from '@/components/movie/movie-carousel';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlayCircle, Upload, Film } from 'lucide-react';
import { RecommendationsCarousel } from '@/components/ai/recommendations-carousel';
import { useUser } from '@/firebase/auth/use-user';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Movie } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoPlayer } from '@/components/movie/video-player';

const adminEmails = ['jupiterbania472@gmail.com', 'az9589317@gmail.com'];

export default function Home() {
  const { user } = useUser();
  const isAdmin = user && user.email && adminEmails.includes(user.email);
  const firestore = useFirestore();

  const moviesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'movies');
  }, [firestore]);

  const { data: movies, isLoading } = useCollection<Movie>(moviesQuery);

  const [featuredMovie, setFeaturedMovie] = useState<Movie | undefined>(undefined);
  const [featuredMovieIndex, setFeaturedMovieIndex] = useState(0);

  const trendingMovies = useMemo(() => movies?.slice(0, 7) || [], [movies]);
  const newReleases = useMemo(() => movies?.slice(7, 14) || [], [movies]);
  
  const featuredPool = useMemo(() => {
      const pool = [...trendingMovies, ...newReleases];
      // remove duplicates and limit to 5
      return pool.filter((movie, index, self) => 
        index === self.findIndex((m) => m.id === movie.id)
      ).slice(0, 5);
  }, [trendingMovies, newReleases]);


  useEffect(() => {
    if (featuredPool.length > 0) {
      setFeaturedMovie(featuredPool[featuredMovieIndex]);

      const interval = setInterval(() => {
        setFeaturedMovieIndex((prevIndex) => (prevIndex + 1) % featuredPool.length);
      }, 3000); // Change movie every 3 seconds

      return () => clearInterval(interval);
    }
  }, [featuredPool, featuredMovieIndex]);

  useEffect(() => {
    if (featuredPool.length > 0) {
        setFeaturedMovie(featuredPool[featuredMovieIndex]);
    }
  }, [featuredMovieIndex, featuredPool]);


  const genres = useMemo(() => {
    if (!movies) return [];
    return [...new Set(movies.flatMap((movie) => movie.genre))].sort();
  }, [movies]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col">
        <Skeleton className="h-[60vh] w-full" />
        <div className="container mx-auto space-y-8 py-8">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-1/5" />)}
          </div>
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-1/5" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
       {isAdmin && (
        <div className="container mx-auto mt-4 flex justify-end">
           <Button asChild>
            <Link href="/upload" className={cn('flex items-center gap-2')}>
              <Upload className="h-4 w-4" />
              Upload Movie
            </Link>
          </Button>
        </div>
      )}

      {movies && movies.length > 0 && featuredMovie ? (
        <>
          <section className="relative h-[60vh] min-h-[400px] w-full mt-4 overflow-hidden">
            <Image
              key={featuredMovie.id}
              src={featuredMovie.heroImageUrl}
              alt={`Hero image for ${featuredMovie.title}`}
              fill
              priority
              className="object-cover animate-slide-in-from-right"
              data-ai-hint={featuredMovie.heroImageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 flex items-end p-4 md:p-8 lg:p-12">
              <div className="flex w-full max-w-2xl flex-col gap-4">
                <h1 className="font-headline text-4xl font-bold tracking-tighter md:text-6xl lg:text-7xl">
                  {featuredMovie.title}
                </h1>
                <p className="max-w-prose text-sm text-foreground/80 md:text-base">
                  {featuredMovie.description}
                </p>
                <div className="flex items-center gap-4">
                  <VideoPlayer movie={featuredMovie} />
                </div>
              </div>
            </div>
          </section>

          <div className="container mx-auto flex flex-col gap-8 px-4 py-8 md:gap-12 md:px-6">
            <MovieCarousel title="Trending Now" movies={trendingMovies} />
            <RecommendationsCarousel />
            <MovieCarousel title="New Releases" movies={newReleases} />
            {genres.map((genre) => (
              <MovieCarousel
                key={genre}
                title={genre}
                movies={movies.filter((m) => m.genre.includes(genre))}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
            <Film className="h-16 w-16 text-muted-foreground" />
            <h2 className="font-headline text-3xl font-bold">No Movies Found</h2>
            <p className="max-w-md text-muted-foreground">It looks like there are no movies in the library yet. Admins can add movies using the upload page.</p>
            {isAdmin && (
                <Button asChild size="lg">
                    <Link href="/upload">
                        <Upload className="mr-2"/>
                        Upload First Movie
                    </Link>
                </Button>
            )}
        </div>
      )}
    </div>
  );
}
