'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { generateColor } from '@/lib/utils';

const STORAGE_KEY = 'taskwise-tasks';

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        // Add color to tasks that don't have one
        const parsedTasks = JSON.parse(items).map((task: Task) => ({
          ...task,
          color: task.color || generateColor(),
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
    const taskWithColor = { ...task, color: task.color || generateColor() };
    setTasks((prevTasks) => [...prevTasks, taskWithColor]);
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }, []);
  
  const customSetTasks = useCallback((newTasks: Task[]) => {
     const tasksWithColors = newTasks.map((task) => ({
      ...task,
      color: task.color || generateColor(),
    }));
    setTasks(tasksWithColors);
  }, []);

  const deleteTasks = useCallback((taskIds: string[]) => {
    setTasks((prevTasks) => prevTasks.filter((task) => !taskIds.includes(task.id)));
  }, []);

  const updateTasksStatus = useCallback((taskIds: string[], status: Task['status']) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (taskIds.includes(task.id)) {
          return { 
            ...task, 
            status, 
            completedAt: status === 'completed' ? new Date().toISOString() : task.completedAt,
            startedAt: status === 'in_progress' && !task.startedAt ? new Date().toISOString() : task.startedAt,
          };
        }
        return task;
      })
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
  };
}
