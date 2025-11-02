import { SummaryGenerator } from '@/components/ai/summary-generator';
import { Sparkles } from 'lucide-react';

export default function AiSummaryPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="flex flex-col items-center text-center">
        <Sparkles className="h-12 w-12 text-accent" />
        <h1 className="mt-4 font-headline text-4xl font-bold tracking-tighter">
          AI Content Summary Tool
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Get a concise, informative summary of any movie or series. Just provide a title, and optionally add genres or keywords to refine the results.
        </p>
      </div>

      <div className="mt-12">
        <SummaryGenerator />
      </div>
    </div>
  );
}
