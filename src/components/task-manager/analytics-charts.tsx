
'use client';

import type { Task } from '@/lib/types';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { subDays, format, startOfDay } from 'date-fns';

interface AnalyticsChartsProps {
  tasks: Task[];
}

const COLORS = {
  not_started: '#94a3b8',
  in_progress: '#3b82f6',
  completed: '#22c55e',
};
const PRIORITY_COLORS = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#ef4444',
};

export function AnalyticsCharts({ tasks }: AnalyticsChartsProps) {
  const chartData = useMemo(() => {
    // Tasks completed per day (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dailyCompletion = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return {
        date: format(date, 'MMM d'),
        count: 0,
      };
    });

    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        const completedDate = startOfDay(new Date(task.completedAt));
        if (completedDate >= thirtyDaysAgo) {
          const formattedDate = format(completedDate, 'MMM d');
          const dayData = dailyCompletion.find(d => d.date === formattedDate);
          if (dayData) {
            dayData.count++;
          }
        }
      }
    });

    // Task status distribution (histogram)
    const statusDistribution = tasks.reduce(
      (acc, task) => {
        if (task.status in acc) {
          acc[task.status]++;
        }
        return acc;
      },
      { not_started: 0, in_progress: 0, completed: 0 }
    );
    const statusChartData = Object.entries(statusDistribution).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));

    // Task priority distribution (donut chart)
    const priorityDistribution = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const priorityChartData = Object.entries(priorityDistribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: PRIORITY_COLORS[name as keyof typeof PRIORITY_COLORS] || '#cccccc',
    }));

    return { dailyCompletion, statusChartData, priorityChartData };
  }, [tasks]);

  const totalTasks = tasks.length;

  if (totalTasks === 0) {
      return (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
              <p>No task data available to display charts.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Distribution of all your tasks based on priority level.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage = ((data.value / totalTasks) * 100).toFixed(1);
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <p className="text-sm font-medium">{`${data.name}: ${data.value} (${percentage}%)`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData.priorityChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  labelLine={false}
                >
                  {chartData.priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
             <CardDescription>A snapshot of your tasks current statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.statusChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <p className="text-sm font-medium">{`${payload[0].payload.name}: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                  {chartData.statusChartData.map((entry, index) => {
                    const statusKey = entry.name.toLowerCase().replace(' ', '_');
                    return <Cell key={`cell-${index}`} fill={COLORS[statusKey as keyof typeof COLORS]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Trend</CardTitle>
          <CardDescription>Tasks completed over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.dailyCompletion}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="text-sm font-bold">{label}</p>
                        <p className="text-sm">{`Completed: ${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
               <Line 
                 type="monotone" 
                 dataKey="count" 
                 stroke="url(#colorCount)" 
                 strokeWidth={10} 
                 fill="url(#colorCount)"
                />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
