import { config } from 'dotenv';
config();

import '@/ai/flows/estimate-task-time.ts';
import '@/ai/flows/parse-markdown-tasks.ts';
import '@/ai/flows/send-reminders.ts';
