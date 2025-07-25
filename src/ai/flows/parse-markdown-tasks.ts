'use server';
/**
 * @fileOverview An AI agent for parsing tasks from markdown text.
 *
 * - parseMarkdownTasks - A function that parses tasks from a markdown string.
 * - ParseMarkdownTasksInput - The input type for the parseMarkdownTasks function.
 * - ParseMarkdownTasksOutput - The return type for the parseMarkdownTasks function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v4 as uuidv4 } from 'uuid';
import { format, isValid } from 'date-fns';

const SubTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'archived']),
  subtasks: z.array(z.lazy(() => SubTaskSchema)).optional(),
});

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  complexity: z.enum(['low', 'medium', 'high']),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['not_started', 'in_progress', 'completed', 'archived']),
  estimatedTime: z.number().optional().describe('Estimated time in minutes.'),
  dueDate: z.string().nullable().describe('The due date of the task in YYYY-MM-DD format.'),
  startTime: z.string().nullable().describe('The start time of the task in ISO 8601 format.'),
  endTime: z.string().nullable().describe('The end time of the task in ISO 8601 format.'),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  subtasks: z.array(SubTaskSchema).optional(),
});

const ParseMarkdownTasksInputSchema = z.object({
  markdownText: z.string().describe('The markdown text containing the tasks.'),
});

const ParseMarkdownTasksOutputSchema = z.object({
  tasks: z.array(TaskSchema),
});

export type ParseMarkdownTasksInput = z.infer<typeof ParseMarkdownTasksInputSchema>;
export type ParseMarkdownTasksOutput = z.infer<typeof ParseMarkdownTasksOutputSchema>;

export async function parseMarkdownTasks(input: ParseMarkdownTasksInput): Promise<ParseMarkdownTasksOutput> {
  const rawParsed = await parseMarkdownTasksFlow(input);
  
  // Recursively add missing fields to tasks and subtasks
  const now = new Date().toISOString();
  
  const addDefaultFields = (task: any): any => {
    const parsedDueDate = task.dueDate ? new Date(task.dueDate) : null;
    const dueDate = parsedDueDate && isValid(parsedDueDate) ? format(parsedDueDate, 'yyyy-MM-dd') : null;

    const parsedStartTime = task.startTime ? new Date(task.startTime) : null;
    const startTime = parsedStartTime && isValid(parsedStartTime) ? parsedStartTime.toISOString() : null;

    const parsedEndTime = task.endTime ? new Date(task.endTime) : null;
    const endTime = parsedEndTime && isValid(parsedEndTime) ? parsedEndTime.toISOString() : null;
    
    return {
      id: uuidv4(),
      title: task.title,
      description: task.description || '',
      complexity: task.complexity || 'medium',
      priority: task.priority || 'medium',
      status: task.status || 'not_started',
      estimatedTime: task.estimatedTime || 0,
      actualTime: 0,
      dueDate: dueDate,
      startTime: startTime,
      endTime: endTime,
      createdAt: now,
      completedAt: null,
      subtasks: task.subtasks ? task.subtasks.map(addDefaultFields) : [],
    };
  };

  const tasksWithDefaults = rawParsed.tasks.map(addDefaultFields);

  return { tasks: tasksWithDefaults as any };
}

const prompt = ai.definePrompt({
  name: 'parseMarkdownTasksPrompt',
  input: { schema: ParseMarkdownTasksInputSchema },
  output: { schema: ParseMarkdownTasksOutputSchema },
  prompt: `You are an expert at parsing markdown task lists and converting them into structured JSON data. Analyze the provided markdown text, which represents a work plan. Identify all tasks and their subtasks.

- The markdown uses indentation to represent subtasks, which implies a dependency on the parent task.
- Infer start and end times from contextual clues in headings or task descriptions (e.g., "Morning routine (8am to 12pm)"). If a timeframe is provided, distribute the tasks within it.
- If a task is dependent on another, its start time must be after the parent's end time.
- If no time is specified, estimate a reasonable duration based on the task title and description. A simple task might take 30-60 minutes.
- Today's date is ${new Date().toISOString()}.
- Infer the due date for each task if mentioned.
- Set complexity, priority, and status based on any available markers (e.g., 🔹, [x]). Use sensible defaults if not specified.
- Set startTime and endTime in ISO 8601 format.

Return a JSON object with a "tasks" array.

Markdown to parse:
\`\`\`markdown
{{{markdownText}}}
\`\`\`
`,
});

const parseMarkdownTasksFlow = ai.defineFlow(
  {
    name: 'parseMarkdownTasksFlow',
    inputSchema: ParseMarkdownTasksInputSchema,
    outputSchema: ParseMarkdownTasksOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
