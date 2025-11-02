'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle, Video, Image as ImageIcon } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Movie } from '@/lib/types';
import { revalidatePath } from 'next/cache';


const adminEmails = ['jupiterbania472@gmail.com', 'az9589317@gmail.com'];

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  cast: z.array(z.string()).min(1, 'At least one cast member is required'),
  posterImage: z.instanceof(File).refine(file => file.size > 0, "Poster image is required.").optional(),
  videoFile: z.instanceof(File).refine(file => file.size > 0, "Video file is required.").optional(),
});

type UploadFormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [isUploading, setIsUploading] = useState<'poster' | 'video' | 'movie' | false>(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const firestore = useFirestore();
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


  const form = useForm<UploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      genres: [],
      cast: [],
    },
  });
  
  const posterFile = form.watch('posterImage');
  const videoFile = form.watch('videoFile');


  useEffect(() => {
    if (!isUserLoading) {
      if (user && user.email && adminEmails.includes(user.email)) {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    }
  }, [user, isUserLoading, router]);
  
  const handleClientUpload = async (file: File, type: 'poster' | 'video') => {
    if (!file) return;

    setIsUploading(type);

    try {
      // 1. Get authentication parameters from our API route
      const authResponse = await fetch('/api/imagekit-auth');
      if (!authResponse.ok) {
        throw new Error('Failed to get authentication parameters.');
      }
      const authData = await authResponse.json();

      // 2. Upload the file directly to ImageKit
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
      formData.append('signature', authData.signature);
      formData.append('expire', authData.expire);
      formData.append('token', authData.token);
      
      const folder = type === 'poster' ? '/movie-posters/' : '/movie-videos/';
      formData.append('folder', folder);

      const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorResult = await uploadResponse.json();
        throw new Error(errorResult.message || 'ImageKit upload failed.');
      }

      const result = await uploadResponse.json();

      if (type === 'poster') setPosterUrl(result.url);
      if (type === 'video') setVideoUrl(result.url);
      
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Upload Successful`,
        description: `Your ${type} has been uploaded.`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSaveMovie = async (values: UploadFormValues) => {
    if (!posterUrl || !videoUrl || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Missing files or connection',
            description: 'Please upload both a poster and a video file, and ensure you are connected.',
        });
        return;
    }
    
    setIsUploading('movie');

    const movieData = {
      title: values.title,
      description: values.description,
      longDescription: values.description,
      year: new Date().getFullYear(),
      genre: values.genres,
      cast: values.cast,
      rating: 0,
      duration: 'N/A',
      thumbnailUrl: posterUrl,
      heroImageUrl: posterUrl,
      cardImageHint: 'movie poster',
      heroImageHint: 'movie hero image',
      videoUrl: videoUrl,
    };

    try {
        const moviesCollection = collection(firestore, 'movies');
        await addDoc(moviesCollection, movieData);

        toast({
            title: 'Movie Saved!',
            description: `"${values.title}" has been successfully added.`,
        });
        form.reset();
        setPosterUrl(null);
        setVideoUrl(null);
        // Manually trigger revalidation if needed, though useCollection should update
        // revalidatePath('/'); 
    } catch (error) {
        console.error("Error saving movie:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            variant: 'destructive',
            title: 'Failed to Save Movie',
            description: errorMessage,
        });
    } finally {
        setIsUploading(false);
    }
  };

  if (isUserLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isFormDisabled = !!isUploading;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload New Movie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveMovie)} className="space-y-6">
              <fieldset disabled={isFormDisabled} className="space-y-4">
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
              </fieldset>

              <div className="space-y-4 rounded-lg border bg-card p-4">
                 <div className="flex items-center gap-4">
                    {posterUrl ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                    <FormField
                        control={form.control}
                        name="posterImage"
                        render={({ field: { onChange, onBlur, ref } }) => (
                        <FormItem className="flex-1">
                            <FormLabel className={posterUrl ? 'text-muted-foreground' : ''}>Poster Image</FormLabel>
                            <FormControl>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onChange(e.target.files?.[0])}
                                onBlur={onBlur}
                                ref={ref}
                                disabled={isFormDisabled || !!posterUrl}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="button" onClick={() => handleClientUpload(posterFile!, 'poster')} disabled={!posterFile || !!posterUrl || isUploading === 'poster'}>
                        {isUploading === 'poster' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload Poster
                    </Button>
                 </div>
              </div>

              <div className="space-y-4 rounded-lg border bg-card p-4">
                <div className="flex items-center gap-4">
                    {videoUrl ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Video className="h-6 w-6 text-muted-foreground" />
                    )}
                    <FormField
                        control={form.control}
                        name="videoFile"
                        render={({ field: { onChange, onBlur, ref } }) => (
                        <FormItem className="flex-1">
                            <FormLabel className={videoUrl ? 'text-muted-foreground' : ''}>Video File</FormLabel>
                            <FormControl>
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={(e) => onChange(e.target.files?.[0])}
                                onBlur={onBlur}
                                ref={ref}
                                disabled={isFormDisabled || !!videoUrl}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="button" onClick={() => handleClientUpload(videoFile!, 'video')} disabled={!videoFile || !!videoUrl || isUploading === 'video'}>
                        {isUploading === 'video' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload Video
                    </Button>
                </div>
              </div>
              
              <Button type="submit" disabled={isFormDisabled || !posterUrl || !videoUrl}>
                {isUploading === 'movie' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Movie
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
