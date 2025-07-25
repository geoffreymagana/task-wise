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
import { format } from 'date-fns';

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
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const addDefaultFields = (task: any): any => {
    const dueDate = task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : null;
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
  prompt: `You are an expert at parsing markdown task lists and converting them into structured JSON data. Analyze the provided markdown text, which represents a work plan. Identify all tasks and their subtasks. Do not include headings, descriptions, notes, or any other non-task text.

- The markdown uses indentation to represent subtasks.
- The markdown may contain dates and deadlines. Infer the due date for each task. Today's date is ${new Date().toDateString()}.
- The markdown may indicate task difficulty (e.g., 🔹 Light, 🔸 Medium, 🔺 Heavy). Use this to set the complexity and priority.
- Set a default priority and complexity if not specified.
- Set the status based on checkbox state (e.g., '[ ]' is not_started, '[x]' is completed). Default to 'not_started' if no checkbox.

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
