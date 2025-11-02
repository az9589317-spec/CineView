'use server';

import { generateAiSummary, AiSummaryInput } from '@/ai/flows/ai-summary-for-title';
import { recommendBasedOnHistory } from '@/ai/flows/recommendation-based-on-history';
import type { Movie } from '@/lib/types';
import { initializeServerApp } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';

export async function getRecommendations(viewingHistory: string): Promise<Movie[]> {
  try {
    const { firestore } = initializeServerApp();
    const moviesSnapshot = await firestore.collection('movies').get();
    const allMovies = moviesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Movie[];

    const result = await recommendBasedOnHistory({ viewingHistory });
    const recommendedTitles = result.recommendations.split(',').map(t => t.trim().toLowerCase());
    
    const recommendedMovies = allMovies.filter(movie => 
      recommendedTitles.includes(movie.title.toLowerCase())
    );
    
    if (recommendedMovies.length < 5) {
      const fallback = allMovies.filter(m => !viewingHistory.includes(m.title)).slice(0, 5 - recommendedMovies.length);
      return [...recommendedMovies, ...fallback];
    }
    
    return recommendedMovies;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
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

export async function saveMovie(movieData: Omit<Movie, 'id' | 'rating'>) {
    try {
        const { firestore } = initializeServerApp();
        const moviesCollection = firestore.collection('movies');
        
        const newMovieData = {
          ...movieData,
          rating: 0, 
        };

        await moviesCollection.add(newMovieData);
        
        revalidatePath('/'); 
        return { success: true, message: 'Movie saved successfully!' };

    } catch (error) {
        console.error('Error saving movie:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to save movie: ${errorMessage}` };
    }
}
