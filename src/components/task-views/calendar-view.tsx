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
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Play, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '../ui/badge';

interface CalendarViewProps {
  tasks: Task[];
}

const statusConfig = {
  not_started: { label: 'Not Started', icon: <Circle className="w-4 h-4 text-muted-foreground" /> },
  in_progress: { label: 'In Progress', icon: <Play className="w-4 h-4 text-blue-500" /> },
  completed: { label: 'Completed', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  archived: { label: 'Archived', icon: <XCircle className="w-4 h-4 text-red-500" /> },
};


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
                  'font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                   'absolute top-2 right-2 text-xs',
                  isToday(day) && 'bg-accent text-accent-foreground'
                )}
              >
                {format(day, 'd')}
              </time>
              <div className="mt-8 space-y-1 overflow-y-auto">
                {getTasksForDay(day).map(task => (
                  <Popover key={task.id}>
                    <PopoverTrigger asChild>
                       <div 
                        className="text-xs p-1 rounded-sm w-full text-left truncate cursor-pointer"
                        style={{ backgroundColor: task.color }}
                      >
                        {task.title}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" style={{ borderLeft: `4px solid ${task.color}` }}>
                       <div className="space-y-2">
                         <h3 className="font-bold text-lg font-headline">{task.title}</h3>
                         <p className="text-sm text-muted-foreground">{task.description}</p>
                         <div className="flex items-center gap-2 text-sm">
                           {statusConfig[task.status].icon}
                           <span>{statusConfig[task.status].label}</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm">
                           <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                         </div>
                       </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>
          ))}
        </div>
    </Card>
  );
}
