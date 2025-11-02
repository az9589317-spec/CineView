'use server';

import { generateAiSummary, AiSummaryInput } from '@/ai/flows/ai-summary-for-title';
import { recommendBasedOnHistory } from '@/ai/flows/recommendation-based-on-history';
import { movies } from '@/lib/data';
import type { Movie } from '@/lib/types';
import ImageKit from 'imagekit';
import { addDoc, collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { revalidatePath } from 'next/cache';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

async function uploadToImagekit(file: File, folder: string) {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const base64File = fileBuffer.toString('base64');
  
  try {
    const uploadResult = await imagekit.upload({
      file: base64File,
      fileName: file.name,
      folder: folder,
    });
    return { success: true, url: uploadResult.url };
  } catch (error) {
    console.error('[ImageKit Upload Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during upload.';
    return { success: false, message: `Upload failed: ${errorMessage}` };
  }
}

export async function uploadFile(formData: FormData, type: 'poster' | 'video') {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, message: 'No file provided.' };
    }
    const folder = type === 'poster' ? '/movie-posters/' : '/movie-videos/';
    return await uploadToImagekit(file, folder);
}

export async function saveMovie(movieData: Omit<Movie, 'id' | 'rating'>) {
    try {
        const { firestore } = initializeFirebase();
        const moviesCollection = collection(firestore, 'movies');
        
        const newMovieData = {
          ...movieData,
          rating: 0, // default rating
        };

        await addDoc(moviesCollection, newMovieData);
        
        revalidatePath('/'); // Revalidate home page to show new movie
        return { success: true, message: 'Movie saved successfully!' };

    } catch (error) {
        console.error('Error saving movie:', error);
        
        // This is a Firestore permission error, let's format it for the emitter
        if (error instanceof Error && error.message.includes('permission-denied')) {
             const { firestore } = initializeFirebase();
             const moviesCollection = collection(firestore, 'movies');
             errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                  path: moviesCollection.path,
                  operation: 'create',
                  requestResourceData: movieData,
                })
              );
        }
        
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to save movie: ${errorMessage}` };
    }
}
