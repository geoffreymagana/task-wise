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
import { Loader, Mic, Send, Pause } from 'lucide-react';

interface SpeechToPlanDialogProps {
  children: ReactNode;
  onTasksImported: (newTasks: Task[]) => void;
}

export function SpeechToPlanDialog({ children, onTasksImported }: SpeechToPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [statusMessage, setStatusMessage] = useState("Click the microphone to start recording.");
  const [isPending, startTransition] = useTransition();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for HTTPS and microphone permissions
  useEffect(() => {
    const checkPermissions = async () => {
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        setStatusMessage("Speech recognition requires HTTPS. Please use a secure connection.");
        return;
      }

      // Check for speech recognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setStatusMessage("Speech recognition not supported in this browser.");
        return;
      }

      // Check microphone permissions
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasPermission(permissionStatus.state === 'granted');
        
        if (permissionStatus.state === 'denied') {
          setStatusMessage("Microphone access denied. Please enable microphone permissions.");
        } else if (permissionStatus.state === 'prompt') {
          setStatusMessage("Click the microphone to request microphone access.");
        }
      } catch (error) {
        // Fallback: try to request permission directly
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasPermission(true);
        } catch (mediaError) {
          setHasPermission(false);
          setStatusMessage("Please allow microphone access to use speech recognition.");
        }
      }
    };

    if (open) {
      checkPermissions();
    }
  }, [open]);

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Speech recognition is not supported in your browser.',
      });
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    // Add these for better reliability
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage('Listening...');
      // Reset silence timer on start
      if(silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        if(recognitionRef.current && isListening) {
          recognitionRef.current.stop();
          setStatusMessage('No speech detected. Please try again.');
        }
      }, 10000); // Increased to 10 seconds
    };

    recognition.onend = () => {
      setIsListening(false);
      if(recognitionRef.current) {
        recognitionRef.current = null;
      }
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if(!finalTranscript.trim()) {
        setStatusMessage("Click the microphone to start again.");
      } else {
        setStatusMessage("Recording finished. Ready to import.");
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      recognitionRef.current = null;
      
      // Provide more specific error messages
      let errorMessage = 'Please try again.';
      switch(event.error) {
        case 'network':
          errorMessage = 'Network error. Check your internet connection and try again.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly and try again.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Check your microphone.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Try using HTTPS.';
          break;
      }
      
      setStatusMessage(`Error: ${errorMessage}`);
      toast({ 
        variant: 'destructive', 
        title: 'Speech Error', 
        description: errorMessage
      });
    };

    recognition.onresult = (event: any) => {
      if(silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
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
        setFinalTranscript(prev => prev + final.trim() + ' ');
      }
    };
    
    return recognition;
  };
  
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if(silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    }
  }, []);
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if(!isOpen) {
      setFinalTranscript('');
      setInterimTranscript('');
      setIsListening(false);
      setCountdown(3);
      setStatusMessage("Click the microphone to start recording.");
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream
      setHasPermission(true);
      setStatusMessage("Microphone access granted. Click the microphone to start recording.");
      return true;
    } catch (error) {
      setHasPermission(false);
      setStatusMessage("Microphone access denied. Please enable microphone permissions in your browser settings.");
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'Please allow microphone access to use speech recognition.',
      });
      return false;
    }
  };

  const toggleListening = async () => {
    // Check permissions first
    if (hasPermission === false) {
      await requestMicrophonePermission();
      return;
    }
    
    if (hasPermission === null) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (isListening || countdownIntervalRef.current) {
      if(recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if(countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setStatusMessage("Cancelled. Click the mic to start again.");
        setCountdown(3);
      }
      return;
    }
    
    setFinalTranscript('');
    setInterimTranscript('');
    setCountdown(3);
    setStatusMessage("Get ready...")

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          const recognition = setupSpeechRecognition();
          if(recognition){
            recognitionRef.current = recognition;
            try {
              recognition.start();
            } catch (error) {
              console.error('Failed to start recognition:', error);
              setStatusMessage('Failed to start speech recognition. Please try again.');
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const handleImport = () => {
    const contentToImport = finalTranscript.trim();
    if (!contentToImport) {
      toast({ variant: 'destructive', title: 'No speech recorded.'});
      return;
    }
    startTransition(async () => {
      try {
        const result = await parseMarkdownTasks({ markdownText: contentToImport });
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
  };

  const isCountingDown = countdown > 0 && countdown <= 3 && countdownIntervalRef.current !== null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl h-4/5 flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-center">Speak Your Plan</DialogTitle>
          <DialogDescription className="text-center min-h-[20px]">
            {statusMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow flex flex-col items-center justify-center relative bg-muted/20 rounded-lg p-4">
          <button
            onClick={toggleListening}
            className={`w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'scale-110' : ''} ${isCountingDown ? 'animate-pulse' : ''}`}
            disabled={isPending}
          >
            <div 
              className={`w-24 h-24 bg-primary/40 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'scale-125' : ''}`}
            >
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                {isCountingDown ? (
                  <span className="text-4xl font-bold text-primary-foreground">{countdown}</span>
                ) : isListening ? (
                  <Pause className="w-10 h-10 text-primary-foreground"/>
                ) : (
                  <Mic className="w-10 h-10 text-primary-foreground"/>
                )}
              </div>
            </div>
          </button>
          {isListening && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/20 animate-ping -z-10" />}
          <div className="text-center mt-8 text-lg w-full min-h-[5em] overflow-y-auto">
            <p className="text-muted-foreground">{finalTranscript}
              <span className="text-foreground">{interimTranscript}</span>
            </p>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={isPending || !finalTranscript.trim()}>
            {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
            Create Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
