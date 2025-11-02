'use server';

/**
 * @fileOverview Generates an AI summary for a given movie or series title.
 *
 * - generateAiSummary - A function that generates the AI summary.
 * - AiSummaryInput - The input type for the generateAiSummary function.
 * - AiSummaryOutput - The return type for the generateAiSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSummaryInputSchema = z.object({
  title: z.string().describe('The title of the movie or series to summarize.'),
  genre: z.string().optional().describe('The genre of the movie or series.'),
  keywords: z.string().optional().describe('Keywords related to the movie or series.'),
});
export type AiSummaryInput = z.infer<typeof AiSummaryInputSchema>;

const AiSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the movie or series.'),
});
export type AiSummaryOutput = z.infer<typeof AiSummaryOutputSchema>;

export async function generateAiSummary(input: AiSummaryInput): Promise<AiSummaryOutput> {
  return aiSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSummaryPrompt',
  input: {schema: AiSummaryInputSchema},
  output: {schema: AiSummaryOutputSchema},
  prompt: `You are an AI assistant designed to provide concise and informative summaries of movies and series.

  Please generate a summary for the following title:
  Title: {{{title}}}
  {{#if genre}}Genre: {{{genre}}}{{/if}}
  {{#if keywords}}Keywords: {{{keywords}}}{{/if}}

  Summary:
  `,
});

const aiSummaryFlow = ai.defineFlow(
  {
    name: 'aiSummaryFlow',
    inputSchema: AiSummaryInputSchema,
    outputSchema: AiSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
