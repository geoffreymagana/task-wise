'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';

const STORAGE_KEY = 'taskwise-tasks';

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        setTasks(JSON.parse(items));
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
    setTasks((prevTasks) => [...prevTasks, task]);
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
    setTasks(newTasks);
  }, []);

  return { tasks, addTask, updateTask, deleteTask, setTasks: customSetTasks, isLoaded };
}
