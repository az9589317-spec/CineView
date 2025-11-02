'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import type { Movie } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();

  const movieRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'movies', id);
  }, [firestore, id]);

  const { data: movie, isLoading } = useDoc<Movie>(movieRef);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black p-4">
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="aspect-video w-full max-w-4xl" />
      </div>
    );
  }

  if (!movie) {
    notFound();
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
