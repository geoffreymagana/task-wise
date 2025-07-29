'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

// Define a type for the custom element to satisfy TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { src: string; style: object, speed: string, autoplay: boolean, loop: boolean }, HTMLElement>;
    }
  }
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-8">About TaskWise</h1>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-16">
        We believe that productivity tools should be intelligent, intuitive, and beautiful. TaskWise was born from the idea that managing your tasks shouldn't be a task in itself.
      </p>

      <Card className="mb-16 shadow-lg">
        <CardContent className="p-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-headline mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                Our mission is to empower individuals and teams to achieve their goals by turning scattered thoughts and complex plans into clear, actionable steps. We leverage the power of artificial intelligence to automate the tedious parts of task management, so you can focus on what truly matters: doing your best work.
              </p>
              <p className="text-gray-600">
                We're committed to building a product that not only works flawlessly but also inspires creativity and clarity.
              </p>
            </div>
            <div className="flex items-center justify-center">
                <dotlottie-wc 
                    src="https://lottie.host/26ada3b3-bc39-4ae1-8824-a590926742ad/umm2HcD5ec.lottie" 
                    style={{width: '300px', height: '300px'}}
                    speed="1"
                    autoplay
                    loop
                >
                </dotlottie-wc>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <h2 className="text-3xl font-bold font-headline mb-8">Meet the Founder</h2>
        <div className="flex flex-col items-center">
            <Image 
                src="https://res.cloudinary.com/dwqwwb2fh/image/upload/v1753797497/o1nsqcul2lknhj0h8o8d.jpg"
                alt="Geoffrey Magana"
                width={150}
                height={150}
                className="rounded-full mb-4 object-cover"
                data-ai-hint="person portrait"
            />
            <h3 className="text-2xl font-bold">Geoffrey Magana</h3>
            <p className="text-gray-500 mb-2">Lead Developer & Visionary</p>
            <p className="max-w-xl text-gray-600">
                "I created TaskWise to solve a problem I faced every day: the gap between planning and doing. I wanted a tool that was smart enough to understand my unstructured ideas and powerful enough to visualize them in meaningful ways. This project is a culmination of that vision."
            </p>
        </div>
      </div>
    </div>
  );
}
