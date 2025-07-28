'use client';

import { useMemo, useState } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card';
import { AddTaskDialog } from '../task-manager/add-task-dialog';
import { Badge } from '../ui/badge';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Icon } from '../common/icon';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Button } from '../ui/button';

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
    
    const sortedTasks = [...tasks].sort((a, b) => {
        const aDueDate = a.dueDate ? new Date(a.dueDate) : null;
        const bDueDate = b.dueDate ? new Date(b.dueDate) : null;
        if (aDueDate && bDueDate) {
            return aDueDate.getTime() - bDueDate.getTime();
        }
        if (aDueDate) return -1;
        if (bDueDate) return 1;
        return 0;
    });
    
    sortedTasks.forEach((task) => {
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

  const handleStatusChange = (task: Task, status: StatusKey) => {
    if (task.status === status) return;
    
    if (status === 'completed' && task.dependencies?.length > 0) {
      const allDependenciesMet = task.dependencies.every(depId => {
        const depTask = allTasks.find(t => t.id === depId);
        return depTask && depTask.status === 'completed';
      });

      if (!allDependenciesMet) {
        toast({
          variant: 'destructive',
          title: 'Dependency not completed',
          description: `Task "${task.title}" cannot be completed because one or more dependencies are not finished.`
        });
        return;
      }
    }
    const startedAt = status === 'in_progress' && !task.startedAt ? new Date().toISOString() : task.startedAt;
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    onUpdateTask({ ...task, status, startedAt, completedAt });
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: StatusKey) => {
    e.preventDefault();
    if (draggedTask) {
        handleStatusChange(draggedTask, status);
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
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs h-7">
                              Change Status <ChevronDown className="ml-1 h-3 w-3"/>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                          <DropdownMenuLabel>Move to...</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {Object.entries(statusColumns).map(([s, t]) => (
                              <DropdownMenuItem key={s} onClick={() => handleStatusChange(task, s as StatusKey)} disabled={task.status === s}>
                                  {t}
                              </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
