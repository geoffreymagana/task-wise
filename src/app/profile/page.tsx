'use client';

import AppHeader from '@/components/common/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTaskManager } from '@/hooks/use-task-manager';
import { CheckCircle, Clock, ListTodo } from 'lucide-react';

export default function ProfilePage() {
  const { tasks, setTasks } = useTaskManager();

  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const totalEstimatedTime = tasks.reduce((acc, task) => acc + (task.estimatedTime || 0), 0);
  
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
              <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-headline">User</CardTitle>
            <p className="text-muted-foreground">Welcome to your profile!</p>
          </CardHeader>
          <CardContent>
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <ListTodo className="w-8 h-8 mb-2 text-primary" />
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-muted-foreground">Total Tasks</p>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-muted-foreground">Completed</p>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-8 h-8 mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{(totalEstimatedTime / 60).toFixed(1)}h</p>
                <p className="text-muted-foreground">Est. Time</p>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">More stats coming soon!</h3>
                <p className="text-muted-foreground">Keep completing tasks to see your progress.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
