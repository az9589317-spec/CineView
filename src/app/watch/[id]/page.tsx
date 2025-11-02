'use client';

import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { initializeFirebase } from '@/firebase';
import { Movie } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Skeleton } from '@/components/ui/skeleton';
import { RecommendationsCarousel } from '@/components/ai/recommendations-carousel';

const { firestore } = initializeFirebase();

export default function WatchPage() {
  const { id } = useParams();
  const movieId = typeof id === 'string' ? id : '';

  const [movieDoc, loading, error] = useDocument(doc(firestore, 'movies', movieId));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-[50vh] w-full" />
        <Skeleton className="mb-2 h-8 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !movieDoc?.exists()) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error
              ? 'There was an error loading the movie. Please try again later.'
              : 'The requested movie could not be found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const movie = movieDoc.data() as Movie;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
          {movie.videoUrl ? (
             <video
                src={movie.videoUrl}
                controls
                autoPlay
                className="h-full w-full"
             />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              Video not available.
            </div>
          )}
        </div>
        
        <div className="space-y-4">
            <h1 className="font-headline text-4xl font-bold tracking-tighter">
                {movie.title}
            </h1>
            <p className="text-muted-foreground">
                {movie.longDescription || movie.description}
            </p>
        </div>
      </div>
        
      <div className="mt-16">
        <RecommendationsCarousel />
      </div>

    </div>
  );
}
