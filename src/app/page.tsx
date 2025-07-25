'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTaskManager } from '@/hooks/use-task-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '@/components/common/header';
import TableView from '@/components/task-views/table-view';
import CalendarView from '@/components/task-views/calendar-view';
import TimelineView from '@/components/task-views/timeline-view';
import KanbanView from '@/components/task-views/kanban-view';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { registerServiceWorker, subscribeToPush } from '@/lib/notification-utils';

export default function Home() {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    setTasks,
    deleteTasks,
    updateTasksStatus,
    reinstateTask,
  } = useTaskManager();
  const [activeView, setActiveView] = useState('table');
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();

   useEffect(() => {
    async function setupNotifications() {
      try {
        await registerServiceWorker();
        const sub = await subscribeToPush();
        // You might want to send this subscription object to your server to store it
        console.log('Push subscription:', sub);
      } catch (error) {
        console.error('Failed to setup push notifications', error);
        toast({
          variant: 'destructive',
          title: 'Notifications Disabled',
          description: 'Could not subscribe to push notifications. Please ensure you have granted permission.',
        });
      }
    }
    setupNotifications();
  }, [toast]);


  const handleTaskCreated = (newTask: Task) => {
    addTask(newTask);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    updateTask(updatedTask);
  };

  const handleTasksImported = (newTasks: Task[]) => {
    setTasks([...tasks, ...newTasks]);
  };

  const { activeTasks, archivedTasks } = useMemo(() => {
    const active: Task[] = [];
    const archived: Task[] = [];
    tasks.forEach(task => {
      if (task.status === 'archived') {
        archived.push(task);
      } else {
        active.push(task);
      }
    });
    return { 
      activeTasks: active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      archivedTasks: archived.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    };
  }, [tasks]);
  
  const tasksToShow = activeTab === 'active' ? activeTasks : archivedTasks;
  const hasTasks = tasks.length > 0;
  const hasActiveTasks = activeTasks.length > 0;
  const hasArchivedTasks = archivedTasks.length > 0;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onTaskCreated={handleTaskCreated} onTasksImported={handleTasksImported} allTasks={tasks} />
      <main className="flex-grow p-4 md:p-8">
        {hasTasks && (
           <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">Active Tasks</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        {activeTab === 'active' && (
           <Tabs value={activeView} onValueChange={setActiveView} className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-4 md:w-fit">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
              
              {!hasActiveTasks ? (
                 <Card className="mt-4 w-full text-center shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
                      <ListTodo className="w-8 h-8 text-primary" />
                      Welcome to TaskWise!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      You have no active tasks. Get started by adding a new task or importing a list.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <TabsContent value="table">
                    <TableView 
                      tasks={tasksToShow} 
                      onUpdateTask={updateTask} 
                      onDeleteTask={deleteTask}
                      onDeleteTasks={deleteTasks}
                      onUpdateTasksStatus={updateTasksStatus}
                    />
                  </TabsContent>
                  <TabsContent value="timeline">
                    <TimelineView tasks={tasksToShow} onUpdateTask={handleTaskUpdated} />
                  </TabsContent>
                  <TabsContent value="calendar">
                    <CalendarView tasks={tasksToShow} />
                  </TabsContent>
                  <TabsContent value="kanban">
                    <KanbanView tasks={tasksToShow} onUpdateTask={handleTaskUpdated} allTasks={tasks} />
                  </TabsContent>
                </>
              )}
           </Tabs>
        )}
         {activeTab === 'archived' && (
          <div className="mt-4">
            {hasArchivedTasks ? (
               <TableView
                tasks={archivedTasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onDeleteTasks={deleteTasks}
                onUpdateTasksStatus={updateTasksStatus}
                reinstateTask={reinstateTask}
                isArchivedView={true}
              />
            ) : (
              <Card className="mt-4 w-full text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
                      <ListTodo className="w-8 h-8 text-primary" />
                      No Archived Tasks
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">You have no archived tasks.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
