'use client';

import { ReactNode, useState } from 'react';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface ImportDialogProps {
  children: ReactNode;
  onTasksImported: (newTasks: Task[]) => void;
}

export function ImportDialog({ children, onTasksImported }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handleImport = () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'No text provided',
        description: 'Please paste some text to import tasks.',
      });
      return;
    }

    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const newTasks: Task[] = lines.map((line) => {
      // Basic parsing: treat the whole line as the title
      return {
        id: uuidv4(),
        title: line.trim(),
        description: '',
        complexity: 'medium',
        priority: 'medium',
        status: 'not_started',
        estimatedTime: 0, // No estimation on basic import
        actualTime: 0,
        dueDate: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
    });

    onTasksImported(newTasks);
    toast({
      title: 'Tasks Imported',
      description: `${newTasks.length} tasks have been added to your list.`,
    });
    setText('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Import Tasks from Text</DialogTitle>
          <DialogDescription>
            Paste your task list below. Each line will be imported as a new task.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="- Design new logo&#10;- Develop authentication flow&#10;- Deploy to production"
          className="min-h-[200px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleImport}>Import Tasks</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
