'use client';

import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { initializeFirebase } from '@/firebase';
import { Movie } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

const { firestore } = initializeFirebase();

export default function WatchPage() {
  const { id } = useParams();
  const movieId = typeof id === 'string' ? id : '';

  const [movieDoc, loading, error] = useDocument(doc(firestore, 'movies', movieId));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {/* You can replace this with a more sophisticated skeleton loader */}
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading the movie. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!movieDoc?.exists()) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Movie not found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The requested movie could not be found.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  const movie = movieDoc.data() as Movie;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">{movie.title}</h1>
      <div className="aspect-video w-full">
          {movie.videoUrl ? (
             <video
                src={movie.videoUrl}
                controls
                autoPlay
                className="h-full w-full"
             />
          ) : (
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            ></iframe>
          )}
        </div>
      <div className="mt-4">
        <p className="text-lg">{movie.description}</p>
      </div>
    </div>
  );
}
