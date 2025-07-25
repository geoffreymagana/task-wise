'use client';

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
import { CheckCircle, Circle, Edit, MoreHorizontal, Trash, XCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Card } from '../ui/card';
import { AddTaskDialog } from '../task-manager/add-task-dialog';

interface TableViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusConfig = {
  not_started: { label: 'Not Started', icon: <Circle className="w-3 h-3 text-muted-foreground" /> },
  in_progress: { label: 'In Progress', icon: <Circle className="w-3 h-3 text-blue-500" /> },
  completed: { label: 'Completed', icon: <CheckCircle className="w-3 h-3 text-green-500" /> },
  archived: { label: 'Archived', icon: <XCircle className="w-3 h-3 text-red-500" /> },
};

const priorityConfig = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
};

export default function TableView({ tasks, onUpdateTask, onDeleteTask }: TableViewProps) {
  const handleStatusChange = (task: Task, status: Task['status']) => {
    onUpdateTask({ ...task, status, completedAt: status === 'completed' ? new Date().toISOString() : task.completedAt });
  };

  return (
    <Card className="shadow-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Est. Time</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks
            .filter(task => task.status !== 'archived')
            .map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground truncate max-w-sm">
                  {task.description || 'No description'}
                </div>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <Badge variant={priorityConfig[task.priority] as any}>{task.priority}</Badge>
              </TableCell>
              <TableCell>
                {task.estimatedTime > 0 ? `${task.estimatedTime} min` : 'N/A'}
              </TableCell>
              <TableCell>
                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <AddTaskDialog onTaskUpdated={onUpdateTask} onTaskCreated={()=>{}} taskToEdit={task}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
