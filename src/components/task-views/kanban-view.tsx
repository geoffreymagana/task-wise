'use client';

import { useMemo, useState } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card';
import { AddTaskDialog } from '../task-manager/add-task-dialog';
import { Badge } from '../ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Icon } from '../common/icon';


interface KanbanViewProps {
  tasks: Task[];
  allTasks: Task[];
  onUpdateTask: (task: Task) => void;
}

const statusColumns = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

type StatusKey = keyof typeof statusColumns;

export default function KanbanView({ tasks, allTasks, onUpdateTask }: KanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const columns = useMemo(() => {
    const cols: Record<StatusKey, Task[]> = {
      not_started: [],
      in_progress: [],
      completed: [],
    };
    tasks.forEach((task) => {
      if (task.status in statusColumns) {
        cols[task.status as StatusKey].push(task);
      }
    });
    return cols;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: StatusKey) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
        if (status === 'completed' && draggedTask.dependencies?.length > 0) {
            const allDependenciesMet = draggedTask.dependencies.every(depId => {
              const depTask = allTasks.find(t => t.id === depId);
              return depTask && depTask.status === 'completed';
            });
      
            if (!allDependenciesMet) {
              toast({
                variant: 'destructive',
                title: 'Dependency not completed',
                description: `Task "${draggedTask.title}" cannot be completed because one or more dependencies are not finished.`
              });
              setDraggedTask(null);
              return;
            }
        }
        const startedAt = status === 'in_progress' && !draggedTask.startedAt ? new Date().toISOString() : draggedTask.startedAt;
        const completedAt = status === 'completed' ? new Date().toISOString() : null;
        onUpdateTask({ ...draggedTask, status, startedAt, completedAt });
    }
    setDraggedTask(null);
  };
  
  const handleTaskCreated = () => {}

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1 md:p-4">
      {Object.entries(statusColumns).map(([status, title]) => (
        <div
          key={status}
          className="flex-shrink-0 w-full bg-muted/50 rounded-lg"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status as StatusKey)}
        >
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold font-headline">{title}</h2>
          </div>
          <div className="p-4 space-y-4 min-h-[400px]">
            {columns[status as StatusKey].map((task) => (
              <Card
                key={task.id}
                className="p-4 shadow-md cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                style={{ borderLeft: `4px solid ${task.color}`}}
              >
                <CardTitle className="text-base flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: task.color }}
                    >
                      <Icon name={task.icon || 'Package'} className="w-4 h-4 text-white" />
                    </div>
                    <span>{task.title}</span>
                  </div>
                   <AddTaskDialog onTaskCreated={handleTaskCreated} onTaskUpdated={onUpdateTask} taskToEdit={task} allTasks={allTasks}>
                      <button className="p-1 rounded hover:bg-muted -mt-2 -mr-2">
                        <MoreHorizontal size={16} />
                      </button>
                    </AddTaskDialog>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                <div className="mt-2">
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
