
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill out the email and message fields.',
      });
      return;
    }

    const subject = `Message from ${formData.firstName} ${formData.lastName}`;
    const body = `From: ${formData.firstName} ${formData.lastName} <${formData.email}>\n\n${formData.message}`;
    const mailtoLink = `mailto:geoffreymagana21@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-4">Contact Us</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
        Have questions, feedback, or need support? We'd love to hear from you.
      </p>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
        <div className="space-y-8">
            <h2 className="text-2xl font-bold font-headline mb-4">Get in Touch</h2>
            <div className="space-y-6 text-gray-600">
                <a href="mailto:geoffreymagana21@gmail.com" className="flex items-center gap-4 group">
                    <Mail className="w-6 h-6 text-primary" />
                    <div>
                        <p className="font-semibold text-gray-800">Email</p>
                        <p className="group-hover:text-gray-900 hover:underline">geoffreymagana21@gmail.com</p>
                    </div>
                </a>
                <a href="tel:0742663614" className="flex items-center gap-4 group">
                    <Phone className="w-6 h-6 text-primary" />
                     <div>
                        <p className="font-semibold text-gray-800">Phone</p>
                        <p className="group-hover:text-gray-900 hover:underline">0742 663 614</p>
                    </div>
                </a>
                 <a href="https://github.com/geoffreymagana" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <Github className="w-6 h-6 text-primary" />
                     <div>
                        <p className="font-semibold text-gray-800">GitHub</p>
                        <p className="group-hover:text-gray-900 hover:underline">Follow our progress</p>
                    </div>
                </a>
            </div>
        </div>
        <div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Send a Message</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" placeholder="Your message..." value={formData.message} onChange={handleChange} required />
                        </div>
                        <Button type="submit" className="w-full">Submit</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
