'use client';

import AppHeader from '@/components/common/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTaskManager } from '@/hooks/use-task-manager';
import { CheckCircle, Clock, ListTodo, UserCheck, Check, Edit, Loader2, Verified } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const USER_STORAGE_KEY = 'taskwise-user';

export default function ProfilePage() {
  const { tasks, setTasks } = useTaskManager();
  const [userName, setUserName] = useState('User');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('User');
  const [isLoading, setIsLoading] = useState(true);

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
  
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;
    const totalEstimatedTime = tasks.reduce((acc, task) => acc + (task.estimatedTime || 0), 0);
    const completedTasksWithTime = tasks.filter(t => t.status === 'completed' && t.completedAt && t.startedAt);
    const totalCompletionTime = completedTasksWithTime.reduce((acc, task) => {
        return acc + (new Date(task.completedAt!).getTime() - new Date(task.startedAt!).getTime())
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

  const handleTaskCreated = (newTask: any) => {
    setTasks((prev) => [...prev, newTask]);
  }

  const handleTasksImported = (newTasks: any[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onTaskCreated={handleTaskCreated} onTasksImported={handleTasksImported} allTasks={tasks} />
      <main className="flex-grow p-4 md:p-8">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                <Verified className="w-12 h-12 text-primary" />
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
            <p className="text-muted-foreground">Welcome to your profile!</p>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
