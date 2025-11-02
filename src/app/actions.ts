'use server';

import { generateAiSummary, AiSummaryInput } from '@/ai/flows/ai-summary-for-title';
import { recommendBasedOnHistory } from '@/ai/flows/recommendation-based-on-history';
import { movies } from '@/lib/data';
import type { Movie } from '@/lib/types';
import ImageKit from 'imagekit';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeServerApp } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';

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

async function uploadToImagekit(file: File, type: 'poster' | 'video') {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  
  const folder = type === 'poster' ? '/movie-posters/' : '/movie-videos/';

  try {
    const uploadOptions: any = {
      file: fileBuffer,
      fileName: file.name,
      folder: folder,
    };

    if (type === 'video') {
      uploadOptions.timeout = 300000; // 5 minutes timeout for videos
    }

    const uploadResult = await imagekit.upload(uploadOptions);
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
    return await uploadToImagekit(file, type);
}

export async function saveMovie(movieData: Omit<Movie, 'id' | 'rating'>) {
    try {
        await initializeServerApp();
        const firestore = getAdminFirestore();
        const moviesCollection = firestore.collection('movies');
        
        const newMovieData = {
          ...movieData,
          rating: 0, // default rating
        };

        await moviesCollection.add(newMovieData);
        
        revalidatePath('/'); // Revalidate home page to show new movie
        return { success: true, message: 'Movie saved successfully!' };

    } catch (error) {
        console.error('Error saving movie:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to save movie: ${errorMessage}` };
    }
}
