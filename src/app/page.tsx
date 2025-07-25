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
import { registerServiceWorker, subscribeToPush, getSubscription } from '@/lib/notification-utils';
import { sendReminders } from '@/ai/flows/send-reminders';
import FilterControls from '@/components/task-manager/filter-controls';
import { isSameDay } from 'date-fns';


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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    priority: string[];
    status: string[];
    dueDate: Date | null;
  }>({
    priority: [],
    status: [],
    dueDate: null,
  });

  const { toast } = useToast();

   useEffect(() => {
    async function setupNotifications() {
      try {
        await registerServiceWorker();
        const sub = await subscribeToPush();
        if (sub) {
          console.log('Push subscription:', sub);
        }
      } catch (error) {
        console.error('Failed to setup push notifications', error);
        if (error instanceof Error && error.message.includes('permission')) {
          toast({
            variant: 'destructive',
            title: 'Notifications Disabled',
            description: 'Could not subscribe to push notifications. Please ensure you have granted permission.',
          });
        }
      }
    }
    setupNotifications();
  }, [toast]);

  useEffect(() => {
    const interval = setInterval(async () => {
        const sub = await getSubscription();
        if (tasks.length > 0 && sub) {
            await sendReminders({tasks, subscriptions: [sub]});
        }
    }, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);


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
  
  const filteredTasks = useMemo(() => {
    const sourceTasks = activeTab === 'active' ? activeTasks : archivedTasks;
    
    return sourceTasks.filter(task => {
        const searchMatch = !searchQuery || 
                            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const priorityMatch = filters.priority.length === 0 || filters.priority.includes(task.priority);
        const statusMatch = filters.status.length === 0 || filters.status.includes(task.status);
        const dueDateMatch = !filters.dueDate || (task.dueDate && isSameDay(new Date(task.dueDate), filters.dueDate));

        return searchMatch && priorityMatch && statusMatch && dueDateMatch;
    });

}, [activeTasks, archivedTasks, activeTab, searchQuery, filters]);

  const tasksToShow = filteredTasks;
  const hasTasks = tasks.length > 0;
  const hasActiveTasks = activeTasks.length > 0;
  const hasArchivedTasks = archivedTasks.length > 0;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onTaskCreated={handleTaskCreated} onTasksImported={handleTasksImported} allTasks={tasks} />
      <main className="flex-grow p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Left side: View Switcher and Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="grid w-full grid-cols-4 md:w-fit">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
            </Tabs>
             {activeTab === 'active' && (
                <FilterControls 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filters={filters}
                    setFilters={setFilters}
                />
            )}
          </div>

          {/* Right side: Active/Archived Toggle */}
          {hasTasks && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="active">Active Tasks</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        
        {activeTab === 'active' && (
          <div>
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
              <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                <TabsContent value="table" className="m-0">
                  <TableView 
                    tasks={tasksToShow} 
                    onUpdateTask={updateTask} 
                    onDeleteTask={deleteTask}
                    onDeleteTasks={deleteTasks}
                    onUpdateTasksStatus={updateTasksStatus}
                    allTasks={tasks}
                  />
                </TabsContent>
                <TabsContent value="timeline" className="m-0">
                  <TimelineView tasks={tasksToShow} allTasks={tasks} onUpdateTask={handleTaskUpdated} />
                </TabsContent>
                <TabsContent value="calendar" className="m-0">
                  <CalendarView tasks={tasksToShow} allTasks={tasks}/>
                </TabsContent>
                <TabsContent value="kanban" className="m-0">
                  <KanbanView tasks={tasksToShow} onUpdateTask={handleTaskUpdated} allTasks={tasks} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
         {activeTab === 'archived' && (
          <div className="mt-4">
             <FilterControls 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
              />
            {hasArchivedTasks ? (
               <TableView
                tasks={tasksToShow}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onDeleteTasks={deleteTasks}
                onUpdateTasksStatus={updateTasksStatus}
                reinstateTask={reinstateTask}
                isArchivedView={true}
                allTasks={tasks}
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
