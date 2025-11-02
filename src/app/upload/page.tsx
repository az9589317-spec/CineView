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
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { movies, genres } from '@/lib/data';
import { MultiSelect } from '@/components/ui/multi-select';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { uploadMovie } from '../actions';

const adminEmails = ['jupiterbania472@gmail.com', 'az9589317@gmail.com'];

const allGenres = genres.map(genre => ({ label: genre, value: genre }));
const allCast = [...new Set(movies.flatMap(movie => movie.cast))].sort().map(actor => ({ label: actor, value: actor }));

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  cast: z.array(z.string()).min(1, 'At least one cast member is required'),
  posterImage: z.instanceof(File).refine(file => file.size > 0, 'Poster image is required.'),
  videoFile: z.instanceof(File).refine(file => file.size > 0, 'Video file is required.'),
});

type UploadFormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      genres: [],
      cast: [],
      posterImage: undefined,
      videoFile: undefined,
    },
  });

  useEffect(() => {
    if (!isUserLoading) {
      if (user && user.email && adminEmails.includes(user.email)) {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    }
  }, [user, isUserLoading, router]);
  
  const onSubmit = async (values: UploadFormValues) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('genres', JSON.stringify(values.genres));
    formData.append('cast', JSON.stringify(values.cast));
    formData.append('posterImage', values.posterImage);
    formData.append('videoFile', values.videoFile);

    const result = await uploadMovie(formData);

    if (result.success) {
      toast({
        title: 'Upload Successful',
        description: `"${values.title}" has been uploaded.`,
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <Label>Title</Label>
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
                    <Label>Description</Label>
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
                    <Label>Genre</Label>
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
                    <Label>Cast</Label>
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
                name="posterImage"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <Label>Poster Image</Label>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoFile"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <Label>Video File</Label>
                    <FormControl>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Movie
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
