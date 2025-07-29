
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTaskManager } from '@/hooks/use-task-manager';
import { CheckCircle, Clock, ListTodo, UserCheck, Check, Edit, Loader2, Verified, Download, Moon, Sun } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Task } from '@/lib/types';
import Link from 'next/link';

const USER_STORAGE_KEY = 'taskwise-user';

export default function ProfilePage() {
  const { tasks, setTasks } = useTaskManager();
  const [userName, setUserName] = useState('User');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('User');
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.name);
        setEditedName(user.name);
      }
    } catch (error) {
      console.error('Failed to load user from localStorage', error);
    }
    setIsLoading(false);
  }, []);

  const handleNameSave = () => {
    setUserName(editedName);
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ name: editedName }));
    } catch (error) {
      console.error('Failed to save user to localStorage', error);
    }
    setIsEditingName(false);
  };
  
    const handleExport = (format: 'json' | 'csv' | 'md') => {
    let data;
    let fileType;
    let fileName;

    switch (format) {
      case 'json':
        data = JSON.stringify(tasks, null, 2);
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

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;
    const totalEstimatedTime = tasks.reduce((acc, task) => acc + (task.estimatedTime || 0), 0);
    
    const completedTasksWithTime = tasks.filter(t => {
      const isCompleted = t.status === 'completed' && t.completedAt;
      if (!isCompleted) return false;
      return !!t.startedAt || !!t.createdAt;
    });

    const totalCompletionTime = completedTasksWithTime.reduce((acc, task) => {
        const startTime = task.startedAt || task.createdAt;
        return acc + (new Date(task.completedAt!).getTime() - new Date(startTime).getTime())
    }, 0) / 1000 / 60; // in minutes
    
    const avgCompletionTime = completedTasksWithTime.length > 0 ? totalCompletionTime / completedTasksWithTime.length : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalEstimatedTime,
      avgCompletionTime
    };

  }, [tasks]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  }

  const handleTasksImported = (newTasks: Task[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow p-4 md:p-8">
        <div className="mb-4">
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-lg">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 0.8}} />
                        <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 1}} />
                        </linearGradient>
                    </defs>
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.33 4 18V20H20V18C20 15.33 14.67 14 12 14Z" fill="url(#grad1)"/>
                </svg>
              </div>
            </Avatar>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input 
                  value={editedName} 
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="text-3xl font-headline text-center h-12"
                />
                <Button size="icon" onClick={handleNameSave}><Check className="w-5 h-5"/></Button>
              </div>
            ) : (
                <div className="flex items-center gap-2">
                    <CardTitle className="text-3xl font-headline">
                      {isLoading ? <Loader2 className="animate-spin" /> : userName}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}><Edit className="w-5 h-5"/></Button>
                </div>
            )}
            <p className="text-muted-foreground">Welcome to your productivity dashboard!</p>
          </CardHeader>
          <CardContent>
            <Separator className="my-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <ListTodo className="w-8 h-8 mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                <p className="text-muted-foreground text-sm">Total Tasks</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-muted-foreground text-sm">Completed</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <Clock className="w-8 h-8 mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{(stats.totalEstimatedTime / 60).toFixed(1)}h</p>
                <p className="text-muted-foreground text-sm">Est. Time</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <Clock className="w-8 h-8 mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{stats.inProgressTasks}</p>
                <p className="text-muted-foreground text-sm">In Progress</p>
              </div>
            </div>
             <Separator className="my-6" />
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Productivity Stats</h3>
                </div>
                <div className="flex flex-col gap-4">
                     <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Task Completion Rate</span>
                            <span className="text-sm font-medium">{stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0) : 0}%</span>
                        </div>
                        <Progress value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0} />
                    </div>
                    <div>
                        <p className="text-sm text-center text-muted-foreground">
                            Average task completion time: <span className="font-bold text-foreground">{formatDuration(stats.avgCompletionTime)}</span>
                        </p>
                    </div>
                </div>
            </div>
             <Separator className="my-6" />
             <div className="flex items-center justify-center gap-4 mt-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> 
                        Export Data
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('json')}>
                        Export as JSON
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
