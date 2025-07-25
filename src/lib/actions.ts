'use server';

import { estimateTaskTime } from '@/ai/flows/estimate-task-time';
import { z } from 'zod';
import type { Task } from './types';
import { v4 as uuidv4 } from 'uuid';

const TaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  complexity: z.enum(['low', 'medium', 'high']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().nullable(),
});

export async function createTaskAction(values: z.infer<typeof TaskSchema>): Promise<Task> {
  const validatedFields = TaskSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error('Invalid input data.');
  }

  const { title, description, complexity, priority, dueDate } = validatedFields.data;

  const { estimatedTimeMinutes } = await estimateTaskTime({
    taskTitle: title,
    taskDescription: description || '',
    complexity,
  });

  const newTask: Task = {
    id: uuidv4(),
    title,
    description: description || '',
    complexity,
    priority,
    status: 'not_started',
    estimatedTime: estimatedTimeMinutes,
    actualTime: 0,
    dueDate,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  return newTask;
}
