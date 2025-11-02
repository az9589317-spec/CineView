
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Edit, Video, Image as ImageIcon, Link2 } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCollection, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Movie } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGoogleDriveEmbedUrl } from '@/lib/google-drive';

const adminEmails = ['jupiterbania472@gmail.com', 'az9589317@gmail.com'];

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  cast: z.array(z.string()).min(1, 'At least one cast member is required'),
  videoUrl: z.string().min(1, 'A video URL is required'),
});

type EditFormValues = z.infer<typeof formSchema>;

export default function EditPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const movieId = params.id as string;
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const firestore = useFirestore();

  const movieRef = useMemoFirebase(() => {
    if (!firestore || !movieId) return null;
    return doc(firestore, 'movies', movieId);
  }, [firestore, movieId]);
  const { data: movie, isLoading: isMovieLoading } = useDoc<Movie>(movieRef);

  const moviesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'movies');
  }, [firestore]);
  const { data: movies } = useCollection<Movie>(moviesQuery);

  const allGenres = useMemo(() => {
    if (!movies) return [];
    const genres = new Set(movies.flatMap(movie => movie.genre));
    return Array.from(genres).sort().map(g => ({ label: g, value: g }));
  }, [movies]);

  const allCast = useMemo(() => {
    if (!movies) return [];
    const cast = new Set(movies.flatMap(movie => movie.cast));
    return Array.from(cast).sort().map(c => ({ label: c, value: c }));
  }, [movies]);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      genres: [],
      cast: [],
      videoUrl: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading) {
      if (user && user.email && adminEmails.includes(user.email)) {
        setIsAuthorized(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Unauthorized',
          description: 'You do not have permission to access this page.',
        });
        router.push('/');
      }
    }
  }, [user, isUserLoading, router, toast]);

  useEffect(() => {
    if (movie) {
      form.reset({
        title: movie.title,
        description: movie.description,
        genres: movie.genre,
        cast: movie.cast,
        videoUrl: movie.videoUrl,
      });
    }
  }, [movie, form]);

  const onSaveMovie = async (values: EditFormValues) => {
    let finalVideoUrl = values.videoUrl;
    const googleDriveUrl = getGoogleDriveEmbedUrl(finalVideoUrl);
    if (googleDriveUrl) {
      finalVideoUrl = googleDriveUrl;
    }

    if (!movieRef) return;
    
    setIsSaving(true);

    const movieData = {
      title: values.title,
      description: values.description,
      longDescription: values.description,
      genre: values.genres,
      cast: values.cast,
      videoUrl: finalVideoUrl,
    };

    try {
      await updateDoc(movieRef, movieData);
      toast({
        title: 'Movie Updated!',
        description: `"${values.title}" has been successfully updated.`,
      });
      router.push('/');
    } catch (error) {
      console.error("Error updating movie:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Failed to Update Movie',
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || !isAuthorized || isMovieLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Edit Movie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveMovie)} className="space-y-6">
              <fieldset disabled={isSaving} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Movie Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Movie Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <MultiSelect
                        options={allGenres}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        placeholder="Select genres"
                        variant="secondary"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cast"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cast</FormLabel>
                      <MultiSelect
                        options={allCast}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        placeholder="Select cast members"
                        variant="secondary"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., https://example.com/video.mp4 or a Google Drive link" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </fieldset>
              
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
