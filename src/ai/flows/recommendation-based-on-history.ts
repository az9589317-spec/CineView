'use server';
/**
 * @fileOverview Recommends movies and series based on a user's viewing history.
 *
 * - recommendBasedOnHistory - A function that recommends movies and series based on viewing history.
 * - RecommendationBasedOnHistoryInput - The input type for the recommendBasedOnHistory function.
 * - RecommendationBasedOnHistoryOutput - The return type for the recommendBasedOnHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendationBasedOnHistoryInputSchema = z.object({
  viewingHistory: z
    .string()
    .describe(
      'A comma separated list of titles of movies and series the user has watched.'
    ),
});
export type RecommendationBasedOnHistoryInput = z.infer<
  typeof RecommendationBasedOnHistoryInputSchema
>;

const RecommendationBasedOnHistoryOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'A comma separated list of movie and series recommendations based on the viewing history.'
    ),
});
export type RecommendationBasedOnHistoryOutput = z.infer<
  typeof RecommendationBasedOnHistoryOutputSchema
>;

export async function recommendBasedOnHistory(
  input: RecommendationBasedOnHistoryInput
): Promise<RecommendationBasedOnHistoryOutput> {
  return recommendBasedOnHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendationBasedOnHistoryPrompt',
  input: {schema: RecommendationBasedOnHistoryInputSchema},
  output: {schema: RecommendationBasedOnHistoryOutputSchema},
  prompt: `Based on the following viewing history: {{{viewingHistory}}},
  recommend a list of comma separated movies and series that the user might enjoy.
  Do not explain your recommendation, just list the titles.`,
});

const recommendBasedOnHistoryFlow = ai.defineFlow(
  {
    name: 'recommendBasedOnHistoryFlow',
    inputSchema: RecommendationBasedOnHistoryInputSchema,
    outputSchema: RecommendationBasedOnHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
