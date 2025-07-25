'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addMinutes, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';

interface TimelineViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
};

const DependencyLines = ({ tasks, taskPositions }) => {
    const lines = [];
    const containerRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        // This useEffect is to help re-render lines when positions update
    }, [taskPositions]);
    
    if (!containerRef.current) return null;
    const containerRect = containerRef.current.closest('.timeline-container')?.getBoundingClientRect();
    if (!containerRect) return null;

    tasks.forEach(task => {
        if (task.dependencies?.length > 0) {
            const fromPosition = taskPositions[task.id];
            if (!fromPosition) return;

            task.dependencies.forEach(depId => {
                const toPosition = taskPositions[depId];
                if (!toPosition) return;

                const fromRect = fromPosition.el.getBoundingClientRect();
                const toRect = toPosition.el.getBoundingClientRect();
                
                const startX = fromRect.left - containerRect.left;
                const startY = fromRect.top - containerRect.top + fromRect.height / 2;
                const endX = toRect.right - containerRect.left;
                const endY = toRect.top - containerRect.top + toRect.height / 2;

                const controlX1 = startX - 50;
                const controlY1 = startY;
                const controlX2 = endX + 50;
                const controlY2 = endY;

                lines.push(
                    <path
                        key={`${task.id}-${depId}`}
                        d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrow)"
                    />
                );
            });
        }
    });

    return (
        <svg ref={containerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
                </marker>
            </defs>
            {lines}
        </svg>
    );
};


export default function TimelineView({ tasks, onUpdateTask }: TimelineViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekDays = getWeekDays(currentDate);
    const containerRef = useRef<HTMLDivElement>(null);
    const [taskPositions, setTaskPositions] = useState({});

    const scheduledTasks = useMemo(() => {
        return tasks.map(task => {
            const startDate = task.startedAt ? new Date(task.startedAt) : (task.dueDate ? new Date(task.dueDate) : null);
            if (!startDate) return null;

            const isAllDay = !task.startedAt && !!task.dueDate;
            const endDate = task.estimatedTime > 0 ? addMinutes(startDate, task.estimatedTime) : (isAllDay ? startDate : null);

            return { ...task, startDate, endDate, isAllDay, dependencies: task.dependencies || [] };
        }).filter(Boolean);
    }, [tasks]);

    const { taskLayouts, totalLanes } = useMemo(() => {
        const layoutTasks = (tasksToLayout) => {
            const lanes: Task[][] = [];
            const layouts: {[key: string]: Task & {lane: number}} = {};
    
            const sortedTasks = [...tasksToLayout].sort((a, b) => a.startDate - b.startDate);
    
            sortedTasks.forEach(task => {
                let placed = false;
                for (let i = 0; i < lanes.length; i++) {
                    const lastTaskInLane = lanes[i][lanes[i].length - 1];
                    // If the new task starts after the last one in the lane ends
                    if (!lastTaskInLane || (task.endDate && lastTaskInLane.endDate && task.startDate >= lastTaskInLane.endDate)) {
                        lanes[i].push(task);
                        layouts[task.id] = { ...task, lane: i };
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    lanes.push([task]);
                    layouts[task.id] = { ...task, lane: lanes.length - 1 };
                }
            });
    
            return { taskLayouts: layouts, totalLanes: lanes.length };
        };
        return layoutTasks(scheduledTasks);

    }, [scheduledTasks]);

    useEffect(() => {
        const positions = {};
        if (containerRef.current) {
            Object.keys(taskLayouts).forEach(taskId => {
                const el = containerRef.current.querySelector(`[data-task-id="${taskId}"]`);
                if (el) {
                    positions[taskId] = { el };
                }
            });
        }
        setTaskPositions(positions);
    }, [taskLayouts, currentDate]);

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(subDays(currentDate, 7));

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">Project Timeline</CardTitle>
                        <CardDescription>Visualize your project schedule for the week.</CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft /></Button>
                        <span className='font-semibold'>{format(weekDays[0], 'do MMM')} - {format(weekDays[6], 'do MMM yyyy')}</span>
                        <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 overflow-x-auto">
                <div ref={containerRef} className="relative timeline-container" style={{ minWidth: `${weekDays.length * 150}px`, minHeight: `${(totalLanes + 1) * 60}px` }}>
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${weekDays.length}, minmax(150px, 1fr))` }}>
                        {weekDays.map(day => (
                            <div key={day.toString()} className="border-r border-b p-2 h-16">
                                <p className={cn("text-center font-semibold", isSameDay(day, new Date()) && "text-primary")}>{format(day, 'EEE')}</p>
                                <p className="text-center text-xs text-muted-foreground">{format(day, 'd')}</p>
                            </div>
                        ))}
                    </div>
                    <div className="absolute top-16 left-0 right-0">
                        {Object.values(taskLayouts).map((task) => {
                             if (!task.startDate) return null;
                             const weekStart = weekDays[0];
                             const weekEnd = weekDays[6];

                             const taskStartInView = task.startDate > weekStart ? task.startDate : weekStart;
                             const taskEndInView = task.endDate && task.endDate < weekEnd ? task.endDate : weekEnd;

                             if (taskStartInView > taskEndInView) return null;
                            
                             const startDayIndex = Math.max(0, weekDays.findIndex(day => isSameDay(day, task.startDate)));
                             const endDayIndex = task.endDate ? weekDays.findIndex(day => isSameDay(day, task.endDate)) : startDayIndex;

                             if (startDayIndex === -1 && !isWithinInterval(task.startDate, { start: weekDays[0], end: weekDays[6]})) return null;

                             const clampedStart = Math.max(startDayIndex, 0);
                             const clampedEnd = endDayIndex === -1 ? weekDays.length -1 : Math.min(endDayIndex, weekDays.length - 1);
                             
                             const startOffset = (task.startDate.getHours() * 60 + task.startDate.getMinutes()) / 1440;
                             
                             const left = (clampedStart + (task.isAllDay ? 0 : startOffset)) * (100 / weekDays.length);
                             
                             let width;
                             if(task.isAllDay){
                                width = (100 / weekDays.length);
                             } else {
                                const durationInMs = (task.endDate || task.startDate) - task.startDate;
                                const durationInDays = durationInMs / (1000 * 60 * 60 * 24);
                                width = Math.max(durationInDays, 0.05) * (100 / weekDays.length);
                             }

                            return (
                                <Popover key={task.id}>
                                    <PopoverTrigger asChild>
                                        <div
                                            data-task-id={task.id}
                                            className="h-10 rounded-lg flex items-center px-2 absolute cursor-pointer z-10"
                                            style={{
                                                left: `${left}%`,
                                                width: `${width}%`,
                                                top: `${task.lane * 48}px`,
                                                backgroundColor: task.color,
                                            }}
                                        >
                                            <span className="text-white text-sm font-medium truncate">{task.title}</span>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <p className="font-bold">{task.title}</p>
                                        <p className="text-sm text-muted-foreground">{task.description}</p>
                                        <p className="text-xs mt-2">
                                            {format(task.startDate, 'p')} - {task.endDate ? format(task.endDate, 'p') : ''}
                                        </p>
                                        <Badge>{task.priority}</Badge>
                                    </PopoverContent>
                                </Popover>
                            )
                        })}
                    </div>
                    {Object.keys(taskPositions).length > 0 && (
                        <DependencyLines tasks={Object.values(taskLayouts)} taskPositions={taskPositions} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
