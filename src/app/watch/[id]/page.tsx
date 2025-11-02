"use client";

import React, { Suspense, use } from "react";
import { doc } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { Movie } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationsCarousel } from "@/components/ai/recommendations-carousel";
import { useDoc } from "@/firebase/firestore/use-doc";

function WatchPageContent({ movieId }: { movieId: string }) {
  const firestore = useFirestore();
  const movieRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "movies", movieId);
  }, [firestore, movieId]);

  const { data: movie, isLoading, error } = useDoc<Movie>(movieRef);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-[50vh] w-full" />
        <Skeleton className="mb-2 h-8 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error
              ? "There was an error loading the movie. Please try again later."
              : "The requested movie could not be found."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isGoogleDrive = movie.videoUrl?.includes("drive.google.com");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
          {movie.videoUrl ? (
            isGoogleDrive ? (
              <iframe
                src={movie.videoUrl}
                title={movie.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              ></iframe>
            ) : (
              <video
                src={movie.videoUrl}
                controls
                autoPlay
                className="h-full w-full"
              />
            )
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

export default function WatchPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WatchPageContent movieId={id} />
    </Suspense>
  );
}
