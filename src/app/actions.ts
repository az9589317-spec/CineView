'use server';

import { generateAiSummary, AiSummaryInput } from '@/ai/flows/ai-summary-for-title';
import { recommendBasedOnHistory } from '@/ai/flows/recommendation-based-on-history';
import { movies } from '@/lib/data';
import type { Movie } from '@/lib/types';
import ImageKit from 'imagekit';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function getRecommendations(viewingHistory: string): Promise<Movie[]> {
  try {
    const result = await recommendBasedOnHistory({ viewingHistory });
    const recommendedTitles = result.recommendations.split(',').map(t => t.trim().toLowerCase());
    
    const recommendedMovies = movies.filter(movie => 
      recommendedTitles.includes(movie.title.toLowerCase())
    );
    
    // To ensure some results are returned if AI gives unexpected titles
    if (recommendedMovies.length < 5) {
      const fallback = movies.filter(m => !viewingHistory.includes(m.title)).slice(0, 5 - recommendedMovies.length);
      return [...recommendedMovies, ...fallback];
    }
    
    return recommendedMovies;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // Return a generic list on error
    return movies.slice(0, 5);
  }
}

export async function getAiSummary(input: AiSummaryInput): Promise<string> {
  try {
    if (!input.title) {
        return "Please provide a title to generate a summary.";
    }
    const result = await generateAiSummary(input);
    return result.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Could not generate summary. The AI model may be unavailable. Please try again later.';
  }
}

export async function uploadMovie(formData: FormData) {
  try {
    const { firestore } = initializeFirebase();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const genres = JSON.parse(formData.get('genres') as string);
    const cast = JSON.parse(formData.get('cast') as string);
    const posterImage = formData.get('posterImage') as File;
    const videoFile = formData.get('videoFile') as File;

    if (!title || !description || !genres.length || !cast.length || !posterImage || !videoFile) {
      return { success: false, message: 'Missing required fields' };
    }

    const posterImageBuffer = Buffer.from(await posterImage.arrayBuffer());
    const videoFileBuffer = Buffer.from(await videoFile.arrayBuffer());

    const [posterUploadResult, videoUploadResult] = await Promise.allSettled([
      imagekit.upload({
        file: posterImageBuffer,
        fileName: posterImage.name,
        folder: '/movie-posters/',
      }),
      imagekit.upload({
        file: videoFileBuffer,
        fileName: videoFile.name,
        folder: '/movie-videos/',
      }),
    ]);

    if (posterUploadResult.status === 'rejected') {
      throw new Error(`Poster upload failed: ${posterUploadResult.reason.message}`);
    }
    if (videoUploadResult.status === 'rejected') {
      throw new Error(`Video upload failed: ${videoUploadResult.reason.message}`);
    }

    const posterUpload = posterUploadResult.value;
    const videoUpload = videoUploadResult.value;

    const newMovie = {
      title,
      description,
      longDescription: description,
      year: new Date().getFullYear(),
      genre: genres,
      cast,
      rating: 0,
      duration: 'N/A',
      thumbnailUrl: posterUpload.url,
      heroImageUrl: posterUpload.url,
      cardImageHint: 'movie poster',
      heroImageHint: 'movie hero image',
      videoUrl: videoUpload.url
    };
    
    const moviesCollection = collection(firestore, 'movies');
    await addDocumentNonBlocking(moviesCollection, newMovie);

    return { success: true, message: 'Movie uploaded successfully!' };
  } catch (error) {
    console.error('Error uploading movie:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Upload failed: ${errorMessage}` };
  }
}
