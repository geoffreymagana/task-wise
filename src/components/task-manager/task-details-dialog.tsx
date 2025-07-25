'use client';

import type { Task } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { formatDuration } from '@/lib/utils';
import { Icon } from '../common/icon';
import { Separator } from '../ui/separator';

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

export function TaskDetailsDialog({ task, allTasks, onOpenChange }: TaskDetailsDialogProps) {
  const dependencies = task.dependencies.map(depId => allTasks.find(t => t.id === depId)).filter(Boolean);

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name={task.icon} className="w-6 h-6" style={{ color: task.color }}/>
            {task.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <p className="text-muted-foreground">{task.description || 'No description provided.'}</p>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold mb-1">Status</h4>
                    <p>{task.status.replace('_', ' ')}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1">Priority</h4>
                    <Badge variant={priorityConfig[task.priority] as any}>{task.priority}</Badge>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1">Due Date</h4>
                    <p>{task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'Not set'}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1">Est. Time</h4>
                    <p>{formatDuration(task.estimatedTime)}</p>
                </div>
            </div>
            {dependencies.length > 0 && (
                <>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Dependencies</h4>
                        <div className="flex flex-col gap-2">
                        {dependencies.map(dep => (
                            <div key={dep!.id} className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md">
                                <Icon name={dep!.icon} className="w-4 h-4" />
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
