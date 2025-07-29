'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, BrainCircuit, ListChecks, Mic } from 'lucide-react';
import Image from 'next/image';
import LottieAnimation from '@/components/common/lottie-animation';

const VoiceAnimation = () => (
    <div className="flex items-center justify-center w-full h-full">
        <div className="flex items-center justify-center gap-1 h-12">
            <div className="w-2 h-4 bg-primary/70 rounded-full animate-waveform" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-6 bg-primary/70 rounded-full animate-waveform" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-8 bg-primary/70 rounded-full animate-waveform" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-10 bg-primary/70 rounded-full animate-waveform" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-2 h-8 bg-primary/70 rounded-full animate-waveform" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-2 h-6 bg-primary/70 rounded-full animate-waveform" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-4 bg-primary/70 rounded-full animate-waveform" style={{ animationDelay: '0.6s' }}></div>
        </div>
    </div>
);

const VisualizeAnimation = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        {/* Lines */}
        <svg className="absolute w-2/3 h-2/3" viewBox="0 0 100 100">
            <line x1="50" y1="15" x2="25" y2="50" stroke="#d1d5db" strokeWidth="1" className="animate-node-appear" style={{ animationDelay: '0.6s' }} />
            <line x1="50" y1="15" x2="75" y2="50" stroke="#d1d5db" strokeWidth="1" className="animate-node-appear" style={{ animationDelay: '0.8s' }} />
            <line x1="25" y1="50" x2="15" y2="85" stroke="#d1d5db" strokeWidth="1" className="animate-node-appear" style={{ animationDelay: '1s' }} />
            <line x1="25" y1="50" x2="35" y2="85" stroke="#d1d5db" strokeWidth="1" className="animate-node-appear" style={{ animationDelay: '1.2s' }} />
        </svg>
        {/* Nodes */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-full animate-node-appear" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-[20%] w-8 h-8 bg-purple-500 rounded-full animate-node-appear" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-[70%] w-8 h-8 bg-orange-500 rounded-full animate-node-appear" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute bottom-[10%] left-[10%] w-8 h-8 bg-green-500 rounded-full animate-node-appear" style={{ animationDelay: '1.4s' }}></div>
        <div className="absolute bottom-[10%] left-[30%] w-8 h-8 bg-blue-500 rounded-full animate-node-appear" style={{ animationDelay: '1.6s' }}></div>
    </div>
);

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Mic className="w-12 h-12 text-primary" />,
      title: '1. Speak or Type Your Plan',
      description: "Use our AI-powered import dialog or the Speech-to-Plan feature. Describe your tasks naturally, just as you would in a conversation. Mention deadlines, priorities, and even dependencies.",
      animation: <VoiceAnimation />
    },
    {
      icon: <BrainCircuit className="w-12 h-12 text-primary" />,
      title: '2. AI Parses and Organizes',
      description: "TaskWise's intelligent engine gets to work instantly. It identifies individual tasks, understands relationships, estimates durations, and assigns priorities based on your input. No more manual data entry.",
      animation: <LottieAnimation path="/animations/Ai loading model.json" />
    },
    {
      icon: <ListChecks className="w-12 h-12 text-primary" />,
      title: '3. Visualize and Execute',
      description: "Your structured plan appears in your chosen view—Table, Kanban, Timeline, or Mind Map. All tasks are perfectly organized, scheduled, and ready for you to start working. Drag, drop, and update with ease.",
      animation: <VisualizeAnimation />
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-4">How TaskWise Works</h1>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-16">
        Transform your unstructured thoughts into actionable plans in three simple, powerful steps.
      </p>

      <div className="space-y-8 md:space-y-0">
        {steps.map((step, index) => (
          <div key={index}>
            <Card className="shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2 items-center">
                <div className={`p-10 ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                    <div className="mb-4">{step.icon}</div>
                    <h2 className="text-3xl font-bold font-headline mb-4">{step.title}</h2>
                    <p className="text-gray-600">{step.description}</p>
                </div>
                <div className="bg-gray-100 h-full flex items-center justify-center p-10 min-h-[300px]">
                   {step.animation}
                </div>
              </div>
            </Card>
            {index < steps.length - 1 && (
              <div className="flex justify-center my-8">
                <ArrowDown className="w-10 h-10 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
