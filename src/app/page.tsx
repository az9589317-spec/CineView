import { MovieCarousel } from '@/components/movie/movie-carousel';
import { movies, genres } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { RecommendationsCarousel } from '@/components/ai/recommendations-carousel';

export default function Home() {
  const featuredMovie = movies[0];
  const trendingMovies = movies.slice(1, 7);
  const newReleases = movies.slice(7);

  return (
    <div className="flex flex-col gap-8 md:gap-16">
      <section className="relative h-[60vh] min-h-[400px] w-full">
        <Image
          src={featuredMovie.heroImageUrl}
          alt={`Hero image for ${featuredMovie.title}`}
          fill
          priority
          className="object-cover"
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
              <Button asChild size="lg" className="bg-accent hover:bg-accent/80">
                <Link href={`/movies/${featuredMovie.id}`}>
                  <PlayCircle />
                  Play Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto flex flex-col gap-8 px-4 md:gap-12 md:px-6">
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
    </div>
  );
}
