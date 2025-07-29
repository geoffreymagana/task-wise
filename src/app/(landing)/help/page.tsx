import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Mail } from 'lucide-react';

export default function HelpCenterPage() {
    const faqs = [
        {
            question: "Is TaskWise free to use?",
            answer: "Yes, TaskWise is completely free to use. All core features are available without any cost."
        },
        {
            question: "Where is my data stored?",
            answer: "Your task data is stored securely in your browser's local storage. It never leaves your device and is not stored on our servers, ensuring your privacy."
        },
        {
            question: "Which browsers are supported?",
            answer: "TaskWise is supported on all modern web browsers, including Chrome, Firefox, Safari, and Edge. For the best experience and full feature support (like Speech-to-Plan), we recommend using the latest version of Google Chrome."
        },
        {
            question: "How does the AI task parsing work?",
            answer: "When you speak your plan or paste text, we send that information to a third-party AI model (like Google's Gemini). The AI analyzes the text to identify tasks, dates, and relationships, and returns a structured format that we use to populate your board. The text is not stored or linked to your identity."
        },
        {
            question: "Can I use TaskWise offline?",
            answer: "Yes, since your data is stored locally, you can access, view, and manage your tasks even without an internet connection. AI-powered features will require an active connection."
        }
    ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-4">Help Center</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
        Find answers to common questions and learn how to get the most out of TaskWise.
      </p>

      <Card className="max-w-4xl mx-auto shadow-lg mb-12">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      <Card className="max-w-4xl mx-auto shadow-lg bg-gray-50">
        <CardHeader>
            <div className="flex items-center gap-4">
                 <LifeBuoy className="w-8 h-8 text-primary" />
                <CardTitle>Still Need Help?</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-gray-600">
                If you can't find the answer you're looking for, please don't hesitate to reach out to our support team. We're here to help you succeed.
            </p>
            <a href="mailto:geoffreymagana21@gmail.com" className="flex items-center gap-2 mt-4 text-primary font-semibold hover:underline">
                <Mail className="w-5 h-5" />
                Contact Support
            </a>
        </CardContent>
      </Card>
    </div>
  );
}
