
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Check, PlayCircle, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/contexts/watchlist-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface MovieCardProps {
  movie: Movie;
}

const adminEmails = ['jupiterbania472@gmail.com', 'az9589317@gmail.com'];

export function MovieCard({ movie }: MovieCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoaded } = useWatchlist();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const onWatchlist = isInWatchlist(movie.id);
  const isAdmin = user && user.email && adminEmails.includes(user.email);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWatchlist) {
      removeFromWatchlist(movie.id, movie.title);
    } else {
      addToWatchlist(movie.id, movie.title);
    }
  };

  const handleDelete = async () => {
    if (!firestore) return;
    setIsDeleting(true);
    try {
      const movieRef = doc(firestore, 'movies', movie.id);
      await deleteDoc(movieRef);
      toast({
        title: 'Movie Deleted',
        description: `"${movie.title}" has been removed.`,
      });
      setIsAlertOpen(false);
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the movie. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/edit/${movie.id}`);
  };
  
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };


  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <div className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl">
        <Link href={`/watch/${movie.id}`} className="block h-full w-full">
            <div className="aspect-[2/3] w-full">
                <Image
                src={movie.thumbnailUrl}
                alt={`Poster for ${movie.title}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="transform object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={movie.cardImageHint} />
            </div>
            
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/50">
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-accent/80 backdrop-blur-sm hover:bg-accent"
                asChild
                >
                <PlayCircle className="h-8 w-8" />
              </Button>
            </div>
        </Link>
        
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-8 text-white">
            <h3 className="font-headline text-base font-bold truncate">
                {movie.title}
            </h3>
            <p className="text-sm text-white/70">{movie.year}</p>
        </div>


          <div className="absolute right-2 top-2" onClick={stopPropagation} onTouchStart={stopPropagation}>
            {isAdmin ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full h-8 w-8 bg-background/50 text-foreground backdrop-blur-sm transition-transform duration-200 hover:scale-110 hover:bg-accent hover:text-accent-foreground"
                            aria-label="More options">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={stopPropagation}>
                        <DropdownMenuItem onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                !isLoaded ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleWatchlistClick}
                  className="rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-transform duration-200 hover:scale-110 hover:bg-accent hover:text-accent-foreground"
                  aria-label={onWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}>
                  {onWatchlist ? <Check /> : <Bookmark />}
                </Button>
              )
            )}
          </div>
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the movie
            "{movie.title}" from your library.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/80">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
