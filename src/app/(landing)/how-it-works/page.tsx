import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, BrainCircuit, ListChecks, Mic } from 'lucide-react';
import Image from 'next/image';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Mic className="w-12 h-12 text-primary" />,
      title: '1. Speak or Type Your Plan',
      description: "Use our AI-powered import dialog or the Speech-to-Plan feature. Describe your tasks naturally, just as you would in a conversation. Mention deadlines, priorities, and even dependencies.",
      image: "https://placehold.co/500x350.png",
      aiHint: "microphone wave"
    },
    {
      icon: <BrainCircuit className="w-12 h-12 text-primary" />,
      title: '2. AI Parses and Organizes',
      description: "TaskWise's intelligent engine gets to work instantly. It identifies individual tasks, understands relationships, estimates durations, and assigns priorities based on your input. No more manual data entry.",
      image: "https://placehold.co/500x350.png",
      aiHint: "gears turning"
    },
    {
      icon: <ListChecks className="w-12 h-12 text-primary" />,
      title: '3. Visualize and Execute',
      description: "Your structured plan appears in your chosen view—Table, Kanban, Timeline, or Mind Map. All tasks are perfectly organized, scheduled, and ready for you to start working. Drag, drop, and update with ease.",
      image: "https://placehold.co/500x350.png",
      aiHint: "dashboard view"
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
                <div className="bg-gray-100 h-full flex items-center justify-center">
                   <Image 
                      src={step.image}
                      alt={step.title}
                      width={500}
                      height={350}
                      className="object-cover"
                      data-ai-hint={step.aiHint}
                   />
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
