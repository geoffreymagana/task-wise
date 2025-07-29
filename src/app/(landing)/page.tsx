
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, Calendar, GanttChart, LayoutGrid, Mic, Star, ListTodo, Clock, CheckSquare, User, Briefcase, Rocket } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LottieAnimation from '@/components/common/lottie-animation';

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
      icon: User,
      color: 'text-purple-500'
    },
    {
      name: 'Samantha B.',
      role: 'Freelance Developer',
      quote: "As a freelancer, staying organized is everything. The multiple views, especially the Kanban and Calendar, keep all my projects on track. I can't imagine my workflow without it.",
       icon: Briefcase,
       color: 'text-blue-500'
    },
    {
        name: 'David L.',
        role: 'CEO, Tech Startup',
        quote: "The ability to just speak a plan and have it turn into a structured project is pure magic. TaskWise is the most intuitive and powerful task manager I've ever used.",
        icon: Rocket,
        color: 'text-orange-500'
    }
  ];

  return (
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
          <div className="absolute inset-0 bg-dotted-pattern -z-0"></div>
          <div className="container mx-auto text-center px-4 md:px-8 relative z-10">
            
            <div className="relative inline-block mb-6">
                <div className="p-3 bg-white rounded-lg shadow-md border inline-block">
                     <ListTodo className="w-8 h-8 text-primary" />
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-gray-900">
              The Intelligent Way to Manage Your Tasks
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              TaskWise uses AI to turn your thoughts into actionable plans. With multiple dynamic views and intelligent assistance, it's the last task manager you'll ever need.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg py-6 px-8">
                Get Started for Free <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Floating UI Elements */}
          <div className="absolute inset-0 w-full h-full -z-0 hidden md:block">
              <Card className="absolute top-[15%] left-[10%] w-56 p-4 shadow-lg transform -rotate-6 text-gray-900 bg-white">
                  <p className="text-sm font-semibold">📌 Take Notes</p>
                  <p className="text-xs text-gray-500 mt-1">Keep track of crucial details, and accomplish more tasks with ease.</p>
                  <div className="mt-2 flex justify-end">
                      <div className="p-2 bg-blue-500 rounded-lg shadow-inner">
                        <CheckSquare className="w-5 h-5 text-white" />
                      </div>
                  </div>
              </Card>

              <Card className="absolute top-[20%] right-[8%] w-52 p-3 shadow-lg transform rotate-3 text-gray-900 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-semibold">Reminders</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-xs font-bold text-gray-800">Today's Meeting</p>
                    <p className="text-xs text-gray-500">Call with marketing team</p>
                    <Badge variant="secondary" className="mt-2 text-blue-600 bg-blue-100">1:00 - 1:45 PM</Badge>
                  </div>
              </Card>

              <Card className="absolute bottom-[10%] left-[18%] w-64 p-3 shadow-lg transform rotate-2 text-gray-900 bg-white">
                  <p className="text-sm font-semibold mb-2">Today's tasks</p>
                  <div className="space-y-2">
                      <div className="text-xs">
                        <p className="text-gray-800">New ideas for campaign</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1"><div className="bg-orange-400 h-1.5 rounded-full" style={{width: '60%'}}></div></div>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-800">Design PPT #4</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1"><div className="bg-green-500 h-1.5 rounded-full" style={{width: '90%'}}></div></div>
                      </div>
                  </div>
              </Card>
              
              <Card className="absolute bottom-[15%] right-[10%] w-48 p-4 shadow-lg transform -rotate-3 text-gray-900 bg-white">
                    <p className="text-sm font-semibold mb-2 text-center">Visualizations</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center justify-center p-2 bg-gray-100 rounded-md">
                            <LayoutGrid className="w-6 h-6 text-purple-500"/>
                            <p className="text-xs mt-1 text-gray-700">Kanban</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-gray-100 rounded-md">
                            <Calendar className="w-6 h-6 text-red-500"/>
                            <p className="text-xs mt-1 text-gray-700">Calendar</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-gray-100 rounded-md">
                            <GanttChart className="w-6 h-6 text-green-500"/>
                            <p className="text-xs mt-1 text-gray-700">Timeline</p>
                        </div>
                         <div className="flex flex-col items-center justify-center p-2 bg-gray-100 rounded-md">
                            <BrainCircuit className="w-6 h-6 text-blue-500"/>
                            <p className="text-xs mt-1 text-gray-700">Mind Map</p>
                        </div>
                    </div>
              </Card>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900">A Better Way to Plan Your Work</h2>
                    <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">TaskWise is packed with powerful features to help you stay organized and productive.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                    <Card key={index} className="text-center bg-white shadow-lg text-gray-900">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                                {feature.icon}
                            </div>
                            <CardTitle className="font-headline text-gray-800">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">{feature.description}</p>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900">From Voice to Vision in 3 Easy Steps</h2>
                    <p className="text-lg text-gray-600 mt-2">See how our AI turns your spoken words into a structured plan.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    <div className="text-center flex flex-col items-center">
                        <div className="w-full h-48 mb-4 flex items-center justify-center overflow-hidden">
                            <LottieAnimation path="/animations/Voice - Translate AI.json" />
                        </div>
                        <h3 className="text-xl font-bold font-headline mb-2 text-gray-800">1. Speak Your Plan</h3>
                        <p className="text-gray-600 px-4">Just open the speech-to-plan dialog and describe your tasks naturally.</p>
                    </div>
                     <div className="text-center flex flex-col items-center">
                         <div className="w-full h-48 mb-4 flex items-center justify-center overflow-hidden">
                            <LottieAnimation path="/animations/Ai loading model.json" />
                        </div>
                        <h3 className="text-xl font-bold font-headline mb-2 text-gray-800">2. AI Does The Work</h3>
                        <p className="text-gray-600 px-4">Our intelligent engine parses, analyzes, and structures everything for you.</p>
                    </div>
                     <div className="text-center flex flex-col items-center">
                        <div className="w-full h-48 mb-4 flex items-center justify-center overflow-hidden">
                            <LottieAnimation path="/animations/workflow.json" />
                        </div>
                        <h3 className="text-xl font-bold font-headline mb-2 text-gray-800">3. Visualize Your Project</h3>
                        <p className="text-gray-600 px-4">Your plan is ready, complete with views like Mind Maps and Timelines.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-8">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900">Loved by Teams and Individuals Worldwide</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => {
                        const Icon = testimonial.icon;
                        return (
                            <Card key={index} className="bg-white shadow-lg">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center bg-gray-100">
                                            <Icon className={`w-7 h-7 ${testimonial.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{testimonial.name}</p>
                                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto text-center px-4 md:px-8">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-gray-900">Ready to Transform Your Productivity?</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">Stop juggling tools. Start organizing your work intelligently. Get started with TaskWise today, completely free.</p>
                <Link href="/dashboard">
                    <Button size="lg" className="text-lg py-6 px-8">
                        Start Planning Now <ArrowRight className="ml-2"/>
                    </Button>
                </Link>
            </div>
        </section>
      </div>
  );
}
