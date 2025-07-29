
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTaskManager } from '@/hooks/use-task-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '@/components/common/header';
import TableView from '@/components/task-views/table-view';
import CalendarView from '@/components/task-views/calendar-view';
import TimelineView from '@/components/task-views/timeline-view';
import KanbanView from '@/components/task-views/kanban-view';
import MindMapView from '@/components/task-views/mindmap-view';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo, Mic, Calendar, GanttChart, LayoutGrid, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { registerServiceWorker, subscribeToPush, getSubscription } from '@/lib/notification-utils';
import { sendReminders } from '@/ai/flows/send-reminders';
import FilterControls from '@/components/task-manager/filter-controls';
import { isSameDay } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { SpeechToPlanDialog } from '@/components/task-manager/speech-to-plan-dialog';

export default function DashboardPage() {
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
  const isMobile = useIsMobile();

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

  const defaultTaskCount = useMemo(() => {
    return tasks.filter(task => task.status === 'not_started' && isSameDay(new Date(task.createdAt), new Date())).length;
  }, [tasks]);

  const hasActiveFilters = searchQuery || filters.priority.length > 0 || filters.status.length > 0 || filters.dueDate;

  const renderTaskCount = () => {
    if (hasActiveFilters) {
      return `${tasksToShow.length} task${tasksToShow.length !== 1 ? 's' : ''} found`;
    }
    if (activeTab === 'active') {
       const todayTasks = activeTasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), new Date())).length;
       return `${todayTasks} task${todayTasks !== 1 ? 's' : ''} for today`;
    }
     if (activeTab === 'archived') {
       return `${archivedTasks.length} archived task${archivedTasks.length !== 1 ? 's' : ''}`;
    }
    return '';
  }
  
  const renderDesktopViewSwitcher = () => (
    <Tabs value={activeView} onValueChange={setActiveView} className="w-full md:w-auto">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="kanban">Kanban</TabsTrigger>
        <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const renderMobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
        <div className="grid grid-cols-5 items-center">
            <button onClick={() => setActiveView('table')} className={`flex flex-col items-center p-2 ${activeView === 'table' ? 'text-primary' : 'text-muted-foreground'}`}>
                <ListTodo className="h-5 w-5" />
                <span className="text-xs">List</span>
            </button>
            <button onClick={() => setActiveView('timeline')} className={`flex flex-col items-center p-2 ${activeView === 'timeline' ? 'text-primary' : 'text-muted-foreground'}`}>
                <GanttChart className="h-5 w-5" />
                <span className="text-xs">Timeline</span>
            </button>
            <button onClick={() => setActiveView('calendar')} className={`flex flex-col items-center p-2 ${activeView === 'calendar' ? 'text-primary' : 'text-muted-foreground'}`}>
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Calendar</span>
            </button>
            <button onClick={() => setActiveView('kanban')} className={`flex flex-col items-center p-2 ${activeView === 'kanban' ? 'text-primary' : 'text-muted-foreground'}`}>
                <LayoutGrid className="h-5 w-5" />
                <span className="text-xs">Kanban</span>
            </button>
            <button onClick={() => setActiveView('mindmap')} className={`flex flex-col items-center p-2 ${activeView === 'mindmap' ? 'text-primary' : 'text-muted-foreground'}`}>
                <BrainCircuit className="h-5 w-5" />
                <span className="text-xs">Map</span>
            </button>
        </div>
    </div>
  );


  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 md:pb-0">
      <AppHeader onTaskCreated={handleTaskCreated} onTasksImported={handleTasksImported} allTasks={tasks} />
      <main className="flex-grow p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap flex-1">
            {!isMobile && renderDesktopViewSwitcher()}
            <FilterControls 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
                filteredTasksCount={tasksToShow.length}
                hasActiveFilters={!!hasActiveFilters}
            />
          </div>

          <div className="flex-shrink-0 flex items-center gap-4">
             {hasTasks && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="archived">Archived</TabsTrigger>
                  </TabsList>
                </Tabs>
             )}
          </div>
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
              <Tabs value={activeView} className="w-full">
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
                <TabsContent value="mindmap" className="m-0">
                  <MindMapView tasks={tasksToShow} allTasks={tasks} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
         {activeTab === 'archived' && (
          <div className="mt-4">
            {!hasArchivedTasks ? (
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
            ) : (
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
            )}
          </div>
        )}
      </main>

      <SpeechToPlanDialog onTasksImported={handleTasksImported}>
        <button className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 transition-transform transform hover:scale-110">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="mic-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: "white", stopOpacity: 0.7}} />
                    <stop offset="100%" style={{stopColor: "white", stopOpacity: 1}} />
                    </linearGradient>
                </defs>
                <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="url(#mic-grad)"/>
                <path d="M17.3 11C17.3 13.91 14.91 16.3 12 16.3C9.09 16.3 6.7 13.91 6.7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C16.28 17.23 19 14.41 19 11H17.3Z" fill="url(#mic-grad)"/>
            </svg>
        </button>
      </SpeechToPlanDialog>
      
      {isMobile && renderMobileNav()}
    </div>
  );
}

    