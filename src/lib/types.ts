export type SubTask = {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'archived';
  subtasks?: SubTask[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'archived';
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
  subtasks?: SubTask[];
};
