'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle, Video, Image as ImageIcon } from 'lucide-react';
import { movies, genres } from '@/lib/data';
import { MultiSelect } from '@/components/ui/multi-select';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { uploadFile, saveMovie } from '../actions';

const adminEmails = ['jupiterbania472@gmail.com', 'az9589317@gmail.com'];

const allGenres = genres.map(genre => ({ label: genre, value: genre }));
const allCast = [...new Set(movies.flatMap(movie => movie.cast))].sort().map(actor => ({ label: actor, value: actor }));

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  cast: z.array(z.string()).min(1, 'At least one cast member is required'),
  posterImage: z.instanceof(File).optional(),
  videoFile: z.instanceof(File).optional(),
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

  const handleFileUpload = async (type: 'poster' | 'video') => {
    const file = type === 'poster' ? posterFile : videoFile;
    if (!file) return;

    setIsUploading(type);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadFile(formData, type);

    if (result.success && result.url) {
      if (type === 'poster') setPosterUrl(result.url);
      if (type === 'video') setVideoUrl(result.url);
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Upload Successful`,
        description: `Your ${type} has been uploaded.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.message,
      });
    }
    setIsUploading(false);
  };
  
  const onSaveMovie = async (values: UploadFormValues) => {
    if (!posterUrl || !videoUrl) {
        toast({
            variant: 'destructive',
            title: 'Missing files',
            description: 'Please upload both a poster and a video file.',
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
      duration: 'N/A',
      thumbnailUrl: posterUrl,
      heroImageUrl: posterUrl,
      cardImageHint: 'movie poster',
      heroImageHint: 'movie hero image',
      videoUrl: videoUrl,
    };

    const result = await saveMovie(movieData);

    if (result.success) {
      toast({
        title: 'Movie Saved!',
        description: `"${values.title}" has been successfully added.`,
      });
      form.reset();
      setPosterUrl(null);
      setVideoUrl(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to Save Movie',
        description: result.message,
      });
    }
    setIsUploading(false);
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
                        render={({ field: { onChange, onBlur, name, ref } }) => (
                        <FormItem className="flex-1">
                            <FormLabel className={posterUrl ? 'text-muted-foreground' : ''}>Poster Image</FormLabel>
                            <FormControl>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onChange(e.target.files?.[0])}
                                onBlur={onBlur}
                                name={name}
                                ref={ref}
                                disabled={isFormDisabled || !!posterUrl}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="button" onClick={() => handleFileUpload('poster')} disabled={!posterFile || !!posterUrl || isUploading === 'poster'}>
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
                        render={({ field: { onChange, onBlur, name, ref } }) => (
                        <FormItem className="flex-1">
                            <FormLabel className={videoUrl ? 'text-muted-foreground' : ''}>Video File</FormLabel>
                            <FormControl>
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={(e) => onChange(e.target.files?.[0])}
                                onBlur={onBlur}
                                name={name}
                                ref={ref}
                                disabled={isFormDisabled || !!videoUrl}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="button" onClick={() => handleFileUpload('video')} disabled={!videoFile || !!videoUrl || isUploading === 'video'}>
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
