'use client';

import { use, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Movie } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();

  const movieRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'movies', id);
  }, [firestore, id]);

  const { data: movie, isLoading, error } = useDoc<Movie>(movieRef);

  // Debug logging
  useEffect(() => {
    console.log('=== Play Page Debug ===');
    console.log('Movie ID:', id);
    console.log('Firestore initialized:', !!firestore);
    console.log('Is loading:', isLoading);
    console.log('Movie data:', movie);
    console.log('Error:', error);
  }, [id, firestore, isLoading, movie, error]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-foreground/60">Loading video...</p>
        <div className='w-full max-w-4xl mt-4'>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="mt-4 aspect-video w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Video</h1>
        <p className="mt-4 text-foreground/60">{error.message}</p>
        <Button asChild className="mt-6">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  if (!movie) {
    console.log('Movie not found, calling notFound()');
    notFound();
    return null;
  }

  return (
    <div className="flex h-screen flex-col items-center bg-black text-white">
      <header className="flex w-full items-center justify-between p-4">
        <Link
          href={`/movies/${movie.id}`}
          className="flex items-center gap-2 text-lg font-semibold transition-opacity hover:opacity-80"
        >
          <ArrowLeft />
          <span>Back to {movie.title}</span>
        </Link>
      </header>
      <div className="flex flex-1 w-full items-center justify-center p-4">
        {movie.videoUrl ? (
          <video src={movie.videoUrl} controls autoPlay className="aspect-video w-full max-w-6xl rounded-lg" />
        ) : (
          <div className="aspect-video w-full max-w-6xl rounded-lg bg-gray-900 flex items-center justify-center">
            <p>Video not available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
