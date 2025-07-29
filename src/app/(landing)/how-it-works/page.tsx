import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, BrainCircuit, ListChecks, Mic, Table, Calendar } from 'lucide-react';
import LottieAnimation from '@/components/common/lottie-animation';

const PulsingMicAnimation = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-swoosh -z-0"></div>
        <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl">
            <Mic className="w-10 h-10 text-primary-foreground" />
        </div>
    </div>
);

const VisualizeAnimation = () => (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-12 overflow-hidden">
        <div className="w-full h-full relative">
            {/* Cards */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[50%] h-[20%] bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg animate-card-fall-1 shadow-xl border border-white/20"></div>
            <div className="absolute left-1/2 -translate-x-1/2 w-[50%] h-[20%] bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg animate-card-fall-2 shadow-xl border border-white/20"></div>
            <div className="absolute left-1/2 -translate-x-1/2 w-[50%] h-[20%] bg-gradient-to-r from-green-400 to-green-500 rounded-lg animate-card-fall-3 shadow-xl border border-white/20"></div>

            {/* Icons */}
            <div className="absolute w-full h-full flex items-center justify-center animate-table-slide">
                <Table className="w-24 h-24" style={{ color: '#3b82f6' }} />
            </div>
            <div className="absolute w-full h-full flex items-center justify-center animate-calendar-zoom">
                <Calendar className="w-24 h-24" style={{ color: '#ef4444' }} />
            </div>
        </div>
    </div>
);


const AuroraGlassContainer = ({ children, useAurora = true }: { children: React.ReactNode; useAurora?: boolean }) => (
    <div className="relative w-full h-[450px] overflow-hidden rounded-3xl">
        {/* Aurora background orbs */}
        {useAurora && (
            <div className="absolute inset-0">
                <div className="absolute w-64 h-64 bg-purple-500/30 rounded-full animate-revolve-1 blur-xl"></div>
                <div className="absolute w-56 h-56 bg-blue-500/25 rounded-full animate-revolve-2 blur-xl"></div>
                <div className="absolute w-48 h-48 bg-green-500/20 rounded-full animate-revolve-3 blur-xl"></div>
            </div>
        )}
        
        {/* Enhanced glass morphism layer */}
        <div className="absolute inset-0 glass-morphism-strong rounded-3xl"></div>
        
        {/* Content layer */}
        <div className="relative z-10 w-full h-full p-4">
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
      animation: <div className="scale-125"><LottieAnimation path="/animations/Ai loading model.json" /></div>,
      useAurora: false,
    },
    {
      icon: <ListChecks className="w-12 h-12 text-primary" />,
      title: '3. Visualize and Execute',
      description: "Your structured plan appears in your chosen view—Table, Kanban, Timeline, or Mind Map. All tasks are perfectly organized, scheduled, and ready for you to start working. Drag, drop, and update with ease.",
      animation: <VisualizeAnimation />,
      useAurora: true,
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-4">How TaskWise Works</h1>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-16">
        Transform your unstructured thoughts into actionable plans in three simple, powerful steps.
      </p>

      <div className="space-y-12 md:space-y-16">
        {steps.map((step, index) => (
          <div key={index}>
            <Card className="shadow-2xl overflow-hidden bg-white border-0">
              <div className="grid md:grid-cols-2 items-center gap-0">
                <div className={`p-10 md:p-12 ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                    <div className="mb-6">{step.icon}</div>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">{step.title}</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-full flex items-center justify-center p-8 md:p-12 min-h-[450px]">
                    <AuroraGlassContainer useAurora={step.useAurora}>
                        {step.animation}
                    </AuroraGlassContainer>
                </div>
              </div>
            </Card>
            {index < steps.length - 1 && (
              <div className="flex justify-center my-12">
                <ArrowDown className="w-12 h-12 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
