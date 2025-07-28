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
import { Textarea } from '../ui/textarea';

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
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        setStatusMessage("Speech recognition requires HTTPS. Please use a secure connection.");
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setStatusMessage("Speech recognition not supported in this browser.");
        return;
      }

      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasPermission(permissionStatus.state === 'granted');
        
        if (permissionStatus.state === 'denied') {
          setStatusMessage("Microphone access denied. Please enable microphone permissions.");
        } else if (permissionStatus.state === 'prompt') {
          setStatusMessage("Click the microphone to request microphone access.");
        }
      } catch (error) {
        // Fallback for browsers that don't support permissions.query
        setHasPermission(null); // We'll ask when they click
        setStatusMessage("Click the microphone to request microphone access.");
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
    
    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage('Listening...');
      if(silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      // Set a timeout to stop if no speech is detected for a while
      silenceTimeoutRef.current = setTimeout(() => {
        if(recognitionRef.current && isListening) {
          recognitionRef.current.stop();
          setStatusMessage('No speech detected for a while. Recording paused.');
        }
      }, 30000); // 30 seconds of silence
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if(!finalTranscript.trim() && !interimTranscript.trim()) {
        setStatusMessage("Click the microphone to start again.");
      } else {
        setStatusMessage("Recording paused. You can edit the text below or resume recording.");
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      recognitionRef.current = null;
      
      // Ignore user-initiated aborts
      if (event.error === 'aborted') {
          setStatusMessage("Cancelled. Click the mic to start again.");
          return;
      }

      let errorMessage = 'An unknown error occurred. Please try again.';
      switch(event.error) {
        case 'network':
          errorMessage = 'Network error. Check your internet connection.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Check your microphone.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Ensure you are on a secure connection (HTTPS).';
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
      // Clear the silence timeout on new result
      if(silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

      let interim = '';
      let final = finalTranscript; // Start with the existing final transcript

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript.trim() + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      // Only update if the final transcript has actually changed
      if (final.trim() !== finalTranscript.trim()) {
        setFinalTranscript(final);
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
      // Reset state on close
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
      // Immediately stop the track to release the microphone icon in the browser tab
      stream.getTracks().forEach(track => track.stop());
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
    // If permission is denied, prompt them to change settings
    if (hasPermission === false) {
      await requestMicrophonePermission(); // This will show the error toast
      return;
    }
    
    // If we don't know the permission status, request it now
    if (hasPermission === null) {
      const granted = await requestMicrophonePermission();
      if (!granted) return; // Stop if they deny it
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }
    
    // If a countdown is in progress, pressing the button cancels it.
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      setStatusMessage("Cancelled. Click the mic to start again.");
      setCountdown(3);
      return;
    }
    
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
        <div className="flex-grow flex flex-col items-center justify-start relative bg-muted/20 rounded-lg p-4 gap-4">
          <div className="relative flex items-center justify-center">
            <button
              onClick={toggleListening}
              className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 z-10"
              disabled={isPending}
            >
              <div 
                className="w-20 h-20 bg-primary/40 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  {isCountingDown ? (
                    <span className="text-4xl font-bold text-primary-foreground">{countdown}</span>
                  ) : isListening ? (
                    <Pause className="w-8 h-8 text-primary-foreground"/>
                  ) : (
                    <Mic className="w-8 h-8 text-primary-foreground"/>
                  )}
                </div>
              </div>
            </button>
            {(isListening || isCountingDown) && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/20 animate-ping -z-0" />}
          </div>
          
          <div className="w-full flex-grow min-h-0">
             {isListening || finalTranscript ? (
                <Textarea
                    value={finalTranscript + interimTranscript}
                    onChange={(e) => {
                      if(!isListening) {
                        setFinalTranscript(e.target.value);
                      }
                    }}
                    readOnly={isListening}
                    placeholder="Your recorded speech will appear here. You can edit it after pausing."
                    className="w-full h-full text-base resize-none"
                    rows={10}
                />
                ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Click the mic to begin.
                </div>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4 pt-4 border-t">
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
