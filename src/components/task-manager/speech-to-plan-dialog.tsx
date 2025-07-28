
'use client';

import { ReactNode, useState, useEffect, useRef, useTransition } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { parseMarkdownTasks } from '@/ai/flows/parse-markdown-tasks';
import { Loader, Mic, Send } from 'lucide-react';

interface SpeechToPlanDialogProps {
  children: ReactNode;
  onTasksImported: (newTasks: Task[]) => void;
}

export function SpeechToPlanDialog({ children, onTasksImported }: SpeechToPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Speech recognition is not supported in your browser.',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setOpen(false); // Close dialog when listening stops
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast({ variant: 'destructive', title: 'Speech Error', description: event.error });
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript(prev => prev + final);
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }

  }, [toast]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setFinalTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    }
  };
  
  const handleImport = () => {
    if (!finalTranscript.trim()) {
        toast({ variant: 'destructive', title: 'No speech recorded.'});
        return;
    }
    startTransition(async () => {
        try {
          const result = await parseMarkdownTasks({ markdownText: finalTranscript });
          if (result.tasks.length === 0) {
            toast({
              variant: 'destructive',
              title: 'No tasks found',
              description: 'Could not parse any tasks from your speech.',
            });
            return;
          }
          
          onTasksImported(result.tasks);
          toast({
            title: 'Tasks Imported',
            description: `${result.tasks.length} tasks have been imported from your speech.`,
          });
          setFinalTranscript('');
          setInterimTranscript('');
          setOpen(false);
        } catch (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: 'An error occurred while parsing the tasks.',
          });
        }
      });
  }

  useEffect(() => {
    if (open) {
        toggleListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl h-4/5 flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-center">Speak Your Plan</DialogTitle>
          <DialogDescription className="text-center">
            Describe your tasks for the day. For example, "This morning, I'll design the homepage..."
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow flex flex-col items-center justify-center relative bg-muted/20 rounded-lg p-4">
             <div 
                className={`w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'scale-110' : ''}`}
            >
                <div 
                    className={`w-24 h-24 bg-primary/40 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'scale-125' : ''}`}
                >
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                        <Mic className="w-10 h-10 text-primary-foreground"/>
                    </div>
                </div>
            </div>
             {isListening && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/20 animate-ping -z-10" />}
            <div className="text-center mt-8 text-lg w-full">
                <p className="text-muted-foreground">{finalTranscript}
                    <span className="text-foreground">{interimTranscript}</span>
                </p>
            </div>
        </div>
        <DialogFooter className="mt-4">
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleImport} disabled={isPending || !finalTranscript}>
                {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                Create Plan
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
