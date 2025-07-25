'use client';

import { Button } from '@/components/ui/button';
import { AddTaskDialog } from '@/components/task-manager/add-task-dialog';
import { ImportDialog } from '@/components/task-manager/import-dialog';
import type { Task } from '@/lib/types';
import { FileDown, GanttChartSquare, Plus, Upload, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import Link from 'next/link';

interface AppHeaderProps {
  onTaskCreated: (newTask: Task) => void;
  onTasksImported: (newTasks: Task[]) => void;
  allTasks: Task[];
}

export default function AppHeader({ onTaskCreated, onTasksImported, allTasks }: AppHeaderProps) {
  const handleExport = (format: 'json' | 'csv' | 'md') => {
    let data;
    let fileType;
    let fileName;

    switch (format) {
      case 'json':
        data = JSON.stringify(allTasks, null, 2);
        fileType = 'application/json';
        fileName = 'tasks.json';
        break;
      // Add CSV and MD export logic here if needed
      default:
        return;
    }

    const blob = new Blob([data], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-8">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <GanttChartSquare className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-2xl font-bold font-headline">TaskWise</h1>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <AddTaskDialog onTaskCreated={onTaskCreated}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </AddTaskDialog>
          
          <ImportDialog onTasksImported={onTasksImported}>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
          </ImportDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
