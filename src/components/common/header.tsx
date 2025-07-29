
'use client';

import { Button } from '@/components/ui/button';
import { AddTaskDialog } from '@/components/task-manager/add-task-dialog';
import { ImportDialog } from '@/components/task-manager/import-dialog';
import type { Task } from '@/lib/types';
import { Download, GanttChartSquare, Plus, Upload, CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';


interface AppHeaderProps {
  onTaskCreated: (newTask: Task) => void;
  onTasksImported: (newTasks: Task[]) => void;
  allTasks: Task[];
}

export default function AppHeader({ onTaskCreated, onTasksImported, allTasks }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  
  // Don't render the app header on landing pages
  const landingPages = ['/', '/about', '/how-it-works', '/legal/privacy', '/legal/terms', '/contact', '/help'];
  if (landingPages.includes(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-8 mx-auto">
        <div className="mr-4 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-lg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 0.7}} />
                    <stop offset="100%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                    </linearGradient>
                </defs>
                <path d="M8 7H19V9H8V7ZM8 11H19V13H8V11ZM8 15H19V17H8V15ZM5 7H6V9H5V7ZM5 11H6V13H5V11ZM5 15H6V17H5V15Z" fill="url(#grad1)"/>
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none"/>
             </svg>
            <h1 className="text-2xl font-bold font-headline hidden md:block">TaskWise</h1>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-1 md:space-x-2">
          <AddTaskDialog onTaskCreated={onTaskCreated} allTasks={allTasks}>
            <Button size={isMobile ? "icon" : "sm"}>
              <Plus className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} /> 
              {!isMobile && 'Add Task'}
            </Button>
          </AddTaskDialog>
          
          <ImportDialog onTasksImported={onTasksImported}>
            <Button variant="outline" size={isMobile ? "icon" : "sm"}>
              <Upload className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} /> 
              {!isMobile && 'Import'}
            </Button>
          </ImportDialog>

          <Link href="/profile">
             <Button variant="ghost" size="icon" className="rounded-full">
               <CircleUserRound />
             </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
