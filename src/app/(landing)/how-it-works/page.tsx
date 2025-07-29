
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, BrainCircuit, ListChecks, Mic } from 'lucide-react';
import LottieAnimation from '@/components/common/lottie-animation';

const PulsingMicAnimation = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-20 h-20 rounded-full bg-primary/20 animate-swoosh -z-0"></div>
        <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <Mic className="w-10 h-10 text-primary-foreground" />
        </div>
    </div>
);

const TimelineCardAnimation = () => (
    <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full h-full relative">
            <div className="absolute w-[45%] h-[25%] bg-purple-400 rounded-md animate-card-stair-1 shadow-md"></div>
            <div className="absolute w-[55%] h-[25%] bg-blue-400 rounded-md animate-card-stair-2 shadow-md"></div>
            <div className="absolute w-[35%] h-[25%] bg-green-400 rounded-md animate-card-stair-3 shadow-md"></div>
        </div>
    </div>
);

const AuroraGlassContainer = ({ children, useAurora = true }: { children: React.ReactNode; useAurora?: boolean }) => (
    <div className="relative w-full h-[350px] bg-white/30 rounded-2xl overflow-hidden border border-white/20 shadow-xl backdrop-blur-2xl">
        {useAurora && (
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute w-56 h-56 bg-purple-500/20 rounded-full animate-revolve-1"></div>
                <div className="absolute w-56 h-56 bg-blue-500/20 rounded-full animate-revolve-2"></div>
                <div className="absolute w-56 h-56 bg-green-500/20 rounded-full animate-revolve-3"></div>
            </div>
        )}
        <div className="relative z-10 w-full h-full">
            {children}
        </div>
    </div>
);


export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Mic className="w-12 h-12 text-primary" />,
      title: '1. Speak or Type Your Plan',
      description: "Use our AI-powered import dialog or the Speech-to-Plan feature. Describe your tasks naturally, just as you would in a conversation. Mention deadlines, priorities, and even dependencies.",
      animation: <PulsingMicAnimation />,
      useAurora: true,
    },
    {
      icon: <BrainCircuit className="w-12 h-12 text-primary" />,
      title: '2. AI Parses and Organizes',
      description: "TaskWise's intelligent engine gets to work instantly. It identifies individual tasks, understands relationships, estimates durations, and assigns priorities based on your input. No more manual data entry.",
      animation: <LottieAnimation path="/animations/Ai loading model.json" />,
      useAurora: false,
    },
    {
      icon: <ListChecks className="w-12 h-12 text-primary" />,
      title: '3. Visualize and Execute',
      description: "Your structured plan appears in your chosen view—Table, Kanban, Timeline, or Mind Map. All tasks are perfectly organized, scheduled, and ready for you to start working. Drag, drop, and update with ease.",
      animation: <TimelineCardAnimation />,
      useAurora: true,
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
            <Card className="shadow-lg overflow-hidden bg-white">
              <div className="grid md:grid-cols-2 items-center">
                <div className={`p-10 ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                    <div className="mb-4">{step.icon}</div>
                    <h2 className="text-3xl font-bold font-headline mb-4">{step.title}</h2>
                    <p className="text-gray-600">{step.description}</p>
                </div>
                <div className="bg-gray-50 h-full flex items-center justify-center p-10 min-h-[400px]">
                    <AuroraGlassContainer useAurora={step.useAurora}>
                        {step.animation}
                    </AuroraGlassContainer>
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
