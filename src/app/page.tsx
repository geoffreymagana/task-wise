'use client';

import { useState } from 'react';
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

export default function Home() {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    setTasks,
    deleteTasks,
    updateTasksStatus,
  } = useTaskManager();
  const [activeView, setActiveView] = useState('table');

  const handleTaskCreated = (newTask: Task) => {
    addTask(newTask);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    updateTask(updatedTask);
  };

  const handleTasksImported = (newTasks: Task[]) => {
    setTasks([...tasks, ...newTasks]);
  };

  const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onTaskCreated={handleTaskCreated} onTasksImported={handleTasksImported} allTasks={tasks} />
      <main className="flex-grow p-4 md:p-8">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-fit">
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
          {tasks.length === 0 ? (
            <Card className="mt-4 w-full text-center shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
                  <ListTodo className="w-8 h-8 text-primary" />
                  Welcome to TaskWise!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You have no tasks yet. Get started by adding a new task or importing a list.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="table">
                <TableView 
                  tasks={sortedTasks} 
                  onUpdateTask={updateTask} 
                  onDeleteTask={deleteTask}
                  onDeleteTasks={deleteTasks}
                  onUpdateTasksStatus={updateTasksStatus}
                />
              </TabsContent>
              <TabsContent value="timeline">
                <TimelineView tasks={sortedTasks} onUpdateTask={handleTaskUpdated} />
              </TabsContent>
              <TabsContent value="calendar">
                <CalendarView tasks={sortedTasks} />
              </TabsContent>
              <TabsContent value="kanban">
                <KanbanView tasks={sortedTasks} onUpdateTask={handleTaskUpdated} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
