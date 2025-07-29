import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

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
            <div>
              <Image 
                src="https://placehold.co/600x400.png"
                alt="Team working together"
                width={600}
                height={400}
                className="rounded-lg"
                data-ai-hint="team collaboration"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <h2 className="text-3xl font-bold font-headline mb-8">Meet the Founder</h2>
        <div className="flex flex-col items-center">
            <Image 
                src="https://placehold.co/150x150.png"
                alt="Geoffrey Magana"
                width={150}
                height={150}
                className="rounded-full mb-4"
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
