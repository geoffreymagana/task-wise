'use server';
/**
 * @fileOverview A flow for sending push notification reminders for tasks.
 *
 * - sendReminders - Sends reminders for tasks that are due soon.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import webpush from 'web-push';
import type { Task, WebPushSubscription } from '@/lib/types';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_MAILTO) {
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const SendRemindersInputSchema = z.object({
  tasks: z.array(z.any()).describe('A list of all tasks.'),
  subscriptions: z.array(z.any()).describe('A list of all active web push subscriptions.'),
});

export async function sendReminders(input: z.infer<typeof SendRemindersInputSchema>): Promise<void> {
  return sendRemindersFlow(input);
}

const sendRemindersFlow = ai.defineFlow(
  {
    name: 'sendRemindersFlow',
    inputSchema: SendRemindersInputSchema,
    outputSchema: z.void(),
  },
  async ({ tasks, subscriptions }) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const upcomingTasks = (tasks as Task[]).filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const diff = dueDate.getTime() - now.getTime();
      return diff > 0 && diff < oneDay && task.status !== 'completed';
    });

    if (upcomingTasks.length === 0 || subscriptions.length === 0) {
      return;
    }
    
    for (const task of upcomingTasks) {
      const payload = JSON.stringify({
        title: `Reminder: ${task.title}`,
        body: `This task is due soon!`,
      });

      for (const sub of subscriptions as WebPushSubscription[]) {
        try {
          await webpush.sendNotification(sub, payload);
        } catch (error) {
          console.error('Error sending push notification', error);
          // Here you would typically handle removing expired subscriptions
        }
      }
    }
  }
);
