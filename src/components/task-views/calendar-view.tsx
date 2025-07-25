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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface CalendarViewProps {
  tasks: Task[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
  
  const priorityConfig = {
    low: 'bg-green-200 text-green-800',
    medium: 'bg-yellow-200 text-yellow-800',
    high: 'bg-red-200 text-red-800',
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
        {daysInMonth.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              'border-r border-b p-2 min-h-[120px] relative flex flex-col',
              !isSameMonth(day, currentMonth) && 'bg-muted/50 text-muted-foreground'
            )}
          >
            <time
              dateTime={format(day, 'yyyy-MM-dd')}
              className={cn(
                'absolute top-2 right-2 text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                isToday(day) && 'bg-accent text-accent-foreground'
              )}
            >
              {format(day, 'd')}
            </time>
            <div className="mt-8 space-y-1 overflow-y-auto">
              {getTasksForDay(day).map(task => (
                <div key={task.id} className={cn('text-xs p-1 rounded-sm', priorityConfig[task.priority])}>
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
