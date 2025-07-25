'use client';

import { ReactNode, useState, useTransition } from 'react';
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
import { parseMarkdownTasks } from '@/ai/flows/parse-markdown-tasks';
import { Loader } from 'lucide-react';

interface ImportDialogProps {
  children: ReactNode;
  onTasksImported: (newTasks: Task[]) => void;
}

export function ImportDialog({ children, onTasksImported }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
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

    startTransition(async () => {
      try {
        const result = await parseMarkdownTasks({ markdownText: text });
        if (result.tasks.length === 0) {
          toast({
            variant: 'destructive',
            title: 'No tasks found',
            description: 'Could not parse any tasks from the provided text.',
          });
          return;
        }
        
        onTasksImported(result.tasks);
        toast({
          title: 'Tasks Imported',
          description: `${result.tasks.length} tasks have been intelligently imported.`,
        });
        setText('');
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'An error occurred while parsing the tasks. Please check the format and try again.',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Import Tasks from Text</DialogTitle>
          <DialogDescription>
            Paste your task list below. The AI will intelligently parse it.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="- Design new logo&#10;  - Create moodboard&#10;- Develop authentication flow (due tomorrow)"
          className="min-h-[200px] bg-muted/20"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={isPending}>
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Import Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
