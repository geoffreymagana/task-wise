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
import { Loader, Upload } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';

interface ImportDialogProps {
  children: ReactNode;
  onTasksImported: (newTasks: Task[]) => void;
}

export function ImportDialog({ children, onTasksImported }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleTextImport = () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'No text provided',
        description: 'Please paste some text to import tasks.',
      });
      return;
    }
    handleAIDrivenImport(text);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (file.type === 'application/json') {
        try {
          const tasks = JSON.parse(content);
          if (Array.isArray(tasks)) {
            onTasksImported(tasks as Task[]);
            toast({
              title: 'Tasks Imported',
              description: `${tasks.length} tasks have been imported from JSON.`,
            });
            setOpen(false);
          } else {
             throw new Error('Invalid JSON format');
          }
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: 'The selected JSON file is not valid.',
          });
        }
      } else if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        handleAIDrivenImport(content);
      } else {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'Please select a JSON or Markdown file.',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAIDrivenImport = (content: string) => {
     startTransition(async () => {
      try {
        const result = await parseMarkdownTasks({ markdownText: content });
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
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Import Tasks</DialogTitle>
          <DialogDescription>
            Paste a list, or upload a JSON/Markdown file. The AI will parse it.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="md">Markdown</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-4">
            <Textarea
              placeholder="- Design new logo&#10;  - Create moodboard&#10;- Develop authentication flow (due tomorrow)"
              className="min-h-[200px] bg-muted/20"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
             <DialogFooter className="mt-4">
              <Button onClick={handleTextImport} disabled={isPending}>
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Import from Text
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="json">
            <div className="mt-4 flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <label htmlFor="json-upload" className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8"/>
                    <span>Click to upload JSON file</span>
                </label>
                <Input id="json-upload" type="file" accept=".json,application/json" className="hidden" onChange={handleFileImport} />
            </div>
          </TabsContent>
           <TabsContent value="md">
            <div className="mt-4 flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <label htmlFor="md-upload" className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8"/>
                    <span>Click to upload Markdown file</span>
                </label>
                <Input id="md-upload" type="file" accept=".md,text/markdown" className="hidden" onChange={handleFileImport} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

    