'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TaskDetailsDialog } from '../task-manager/task-details-dialog';

interface CalendarViewProps {
  tasks: Task[];
  allTasks: Task[];
}

export default function CalendarView({ tasks, allTasks }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [taskToView, setTaskToView] = useState<Task | null>(null);


  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(lastDayOfMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
  };

  return (
    <Card className="shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-headline">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
        <div className="grid grid-cols-7 border-t border-l">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium p-2 border-r border-b text-muted-foreground text-sm">
              {day}
            </div>
          ))}
          {daysInMonth.map((day) => {
            const dayTasks = getTasksForDay(day);
            return (
              <div
                key={day.toString()}
                className={cn(
                  'border-r border-b p-2 min-h-[120px] relative flex flex-col',
                  !isSameMonth(day, currentMonth) && 'bg-muted/50 text-muted-foreground'
                )}
              >
                <div className="flex justify-between items-start">
                  {dayTasks.length > 0 && (
                    <Badge variant="secondary" className="w-5 h-5 p-0 flex items-center justify-center rounded-full text-xs">
                      {dayTasks.length}
                    </Badge>
                  )}
                  <time
                    dateTime={format(day, 'yyyy-MM-dd')}
                    className={cn(
                      'font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                      'text-xs ml-auto',
                      isToday(day) && 'bg-accent text-accent-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </time>
                </div>

                <div className="mt-2 space-y-1 overflow-y-auto">
                  {dayTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => setTaskToView(task)}
                      className="text-xs p-1 rounded-sm w-full text-left truncate cursor-pointer text-white"
                      style={{ backgroundColor: task.color }}
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {taskToView && (
            <TaskDetailsDialog 
                task={taskToView}
                allTasks={allTasks}
                onOpenChange={() => setTaskToView(null)}
            />
        )}
    </Card>
  );
}
