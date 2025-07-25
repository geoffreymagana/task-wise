'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { generateColor, getRandomIcon } from '@/lib/utils';
import { useToast } from './use-toast';

const STORAGE_KEY = 'taskwise-tasks';

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        // Add color to tasks that don't have one
        const parsedTasks = JSON.parse(items).map((task: Task) => ({
          ...task,
          color: task.color || generateColor(),
          icon: task.icon || getRandomIcon(),
          dependencies: task.dependencies || [],
          startTime: task.startTime || null,
          endTime: task.endTime || null,
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage', error);
      }
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback((task: Task) => {
    const taskWithColor = { 
      ...task, 
      color: task.color || generateColor(), 
      icon: task.icon || getRandomIcon(),
      dependencies: task.dependencies || [],
      startTime: task.startTime || null,
      endTime: task.endTime || null,
    };
    setTasks((prevTasks) => [...prevTasks, taskWithColor]);
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? { ...task, ...updatedTask } : task))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }, []);
  
  const customSetTasks = useCallback((newTasks: Task[]) => {
     const tasksWithDefaults = newTasks.map((task) => ({
      ...task,
      color: task.color || generateColor(),
      icon: task.icon || getRandomIcon(),
      dependencies: task.dependencies || [],
      startTime: task.startTime || null,
      endTime: task.endTime || null,
    }));
    setTasks(tasksWithDefaults);
  }, []);

  const deleteTasks = useCallback((taskIds: string[]) => {
    setTasks((prevTasks) => prevTasks.filter((task) => !taskIds.includes(task.id)));
  }, []);

  const updateTasksStatus = useCallback((taskIds: string[], status: Task['status']) => {
    setTasks((prevTasks) => {
      let canUpdate = true;
      if (status === 'completed') {
        for (const taskId of taskIds) {
          const task = prevTasks.find(t => t.id === taskId);
          if (task && task.dependencies?.length > 0) {
            for (const depId of task.dependencies) {
              const depTask = prevTasks.find(t => t.id === depId);
              if (depTask && depTask.status !== 'completed') {
                toast({
                  variant: 'destructive',
                  title: 'Dependency not completed',
                  description: `Task "${task.title}" cannot be completed because its dependency "${depTask.title}" is not finished.`
                });
                canUpdate = false;
                break;
              }
            }
          }
          if (!canUpdate) break;
        }
      }

      if (!canUpdate) return prevTasks;

      return prevTasks.map((task) => {
        if (taskIds.includes(task.id)) {
          const now = new Date().toISOString();
          const startedAt = (status === 'in_progress' || status === 'completed') && !task.startedAt ? now : task.startedAt;
          const completedAt = status === 'completed' ? now : task.completedAt;
          const endTime = status === 'completed' && !task.endTime ? now : task.endTime;

          return { 
            ...task, 
            status, 
            startedAt,
            completedAt,
            endTime,
          };
        }
        return task;
      });
    });
  }, [toast]);

  const reinstateTask = useCallback((taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: 'not_started' } : task
      )
    );
  }, []);


  return { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    setTasks: customSetTasks, 
    isLoaded,
    deleteTasks,
    updateTasksStatus,
    reinstateTask,
  };
}

    