'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Movie } from '@/lib/types';
import { getRecommendations } from '@/app/actions';
import { MovieCarousel } from '../movie/movie-carousel';
import { Skeleton } from '../ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


export function RecommendationsCarousel() {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const firestore = useFirestore();
  const moviesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'movies');
  }, [firestore]);
  const { data: movies } = useCollection<Movie>(moviesQuery);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!movies || movies.length === 0) return;
      setIsLoading(true);
      // Hardcoded viewing history for demonstration purposes
      const viewingHistory = movies.slice(0,3).map(m => m.title).join(', ');
      const recommended = await getRecommendations(viewingHistory);
      setRecommendedMovies(recommended);
      setIsLoading(false);
    }
    fetchRecommendations();
  }, [movies]);

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
