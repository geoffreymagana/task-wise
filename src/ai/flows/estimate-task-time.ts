'use server';

/**
 * @fileOverview An AI agent for estimating the time required for a task based on its description.
 *
 * - estimateTaskTime - A function that estimates the time required for a task.
 * - EstimateTaskTimeInput - The input type for the estimateTaskTime function.
 * - EstimateTaskTimeOutput - The return type for the estimateTaskTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateTaskTimeInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().describe('A detailed description of the task.'),
  complexity: z.enum(['low', 'medium', 'high']).describe('The complexity level of the task.'),
});
export type EstimateTaskTimeInput = z.infer<typeof EstimateTaskTimeInputSchema>;

const EstimateTaskTimeOutputSchema = z.object({
  estimatedTimeMinutes: z
    .number()
    .describe('The estimated time required to complete the task, in minutes.'),
});
export type EstimateTaskTimeOutput = z.infer<typeof EstimateTaskTimeOutputSchema>;

export async function estimateTaskTime(input: EstimateTaskTimeInput): Promise<EstimateTaskTimeOutput> {
  return estimateTaskTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateTaskTimePrompt',
  input: {schema: EstimateTaskTimeInputSchema},
  output: {schema: EstimateTaskTimeOutputSchema},
  prompt: `You are an expert project manager. You are skilled at estimating how long tasks will take.

  Based on the task title, description, and complexity level, estimate how long the task will take to complete, in minutes. Return ONLY a number.

  Task title: {{{taskTitle}}}
  Task description: {{{taskDescription}}}
  Task complexity: {{{complexity}}}
  `,
});

const estimateTaskTimeFlow = ai.defineFlow(
  {
    name: 'estimateTaskTimeFlow',
    inputSchema: EstimateTaskTimeInputSchema,
    outputSchema: EstimateTaskTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
