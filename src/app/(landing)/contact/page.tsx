import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Github } from 'lucide-react';

export default function ContactPage() {
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
                        <p className="group-hover:text-gray-900">geoffreymagana21@gmail.com</p>
                    </div>
                </a>
                <a href="tel:0742663614" className="flex items-center gap-4 group">
                    <Phone className="w-6 h-6 text-primary" />
                     <div>
                        <p className="font-semibold text-gray-800">Phone</p>
                        <p className="group-hover:text-gray-900">0742 663 614</p>
                    </div>
                </a>
                 <a href="https://github.com/geoffreymagana" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <Github className="w-6 h-6 text-primary" />
                     <div>
                        <p className="font-semibold text-gray-800">GitHub</p>
                        <p className="group-hover:text-gray-900">Follow our progress</p>
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
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First Name</Label>
                                <Input id="first-name" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last Name</Label>
                                <Input id="last-name" placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john.doe@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Your message..." />
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
