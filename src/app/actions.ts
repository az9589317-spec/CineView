'use server';

import { generateAiSummary, AiSummaryInput } from '@/ai/flows/ai-summary-for-title';
import { recommendBasedOnHistory } from '@/ai/flows/recommendation-based-on-history';
import type { Movie } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getRecommendations(viewingHistory: string): Promise<Movie[]> {
  // This function is now hypothetical as it doesn't have a way to get all movies
  // without a server-side firestore instance. For demo purposes, we can leave it
  // but it won't be able to provide fallback recommendations.
  try {
    const result = await recommendBasedOnHistory({ viewingHistory });
    const recommendedTitles = result.recommendations.split(',').map(t => t.trim().toLowerCase());
    
    // This part of the logic is now broken because we can't query all movies on the server easily.
    // In a real app, you might have a dedicated API endpoint for this.
    // Returning an empty array for now to avoid errors.
    console.warn("getRecommendations cannot currently filter or provide fallbacks as it lacks server-side movie access.");

    return [];
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
