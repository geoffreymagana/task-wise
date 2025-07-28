'use server';

import { estimateTaskTime } from '@/ai/flows/estimate-task-time';
import { z } from 'zod';
import type { Task } from './types';
import { v4 as uuidv4 } from 'uuid';
import { generateColor, getRandomIcon } from './utils';

const timeToMinutes = (time: number, unit: string) => {
  switch (unit) {
    case 'hours':
      return time * 60;
    case 'days':
      return time * 60 * 24;
    case 'weeks':
      return time * 60 * 24 * 7;
    case 'months':
      return time * 60 * 24 * 30; // Approximation
    case 'years':
        return time * 60 * 24 * 365; // Approximation
    default:
      return time;
  }
};


const TaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  complexity: z.enum(['low', 'medium', 'high']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().nullable(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  estimatedTime: z.number().optional(),
  dependencies: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  estimatedTimeUnit: z.string().optional(),
});

const AllTasksSchema = z.object({
  allTasks: z.array(z.any()),
});

export async function createTaskAction(
  values: z.infer<typeof TaskSchema>,
  allTasks: Task[]
): Promise<Task | { error: string; existingTask?: Task }> {
  const validatedFields = TaskSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error('Invalid input data.');
  }

  const { title, description, complexity, priority, dueDate, estimatedTime, dependencies, icon, color, estimatedTimeUnit, startTime, endTime } = validatedFields.data;

  const existingTask = allTasks.find(
    (task) =>
      task.title.trim().toLowerCase() === title.trim().toLowerCase() &&
      task.dueDate === dueDate
  );

  if (existingTask) {
    return {
      error: `A task with the title "${title}" already exists for this day.`,
      existingTask: existingTask
    };
  }
  
  let finalEstimatedTime = estimatedTime ? timeToMinutes(estimatedTime, estimatedTimeUnit || 'minutes') : 0;


  if (!finalEstimatedTime || finalEstimatedTime === 0) {
    const { estimatedTimeMinutes } = await estimateTaskTime({
      taskTitle: title,
      taskDescription: description || '',
      complexity,
    });
    finalEstimatedTime = estimatedTimeMinutes
  }


  const newTask: Task = {
    id: uuidv4(),
    title,
    description: description || '',
    complexity,
    priority,
    status: 'not_started',
    estimatedTime: finalEstimatedTime,
    actualTime: 0,
    dueDate,
    startTime: startTime || null,
    endTime: endTime || null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    startedAt: null,
    dependencies: dependencies || [],
    color: color || generateColor(),
    icon: icon || getRandomIcon(),
  };

  return newTask;
}
