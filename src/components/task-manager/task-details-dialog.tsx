'use client';

import type { Task } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '../ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { formatDuration } from '@/lib/utils';
import { Icon } from '../common/icon';
import { Separator } from '../ui/separator';
import { CheckCircle, Circle, Play, XCircle } from 'lucide-react';

interface TaskDetailsDialogProps {
  task: Task;
  allTasks: Task[];
  onOpenChange: (open: boolean) => void;
}

const priorityConfig = {
    low: 'secondary',
    medium: 'default',
    high: 'destructive',
  };

const statusConfig = {
  not_started: { label: 'Not Started', icon: <Circle className="w-4 h-4 text-muted-foreground" />, color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: <Play className="w-4 h-4 text-blue-500" />, color: 'text-blue-500' },
  completed: { label: 'Completed', icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: 'text-green-500'},
  archived: { label: 'Archived', icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'text-red-500'},
};


export function TaskDetailsDialog({ task, allTasks, onOpenChange }: TaskDetailsDialogProps) {
  const dependencies = (task.dependencies || []).map(depId => allTasks.find(t => t.id === depId)).filter(Boolean);

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-headline">
             <div 
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: task.color }}
            >
              <Icon name={task.icon || 'Package'} className="w-5 h-5 text-white" />
            </div>
            {task.title}
          </DialogTitle>
           <DialogDescription>{task.description || 'No description provided.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <Separator />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                    <h4 className="font-semibold mb-1 text-sm">Status</h4>
                    <div className={`flex items-center gap-2 text-sm ${statusConfig[task.status].color}`}>
                        {statusConfig[task.status].icon}
                        <p>{statusConfig[task.status].label}</p>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1 text-sm">Priority</h4>
                    <Badge variant={priorityConfig[task.priority] as any}>{task.priority}</Badge>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1 text-sm">Due Date</h4>
                    <p className="text-sm">{task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'Not set'}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1 text-sm">Est. Time</h4>
                    <p className="text-sm">{formatDuration(task.estimatedTime)}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-1 text-sm">Created</h4>
                    <p className="text-sm">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
                </div>
                 {task.completedAt && (
                    <div>
                        <h4 className="font-semibold mb-1 text-sm">Completed</h4>
                        <p className="text-sm">{formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}</p>
                    </div>
                 )}
            </div>
            {dependencies.length > 0 && (
                <>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2 text-sm">Dependencies</h4>
                        <div className="flex flex-col gap-2">
                        {dependencies.map(dep => (
                            <div key={dep!.id} className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md">
                                <div 
                                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: dep!.color }}
                                >
                                  <Icon name={dep!.icon || 'Package'} className="w-3 h-3 text-white" />
                                </div>
                                <span>{dep!.title}</span>
                                <Badge variant={dep!.status === 'completed' ? 'default' : 'destructive'} className="ml-auto">
                                    {dep!.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        ))}
                        </div>
                    </div>
                </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
