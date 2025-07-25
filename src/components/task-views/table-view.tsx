'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, Circle, Edit, MoreHorizontal, Trash, XCircle, ChevronDown, Play, ArchiveRestore } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../ui/card';
import { AddTaskDialog } from '../task-manager/add-task-dialog';
import { formatDuration } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TaskDetailsDialog } from '../task-manager/task-details-dialog';
import { Icon } from '../common/icon';


interface TableViewProps {
  tasks: Task[];
  allTasks: Task[];
  onUpdateTask: (task: Task) => void;
  onUpdateTasksStatus: (taskIds: string[], status: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteTasks: (taskIds: string[]) => void;
  reinstateTask?: (taskId: string) => void;
  isArchivedView?: boolean;
}

const statusConfig = {
  not_started: { label: 'Not Started', icon: <Circle className="w-3 h-3 text-muted-foreground" /> },
  in_progress: { label: 'In Progress', icon: <Play className="w-3 h-3 text-blue-500" /> },
  completed: { label: 'Completed', icon: <CheckCircle className="w-3 h-3 text-green-500" /> },
  archived: { label: 'Archived', icon: <XCircle className="w-3 h-3 text-red-500" /> },
};

const priorityConfig = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
};

export default function TableView({
  tasks,
  allTasks,
  onUpdateTask,
  onUpdateTasksStatus,
  onDeleteTask,
  onDeleteTasks,
  reinstateTask,
  isArchivedView = false,
}: TableViewProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedTaskIds(tasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleRowSelect = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTaskIds((prev) => [...prev, taskId]);
    } else {
      setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleStatusChange = (task: Task, status: Task['status']) => {
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
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    const startedAt = status === 'in_progress' && !task.startedAt ? new Date().toISOString() : task.startedAt;
    onUpdateTask({ ...task, status, completedAt, startedAt });
  };
  
  const handleBulkStatusChange = (status: Task['status']) => {
    onUpdateTasksStatus(selectedTaskIds, status);
    setSelectedTaskIds([]);
  }

  const handleBulkDelete = () => {
    onDeleteTasks(selectedTaskIds);
    setSelectedTaskIds([]);
    setIsDeleteDialogOpen(false);
  };
  
  const handleTaskCreated = (newTask: Task) => {
    // This is a prop for AddTaskDialog, which calls onTaskCreated on the page level
  }
  
  const handleReinstate = (taskId: string) => {
    if (reinstateTask) {
      reinstateTask(taskId);
      toast({title: "Task Restored", description: "The task has been moved back to the main task list."})
    }
  };


  const isAllSelected = selectedTaskIds.length > 0 && selectedTaskIds.length === tasks.length;
  const isSomeSelected = selectedTaskIds.length > 0 && selectedTaskIds.length < tasks.length;

  return (
    <Card className="shadow-lg mt-4">
      {selectedTaskIds.length > 0 && (
        <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedTaskIds.length} task(s) selected
          </span>
          {!isArchivedView && (
            <div className="space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Change Status <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(statusConfig).map(([statusKey, {label}]) => (
                    <DropdownMenuItem key={statusKey} onClick={() => handleBulkStatusChange(statusKey as Task['status'])}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={tasks.length > 0 && isAllSelected ? true : (isSomeSelected ? 'indeterminate' : false)}
                onCheckedChange={handleSelectAll}
                aria-label="Select all rows"
              />
            </TableHead>
            <TableHead className="w-[40%]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Est. Time</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} data-state={selectedTaskIds.includes(task.id) && 'selected'}>
              <TableCell>
                <Checkbox
                  checked={selectedTaskIds.includes(task.id)}
                  onCheckedChange={(checked) => handleRowSelect(task.id, !!checked)}
                  aria-label={`Select row for task "${task.title}"`}
                />
              </TableCell>
              <TableCell>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setTaskToView(task)} className="font-medium text-left hover:underline flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      >
                        <Icon name={task.icon || 'Package'} className="w-4 h-4 text-white" />
                      </div>
                      {task.title}
                    </button>
                  </div>
              </TableCell>
              <TableCell>
                {!isArchivedView ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto text-sm">
                        {statusConfig[task.status].icon}
                        {statusConfig[task.status].label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.entries(statusConfig).map(([statusKey, {label}]) => (
                        <DropdownMenuItem key={statusKey} onClick={() => handleStatusChange(task, statusKey as Task['status'])}>
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    {statusConfig[task.status].icon}
                    {statusConfig[task.status].label}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={priorityConfig[task.priority] as any}>{task.priority}</Badge>
              </TableCell>
              <TableCell>
                {task.estimatedTime > 0 ? formatDuration(task.estimatedTime) : 'N/A'}
              </TableCell>
              <TableCell>
                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
              </TableCell>
              <TableCell className="text-right">
                {isArchivedView ? (
                   <Button variant="ghost" size="icon" onClick={() => handleReinstate(task.id)}>
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <AddTaskDialog onTaskUpdated={onUpdateTask} onTaskCreated={handleTaskCreated} taskToEdit={task} allTasks={allTasks}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </AddTaskDialog>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected {selectedTaskIds.length} task(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       {taskToView && (
        <TaskDetailsDialog
          task={taskToView}
          allTasks={allTasks}
          onOpenChange={() => setTaskToView(null)}
        />
      )}
    </Card>
  );
}
