
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/common/header';
import { ArrowRight, BrainCircuit, Calendar, GanttChart, LayoutGrid, Mic, Star, ListTodo } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  const features = [
    {
      icon: <ListTodo className="w-8 h-8 text-primary" />,
      title: 'Multiple Views',
      description: 'From simple lists and tables to Kanban boards, calendars, timelines, and mind maps. Visualize your work the way it works for you.',
    },
    {
      icon: <Mic className="w-8 h-8 text-primary" />,
      title: 'AI-Powered Task Creation',
      description: 'Simply speak your plan or paste a list. Our AI will intelligently parse, organize, and schedule your tasks in seconds.',
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: 'Intelligent Mind Maps',
      description: 'Automatically generate beautiful, hierarchical mind maps to see dependencies and project structure at a glance.',
    },
    {
      icon: <GanttChart className="w-8 h-8 text-primary" />,
      title: 'Dynamic Timelines',
      description: 'Plan your projects with a dynamic timeline view that clearly shows task durations, dependencies, and potential bottlenecks.',
    },
  ];

  const testimonials = [
    {
      name: 'Alex R.',
      role: 'Project Manager',
      quote: "TaskWise has revolutionized how my team plans projects. The AI parsing saves us hours every week, and the mind map view is a game-changer for stakeholder presentations.",
      avatar: 'https://placehold.co/100x100.png'
    },
    {
      name: 'Samantha B.',
      role: 'Freelance Developer',
      quote: "As a freelancer, staying organized is everything. The multiple views, especially the Kanban and Calendar, keep all my projects on track. I can't imagine my workflow without it.",
       avatar: 'https://placehold.co/100x100.png'
    },
    {
        name: 'David L.',
        role: 'CEO, Tech Startup',
        quote: "The ability to just speak a plan and have it turn into a structured project is pure magic. TaskWise is the most intuitive and powerful task manager I've ever used.",
        avatar: 'https://placehold.co/100x100.png'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 md:px-8 mx-auto">
            <div className="mr-4 flex items-center">
                <Link href="/" className="flex items-center gap-2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-lg">
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 0.7}} />
                            <stop offset="100%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                            </linearGradient>
                        </defs>
                        <path d="M8 7H19V9H8V7ZM8 11H19V13H8V11ZM8 15H19V17H8V15ZM5 7H6V9H5V7ZM5 11H6V13H5V11ZM5 15H6V17H5V15Z" fill="url(#grad1)"/>
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none"/>
                    </svg>
                    <h1 className="text-2xl font-bold font-headline">TaskWise</h1>
                </Link>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-1 md:space-x-2">
               <Link href="/dashboard">
                 <Button>
                    Go to App
                    <ArrowRight className="ml-2 h-4 w-4"/>
                 </Button>
               </Link>
            </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-8 mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
              The Intelligent Way to Manage Your Tasks
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              TaskWise uses AI to turn your thoughts into actionable plans. With multiple dynamic views and intelligent assistance, it's the last task manager you'll ever need.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg py-6 px-8">
                Get Started for Free <ArrowRight className="ml-2" />
              </Button>
            </Link>

            <div className="relative mt-16 shadow-2xl rounded-lg">
                <Image 
                    src="https://placehold.co/1200x600.png"
                    alt="TaskWise App Screenshot"
                    width={1200}
                    height={600}
                    className="rounded-lg border"
                    data-ai-hint="dashboard application"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
            <div className="container px-4 md:px-8 mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">A Better Way to Plan Your Work</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">TaskWise is packed with powerful features to help you stay organized and productive.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                    <Card key={index} className="text-center bg-background">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                                {feature.icon}
                            </div>
                            <CardTitle className="font-headline">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
            <div className="container px-4 md:px-8 mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">From Voice to Vision in 3 Easy Steps</h2>
                    <p className="text-lg text-muted-foreground mt-2">See how our AI turns your spoken words into a structured plan.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="text-center">
                        <Image src="https://placehold.co/400x300.png" alt="Step 1" width={400} height={300} className="rounded-lg shadow-lg mb-4" data-ai-hint="microphone icon" />
                        <h3 className="text-xl font-bold font-headline mb-2">1. Speak Your Plan</h3>
                        <p className="text-muted-foreground">Just open the speech-to-plan dialog and describe your tasks naturally.</p>
                    </div>
                     <div className="text-center">
                        <Image src="https://placehold.co/400x300.png" alt="Step 2" width={400} height={300} className="rounded-lg shadow-lg mb-4" data-ai-hint="loading process" />
                        <h3 className="text-xl font-bold font-headline mb-2">2. AI Does The Work</h3>
                        <p className="text-muted-foreground">Our intelligent engine parses, analyzes, and structures everything for you.</p>
                    </div>
                     <div className="text-center">
                        <Image src="https://placehold.co/400x300.png" alt="Step 3" width={400} height={300} className="rounded-lg shadow-lg mb-4" data-ai-hint="mindmap application" />
                        <h3 className="text-xl font-bold font-headline mb-2">3. Visualize Your Project</h3>
                        <p className="text-muted-foreground">Your plan is ready, complete with views like Mind Maps and Timelines.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/50">
            <div className="container px-4 md:px-8 mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Loved by Teams and Individuals Worldwide</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-background">
                            <CardContent className="pt-6">
                                <div className="flex items-center mb-4">
                                    <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} className="rounded-full mr-4" data-ai-hint="person" />
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20">
            <div className="container px-4 md:px-8 mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Ready to Transform Your Productivity?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">Stop juggling tools. Start organizing your work intelligently. Get started with TaskWise today, completely free.</p>
                <Link href="/dashboard">
                    <Button size="lg" className="text-lg py-6 px-8">
                        Start Planning Now <ArrowRight className="ml-2"/>
                    </Button>
                </Link>
            </div>
        </section>
      </main>

       <footer className="border-t">
         <div className="container mx-auto py-6 px-4 md:px-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} TaskWise. All rights reserved.</p>
         </div>
       </footer>
    </div>
  );
}

    