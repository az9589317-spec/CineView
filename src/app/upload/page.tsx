'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { movies, genres } from '@/lib/data';
import { MultiSelect } from '@/components/ui/multi-select';

const adminEmails = ['jupiterbania472@gmail.com', 'az9589317@gmail.com'];

const allGenres = genres.map(genre => ({ label: genre, value: genre }));
const allCast = [...new Set(movies.flatMap(movie => movie.cast))].sort().map(actor => ({ label: actor, value: actor }));

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCast, setSelectedCast] = useState<string[]>([]);

  useEffect(() => {
    if (!isUserLoading) {
      if (user && user.email && adminEmails.includes(user.email)) {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
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
          <form className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Movie Title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Movie Description" />
            </div>
            <div>
              <Label>Genre</Label>
              <MultiSelect
                options={allGenres}
                onValueChange={setSelectedGenres}
                defaultValue={selectedGenres}
                placeholder="Select genres"
                variant="secondary"
              />
            </div>
            <div>
              <Label>Cast</Label>
               <MultiSelect
                options={allCast}
                onValueChange={setSelectedCast}
                defaultValue={selectedCast}
                placeholder="Select cast members"
                variant="secondary"
              />
            </div>
            <div>
              <Label htmlFor="image">Poster Image</Label>
              <Input id="image" type="file" />
            </div>
            <div>
              <Label htmlFor="video">Video File</Label>
              <Input id="video" type="file" />
            </div>
            <Button type="submit">Upload Movie</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
