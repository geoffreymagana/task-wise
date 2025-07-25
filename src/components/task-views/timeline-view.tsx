'use client';

import { useMemo, useState } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addMinutes, format, startOfDay, eachHourOfInterval, startOfHour, endOfHour, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface TimelineViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

const getHourLabel = (date: Date) => format(date, 'h a');

export default function TimelineView({ tasks, onUpdateTask }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { tasksWithTime, minHour, maxHour } = useMemo(() => {
    const validTasks = tasks.filter(
      (task) =>
        (task.dueDate || task.startedAt) && task.estimatedTime && task.estimatedTime > 0
    );

    if (validTasks.length === 0) {
      return { tasksWithTime: [], minHour: 8, maxHour: 17 };
    }
    
    let earliest = 24;
    let latest = 0;

    const processed = validTasks.map((task) => {
      const startDate = startOfDay(new Date(task.startedAt || task.dueDate!));
      const endDate = addMinutes(startDate, task.estimatedTime!);
      const startHour = startDate.getHours() + startDate.getMinutes() / 60;
      const endHour = endDate.getHours() + endDate.getMinutes() / 60;
      
      earliest = Math.min(earliest, Math.floor(startHour));
      latest = Math.max(latest, Math.ceil(endHour));
      
      return {
        ...task,
        startDate,
        endDate,
        startHour,
        endHour,
      };
    });

    return {
      tasksWithTime: processed,
      minHour: Math.max(0, earliest - 1),
      maxHour: Math.min(23, latest + 1),
    };
  }, [tasks]);

  const hours = useMemo(() => {
    const start = startOfDay(currentDate);
    return eachHourOfInterval({
      start: start.setHours(minHour),
      end: start.setHours(maxHour),
    });
  }, [minHour, maxHour, currentDate]);
  
  const tasksForCurrentDay = useMemo(() => {
    return tasksWithTime.filter(task => isWithinInterval(task.startDate, { start: startOfDay(currentDate), end: addMinutes(startOfDay(currentDate), 1439) }));
  }, [tasksWithTime, currentDate]);


  const nextDay = () => setCurrentDate(prev => addMinutes(prev, 1440));
  const prevDay = () => setCurrentDate(prev => addMinutes(prev, -1440));

  const getGridPosition = (hour: number) => {
    const totalHours = maxHour - minHour;
    const position = ((hour - minHour) / totalHours) * 100;
    return `${position}%`;
  };

  const getTaskStyle = (task: typeof tasksWithTime[0]) => {
    const totalHours = maxHour - minHour;
    const left = ((task.startHour - minHour) / totalHours) * 100;
    const width = ((task.endHour - task.startHour) / totalHours) * 100;
    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">Project Timeline</CardTitle>
                <CardDescription>Visualize your project schedule in a chronological view.</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
                <Button variant="outline" size="icon" onClick={prevDay}><ChevronLeft/></Button>
                 <span className='font-semibold'>{format(currentDate, 'do MMMM yyyy')}</span>
                <Button variant="outline" size="icon" onClick={nextDay}><ChevronRight/></Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {tasksForCurrentDay.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No tasks scheduled for this day.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Hour Labels */}
            <div className="flex justify-between border-b pb-2">
              {hours.map((hour, index) => (
                <div key={index} className="text-xs text-muted-foreground" style={{ flexBasis: `${100 / hours.length}%` }}>
                  {getHourLabel(hour)}
                </div>
              ))}
            </div>

            {/* Grid Lines */}
            <div className="absolute top-8 bottom-0 left-0 right-0">
               {hours.slice(1).map((hour, index) => (
                <div
                  key={index}
                  className="absolute h-full border-l border-dashed"
                  style={{ left: `${(index + 1) * (100 / hours.length)}%` }}
                />
              ))}
            </div>

            {/* Task Rows */}
            <div className="mt-4 space-y-2 relative z-10">
              {tasksForCurrentDay.map((task, rowIndex) => (
                <Popover key={task.id}>
                  <PopoverTrigger asChild>
                    <div
                      className="h-10 rounded-lg flex items-center px-2 relative cursor-pointer"
                      style={{
                        ...getTaskStyle(task),
                        backgroundColor: task.color,
                        top: `${rowIndex * 48}px`,
                        position: 'absolute',
                      }}
                    >
                      <span className="text-white text-sm font-medium truncate">{task.title}</span>
                    </div>
                  </PopoverTrigger>
                   <PopoverContent>
                     <p className="font-bold">{task.title}</p>
                     <p className="text-sm text-muted-foreground">{task.description}</p>
                     <p className="text-xs mt-2">
                       {format(task.startDate, 'p')} - {format(task.endDate, 'p')} ({task.estimatedTime} min)
                     </p>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
             <div style={{ height: `${tasksForCurrentDay.length * 48}px` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
