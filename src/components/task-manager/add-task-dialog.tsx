'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTaskAction } from '@/lib/actions';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Timer, Zap } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn, generateColor, timeToMinutes } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { IconSelect } from '../common/icon-select';
import { ScrollArea } from '../ui/scroll-area';

const FormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  complexity: z.enum(['low', 'medium', 'high']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().nullable(),
  estimatedTime: z.coerce.number().min(0).optional(),
  estimatedTimeUnit: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface AddTaskDialogProps {
  children: ReactNode;
  onTaskCreated: (newTask: Task) => void;
  onTaskUpdated?: (updatedTask: Task) => void;
  taskToEdit?: Task;
  allTasks: Task[];
}

export function AddTaskDialog({ children, onTaskCreated, onTaskUpdated, taskToEdit, allTasks }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      complexity: 'medium',
      priority: 'medium',
      dueDate: null,
      estimatedTime: 0,
      estimatedTimeUnit: 'minutes',
      dependencies: [],
      icon: 'Package',
      color: generateColor(),
    },
  });

  const availableDependencies = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter(task => task.id !== taskToEdit?.id);
  }, [allTasks, taskToEdit]);


  useEffect(() => {
    if (taskToEdit && open) {
      form.reset({
        title: taskToEdit.title,
        description: taskToEdit.description,
        complexity: taskToEdit.complexity,
        priority: taskToEdit.priority,
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null,
        estimatedTime: taskToEdit.estimatedTime || 0,
        estimatedTimeUnit: 'minutes', // Default to minutes for editing, user can change
        dependencies: taskToEdit.dependencies || [],
        icon: taskToEdit.icon,
        color: taskToEdit.color
      });
    } else if (!taskToEdit) {
      form.reset({
        title: '',
        description: '',
        complexity: 'medium',
        priority: 'medium',
        dueDate: null,
        estimatedTime: 0,
        estimatedTimeUnit: 'minutes',
        dependencies: [],
        icon: 'Package',
        color: generateColor(),
      });
    }
  }, [taskToEdit, open, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const estimatedTimeInMinutes = timeToMinutes(data.estimatedTime || 0, data.estimatedTimeUnit || 'minutes');
      
      if (taskToEdit) {
        if (onTaskUpdated) {
          const updatedTask: Task = {
            ...taskToEdit,
            ...data,
            estimatedTime: estimatedTimeInMinutes,
            dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : null,
          };
          onTaskUpdated(updatedTask);
          toast({ title: 'Task Updated', description: `"${data.title}" has been updated.` });
        }
      } else {
        const actionData = { ...data, dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : null };
        const newTask = await createTaskAction(actionData);
        onTaskCreated(newTask);
        toast({ title: 'Task Created', description: `"${newTask.title}" has been added.` });
      }
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not save the task. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowEstimation = !taskToEdit || !taskToEdit.estimatedTime;
  const watchIcon = form.watch('icon');
  const watchColor = form.watch('color');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[70vh] p-1">
              <div className="space-y-4 p-3">
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                         <FormControl>
                          <IconSelect 
                            value={field.value} 
                            onChange={field.onChange}
                            color={watchColor}
                            onColorChange={(color) => form.setValue('color', color)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="sr-only">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Design the new homepage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add more details about the task..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                </div>
                <FormLabel>Estimated Time</FormLabel>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estimatedTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 60" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="estimatedTimeUnit"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="weeks">Weeks</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                
                {shouldShowEstimation && (
                  <FormField
                    control={form.control}
                    name="complexity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Complexity (for AI estimate)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complexity for AI estimation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}
                 <FormField
                  control={form.control}
                  name="dependencies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dependencies</FormLabel>
                       <Select onValueChange={(value) => field.onChange([...(field.value || []), value])} >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select task dependencies" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {availableDependencies.map(task => (
                             <SelectItem key={task.id} value={task.id} disabled={field.value?.includes(task.id)}>
                               {task.title}
                             </SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                       <div className="flex flex-wrap gap-2 mt-2">
                        {field.value?.map(depId => {
                          const depTask = allTasks.find(t => t.id === depId);
                          return depTask ? (
                            <div key={depId} className="bg-muted text-muted-foreground text-xs p-1 rounded-md flex items-center gap-1">
                              {depTask.title}
                               <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4"
                                onClick={() => field.onChange(field.value?.filter(id => id !== depId))}
                              >
                                &times;
                              </Button>
                            </div>
                          ) : null
                        })}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="p-3 pt-0">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Timer className="mr-2 h-4 w-4 animate-spin" />}
                {taskToEdit ? 'Save Changes' : 
                  (shouldShowEstimation ?
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Create & Estimate
                    </> : 'Create Task'
                  )
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
