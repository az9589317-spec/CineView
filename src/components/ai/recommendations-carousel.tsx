'use client';

import { useEffect, useState } from 'react';
import type { Movie } from '@/lib/types';
import { getRecommendations } from '@/app/actions';
import { MovieCarousel } from '../movie/movie-carousel';
import { Skeleton } from '../ui/skeleton';

export function RecommendationsCarousel() {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true);
      // Hardcoded viewing history for demonstration purposes
      const viewingHistory = 'Cosmic Odyssey, City of Shadows, Fist of the Dragon';
      const movies = await getRecommendations(viewingHistory);
      setRecommendedMovies(movies);
      setIsLoading(false);
    }
    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <section>
        <h2 className="mb-4 font-headline text-2xl font-bold tracking-tight">
          Recommended for You
        </h2>
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1/5">
              <Skeleton className="aspect-[2/3]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (recommendedMovies.length === 0) {
    return null;
  }

  return <MovieCarousel title="Recommended for You" movies={recommendedMovies} />;
}
