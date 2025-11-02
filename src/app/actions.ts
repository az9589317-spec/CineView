'use server';

import { generateAiSummary, AiSummaryInput } from '@/ai/flows/ai-summary-for-title';
import { recommendBasedOnHistory } from '@/ai/flows/recommendation-based-on-history';
import { movies } from '@/lib/data';
import type { Movie } from '@/lib/types';

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
