'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, 
    addMinutes, startOfDay, endOfDay, eachHourOfInterval, isWithinInterval,
    addWeeks, subWeeks, getDay
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskDetailsDialog } from '../task-manager/task-details-dialog';

type ViewMode = 'day' | 'week';

const GRID_HOUR_WIDTH = 80; // px
const ROW_HEIGHT = 48; // px, includes gap
const ROW_GAP = 8; // px

const DependencyLines = ({ tasks, taskLayouts, viewMode, currentDate }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (!svgRef.current || Object.keys(taskLayouts).length === 0) return;

        const containerRect = svgRef.current.getBoundingClientRect();
        const newLines: React.ReactElement[] = [];

        tasks.forEach(task => {
            if (task.dependencies?.length > 0) {
                const fromLayout = taskLayouts[task.id];
                if (!fromLayout) return;
                
                const fromEl = document.querySelector(`[data-task-id="${task.id}"]`);
                if (!fromEl) return;
                const fromRect = fromEl.getBoundingClientRect();

                task.dependencies.forEach(depId => {
                    const toLayout = taskLayouts[depId];
                    if (!toLayout) return;

                    const toEl = document.querySelector(`[data-task-id="${depId}"]`);
                    if (!toEl) return;
                    const toRect = toEl.getBoundingClientRect();

                    const startX = fromRect.left - containerRect.left;
                    const startY = fromRect.top - containerRect.top + fromRect.height / 2;
                    const endX = toRect.right - containerRect.left;
                    const endY = toRect.top - containerRect.top + toRect.height / 2;
                    
                    const controlX1 = startX - 60;
                    const controlY1 = startY;
                    const controlX2 = endX + 60;
                    const controlY2 = endY;

                    newLines.push(
                        <path
                            key={`${task.id}-${depId}`}
                            d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                            stroke="hsl(var(--primary))"
                            strokeWidth="1.5"
                            fill="none"
                            markerEnd="url(#arrow)"
                        />
                    );
                });
            }
        });
        setLines(newLines);
    }, [tasks, taskLayouts, viewMode, currentDate]);


    return (
        <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
                </marker>
            </defs>
            {lines}
        </svg>
    );
};

const TimeIndicator = ({ viewMode, currentDate }) => {
    const [position, setPosition] = useState(0);

    const calculatePosition = useCallback(() => {
        const now = new Date();
        if (viewMode === 'day' && isSameDay(now, currentDate)) {
            const startOfHour = startOfDay(now);
            const totalMinutesInDay = 24 * 60;
            const minutesFromStart = (now.getTime() - startOfHour.getTime()) / (1000 * 60);
            return (minutesFromStart / totalMinutesInDay) * 100;
        } else if (viewMode === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            if (isWithinInterval(now, { start, end })) {
                const dayIndex = getDay(now) === 0 ? 6 : getDay(now) -1; // Monday is 0
                const dayWidth = 100 / 7;
                return dayIndex * dayWidth + (now.getHours() / 24) * dayWidth;
            }
        }
        return -1; // Hide indicator
    }, [viewMode, currentDate]);

    useEffect(() => {
        const updatePosition = () => {
            const newPos = calculatePosition();
            setPosition(newPos);
        };
        updatePosition();
        const interval = setInterval(updatePosition, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [calculatePosition]);

    if (position === -1) return null;

    return (
        <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
            style={{ left: `${position}%` }}
        >
             <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
        </div>
    );
};

export default function TimelineView({ tasks, allTasks, onUpdateTask }: { tasks: Task[], allTasks: Task[], onUpdateTask: (task: Task) => void }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const containerRef = useRef<HTMLDivElement>(null);
    const [taskToView, setTaskToView] = useState<Task | null>(null);

    
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const dayHours = useMemo(() => {
        const start = startOfDay(currentDate);
        const end = endOfDay(currentDate);
        return eachHourOfInterval({ start, end });
    }, [currentDate]);

    const scheduledTasks = useMemo(() => {
      const taskMap = new Map(allTasks.map(t => [t.id, t]));
      const processedTasks = new Map();

      function getLatestDepEndDate(task: Task, processingStack: Set<string>): Date | null {
        if (processingStack.has(task.id)) {
          console.warn("Circular dependency detected involving task:", task.title);
          return null; 
        }
        processingStack.add(task.id);

        let latestEndDate = null;
        for (const depId of task.dependencies || []) {
          const depTask = taskMap.get(depId);
          if (depTask) {
             const depEndDate = getTaskEndDate(depTask, processingStack);
             if (depEndDate && (!latestEndDate || depEndDate > latestEndDate)) {
               latestEndDate = depEndDate;
             }
          }
        }
        
        processingStack.delete(task.id);
        return latestEndDate;
      }

      function getTaskEndDate(task: Task, processingStack: Set<string>): Date {
        if(processedTasks.has(task.id)) return processedTasks.get(task.id).endDate;
        
        const latestDepEndDate = getLatestDepEndDate(task, processingStack);
        
        let startDate = task.startedAt ? new Date(task.startedAt) : null;

        if (latestDepEndDate) {
            startDate = !startDate || startDate < latestDepEndDate ? latestDepEndDate : startDate;
        }

        if (!startDate) {
            startDate = task.dueDate ? startOfDay(new Date(task.dueDate)) : startOfDay(new Date());
        }

        const isAllDay = !task.startedAt && !!task.dueDate;
        let endDate = task.estimatedTime > 0 ? addMinutes(startDate, task.estimatedTime) : (isAllDay ? endOfDay(startDate) : null);
        if(isAllDay && !endDate) endDate = endOfDay(startDate);
        if(!isAllDay && !endDate) endDate = addMinutes(startDate, 60);

        const result = { ...task, startDate, endDate, isAllDay, dependencies: task.dependencies || [] };
        processedTasks.set(task.id, result);
        return endDate;
      }

      tasks.forEach(task => getTaskEndDate(task, new Set()));
      return Array.from(processedTasks.values()).filter(t => tasks.some(orig => orig.id === t.id));

    }, [tasks, allTasks]);


    const taskLayouts = useMemo(() => {
        const layouts: {[key: string]: { task: Task & {lane: number}, lane: number }} = {};
        if (!scheduledTasks.length) return { taskLayouts: {}, totalLanes: 1 };
    
        const sortedTasks = [...scheduledTasks].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        const lanes: (Task & {endDate: Date})[][] = [];
    
        sortedTasks.forEach(task => {
            let placed = false;
            for (let i = 0; i < lanes.length; i++) {
                const lastTaskInLane = lanes[i][lanes[i].length - 1];
                if (!lastTaskInLane || task.startDate.getTime() >= lastTaskInLane.endDate.getTime()) {
                    lanes[i].push(task);
                    layouts[task.id] = { task: { ...task, lane: i }, lane: i };
                    placed = true;
                    break;
                }
            }
    
            if (!placed) {
                lanes.push([task]);
                const newLaneIndex = lanes.length - 1;
                layouts[task.id] = { task: { ...task, lane: newLaneIndex }, lane: newLaneIndex };
            }
        });
    
        return { taskLayouts: layouts, totalLanes: lanes.length };
    }, [scheduledTasks]);

    const changeDate = (direction: 'next' | 'prev') => {
        if (viewMode === 'day') {
            setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
        } else {
            setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        }
    };

    const renderTaskBlock = (task, viewBounds) => {
        const { startDate, endDate } = task;
        if (!startDate || !endDate) return null;

        const start = startDate > viewBounds.start ? startDate : viewBounds.start;
        const end = endDate < viewBounds.end ? endDate : viewBounds.end;

        if (start >= end) return null;

        const totalViewDuration = viewBounds.end.getTime() - viewBounds.start.getTime();
        const left = (start.getTime() - viewBounds.start.getTime()) / totalViewDuration * 100;
        const width = (end.getTime() - start.getTime()) / totalViewDuration * 100;
        
        const layoutInfo = taskLayouts.taskLayouts[task.id];
        if (!layoutInfo) return null;

        return (
            <div
                key={`${task.id}-${viewBounds.start}`}
                data-task-id={task.id}
                className="h-8 rounded-md flex items-center px-2 absolute cursor-pointer z-10"
                style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${layoutInfo.lane * ROW_HEIGHT}px`,
                    backgroundColor: task.color,
                }}
                onClick={() => setTaskToView(task)}
            >
                <span className="text-white text-xs font-medium truncate">{task.title}</span>
            </div>
        )
    };
    
    return (
        <Card className="shadow-lg mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">Task Timeline</CardTitle>
                        <CardDescription>
                            {viewMode === 'day' && format(currentDate, 'eeee, do MMMM yyyy')}
                            {viewMode === 'week' && `${format(weekDays[0], 'do MMM')} - ${format(weekDays[6], 'do MMM yyyy')}`}
                        </CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button variant={viewMode === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('day')}>Day</Button>
                        <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('week')}>Week</Button>
                        <Button variant="outline" size="icon" onClick={() => changeDate('prev')}><ChevronLeft /></Button>
                        <Button variant="outline" size="icon" onClick={() => changeDate('next')}><ChevronRight /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-2 overflow-x-auto">
                <div ref={containerRef} className="relative timeline-container" style={{ minHeight: `${taskLayouts.totalLanes * ROW_HEIGHT}px` }}>
                    {viewMode === 'day' && (
                        <>
                           <div className="grid" style={{ gridTemplateColumns: `repeat(24, ${GRID_HOUR_WIDTH}px)` }}>
                                {dayHours.map(hour => (
                                    <div key={hour.toString()} className="border-r border-b h-12 flex items-center justify-center">
                                        <p className="text-center text-xs text-muted-foreground">{format(hour, 'ha')}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-12 left-0 right-0" style={{ minWidth: `${24 * GRID_HOUR_WIDTH}px`, height: `${taskLayouts.totalLanes * ROW_HEIGHT}px` }}>
                                {scheduledTasks.map(task => renderTaskBlock(task, { start: startOfDay(currentDate), end: endOfDay(currentDate) }))}
                                <TimeIndicator viewMode="day" currentDate={currentDate} />
                            </div>
                        </>
                    )}
                    {viewMode === 'week' && (
                         <>
                            <div className="grid grid-cols-7">
                                {weekDays.map(day => (
                                    <div key={day.toString()} className="border-r border-b p-2 h-12">
                                        <p className={cn("text-center font-semibold text-sm", isSameDay(day, new Date()) && "text-primary")}>{format(day, 'EEE')}</p>
                                        <p className="text-center text-xs text-muted-foreground">{format(day, 'd')}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-12 left-0 right-0 w-full" style={{ height: `${taskLayouts.totalLanes * ROW_HEIGHT}px` }}>
                                {scheduledTasks.map(task => renderTaskBlock(task, { start: startOfWeek(currentDate, {weekStartsOn: 1}), end: endOfWeek(currentDate, {weekStartsOn: 1}) }))}
                                <TimeIndicator viewMode="week" currentDate={currentDate} />
                            </div>
                        </>
                    )}
                    {Object.keys(taskLayouts.taskLayouts).length > 0 && (
                        <DependencyLines tasks={scheduledTasks} taskLayouts={taskLayouts.taskLayouts} viewMode={viewMode} currentDate={currentDate}/>
                    )}
                </div>
                 {taskToView && (
                    <TaskDetailsDialog
                        task={taskToView}
                        allTasks={allTasks}
                        onOpenChange={() => setTaskToView(null)}
                    />
                )}
            </CardContent>
        </Card>
    );
}
