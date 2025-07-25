'use client';

import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addMinutes, differenceInDays, format, startOfDay } from 'date-fns';

interface TimelineViewProps {
  tasks: Task[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background p-2 border rounded shadow-lg">
        <p className="font-bold">{data.title}</p>
        <p>Start: {format(new Date(data.startDate), 'MMM d')}</p>
        <p>End: {format(new Date(data.endDate), 'MMM d')}</p>
        <p>Duration: {data.duration} day(s)</p>
      </div>
    );
  }
  return null;
};

export default function TimelineView({ tasks }: TimelineViewProps) {
  const { chartData, yAxisData } = useMemo(() => {
    const tasksWithDates = tasks.filter(task => task.dueDate && task.estimatedTime > 0);
    if (tasksWithDates.length === 0) {
      return { chartData: [], yAxisData: [] };
    }

    const today = startOfDay(new Date());

    const processedData = tasksWithDates.map(task => {
        const startDate = task.dueDate ? startOfDay(new Date(task.dueDate)) : today;
        const endDate = addMinutes(startDate, task.estimatedTime);
        const duration = Math.max(1, differenceInDays(endDate, startDate));
        return {
            ...task,
            startDate,
            endDate,
            duration,
            name: task.title,
            range: [0, duration], 
        };
    }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return {
      chartData: processedData,
      yAxisData: processedData.map(d => d.title),
    };
  }, [tasks]);

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Timeline View</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No tasks with due dates and estimated times to display on the timeline.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartData.length * 50 + 50}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            barCategoryGap="35%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis 
              type="number" 
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => `${value}d`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="range" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
