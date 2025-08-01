'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { CheckCircle, Circle, Edit, MoreHorizontal, Trash, XCircle, ChevronDown, Play, ArchiveRestore, AlertCircle } from 'lucide-react';
import { format, isSameDay, isToday, startOfDay, isBefore } from 'date-fns';
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

const groupTasksByDay = (tasks: Task[]) => {
    const grouped = tasks.reduce((acc, task) => {
        const date = task.createdAt ? format(startOfDay(new Date(task.createdAt)), 'yyyy-MM-dd') : 'No Date';
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(task);
        return acc;
    }, {} as Record<string, Task[]>);
    
    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      if (dateA === 'No Date') return 1;
      if (dateB === 'No Date') return -1;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDueDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDueDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      
      if (aDueDate !== bDueDate) {
          return aDueDate - bDueDate;
      }
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;

      if(aPriority !== bPriority) {
          return bPriority - aPriority;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  const groupedTasks = useMemo(() => groupTasksByDay(sortedTasks), [sortedTasks]);

  const handleDaySelection = (dayTasks: Task[], checked: boolean | 'indeterminate') => {
    const dayTaskIds = dayTasks.map(t => t.id);
    if (checked === true) {
      setSelectedTaskIds(prev => [...new Set([...prev, ...dayTaskIds])]);
    } else {
      setSelectedTaskIds(prev => prev.filter(id => !dayTaskIds.includes(id)));
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
  
  const isTaskActive = (task: Task) => {
    if (!task.startTime) return false;
    const startTime = new Date(task.startTime);
    const endTime = task.endTime ? new Date(task.endTime) : new Date(startTime.getTime() + (task.estimatedTime || 0) * 60000);
    return now >= startTime && now <= endTime;
  }
  
  const isOverdue = (task: Task) => {
    return task.dueDate && task.status !== 'completed' && isBefore(startOfDay(new Date(task.dueDate)), startOfDay(now));
  }

  return (
    <Card className="shadow-lg mt-4">
      {selectedTaskIds.length > 0 && (
        <div className="p-2 border-b bg-muted/50 flex items-center justify-between sticky top-0 z-20">
          <span className="text-sm font-medium">
            {selectedTaskIds.length} task(s) selected
          </span>
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
                  {Object.entries(statusConfig)
                    .filter(([key]) => !isArchivedView || key === 'archived')
                    .map(([statusKey, {label}]) => (
                      <DropdownMenuItem key={statusKey} onClick={() => handleBulkStatusChange(statusKey as Task['status'])}>
                        {label}
                      </DropdownMenuItem>
                  ))}
                  {isArchivedView && (
                     <DropdownMenuItem onClick={() => { selectedTaskIds.forEach(id => handleReinstate(id)); setSelectedTaskIds([])}}>
                        Reinstate
                      </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
        </div>
      )}
      
      {groupedTasks.map(([date, tasksInDay]) => {
         const day = new Date(date);
         let title = date === 'No Date' ? 'No Date' : format(day, 'EEEE, MMMM d');
         if (isToday(day)) title = "Today";
         if (isSameDay(day, new Date(Date.now() - 86400000))) title = "Yesterday";

         const dayTaskIds = tasksInDay.map(t => t.id);
         const selectedCountInDay = selectedTaskIds.filter(id => dayTaskIds.includes(id)).length;
         const isAllDaySelected = selectedCountInDay > 0 && selectedCountInDay === dayTaskIds.length;
         const isSomeDaySelected = selectedCountInDay > 0 && selectedCountInDay < dayTaskIds.length;

         return (
            <div key={date}>
                <h3 className="text-lg font-bold p-3 font-headline sticky top-0 bg-background/80 backdrop-blur-sm z-10 flex items-center gap-3">
                  <Checkbox 
                    checked={isAllDaySelected ? true : (isSomeDaySelected ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleDaySelection(tasksInDay, checked)}
                    aria-label={`Select all tasks for ${title}`}
                  />
                  {title}
                  <Badge variant="secondary" className="rounded-full">{tasksInDay.length}</Badge>
                </h3>
                 <Table>
                    <TableHeader className="hidden md:table-header-group">
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-[40%]">Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Est. Time</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasksInDay.map((task) => (
                        <TableRow key={task.id} data-state={selectedTaskIds.includes(task.id) && 'selected'} className={isTaskActive(task) ? 'bg-primary/10' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTaskIds.includes(task.id)}
                              onCheckedChange={(checked) => handleRowSelect(task.id, !!checked)}
                              aria-label={`Select row for task "${task.title}"`}
                            />
                          </TableCell>
                          <TableCell className="w-[40%]">
                             <div className="flex items-center gap-2">
                                <button onClick={() => setTaskToView(task)} className="font-medium text-left hover:underline flex items-center gap-2">
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: task.color }}
                                  >
                                    <Icon name={task.icon || 'Package'} className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="whitespace-normal break-words">{task.title}</span>
                                </button>
                                {isOverdue(task) && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" title="Overdue" />}
                              </div>
                          </TableCell>
                          <TableCell>
                            {!isArchivedView ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto text-sm">
                                    {statusConfig[task.status].icon}
                                    <span className="hidden md:inline">{statusConfig[task.status].label}</span>
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
                                <span className="hidden md:inline">{statusConfig[task.status].label}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={priorityConfig[task.priority] as any}>{task.priority}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {task.estimatedTime > 0 ? formatDuration(task.estimatedTime) : 'N/A'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
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
            </div>
        );
      })}

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
