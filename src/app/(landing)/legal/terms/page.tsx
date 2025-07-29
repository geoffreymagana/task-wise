'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-8">Terms of Service</h1>
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Agreement to our Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-600">
            <p><strong>Last Updated:</strong> {currentDate}</p>
          
            <h2 className="text-xl font-bold pt-4">1. Acceptance of Terms</h2>
            <p>
                By using TaskWise (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>

            <h2 className="text-xl font-bold pt-4">2. Description of Service</h2>
            <p>
                TaskWise is a task management application that uses local storage and third-party AI services to provide its features. The Service is provided "as is" without warranties of any kind.
            </p>

            <h2 className="text-xl font-bold pt-4">3. User Conduct</h2>
            <p>
                You are responsible for your own data. Since all data is stored locally, you are responsible for backing it up and ensuring its security. You agree not to use the Service for any unlawful purpose.
            </p>
            
            <h2 className="text-xl font-bold pt-4">4. Limitation of Liability</h2>
            <p>
                In no event shall TaskWise or its developer be liable for any direct, indirect, incidental, special, or consequential damages, including but not limited to, damages for loss of data or other intangible losses, resulting from the use or the inability to use the service.
            </p>

            <h2 className="text-xl font-bold pt-4">5. Changes to Terms</h2>
            <p>
                We reserve the right to modify these terms at any time. Your continued use of the Service after any such changes constitutes your acceptance of the new terms.
            </p>

            <h2 className="text-xl font-bold pt-4">6. Contact Us</h2>
            <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:geoffreymagana21@gmail.com" className="text-primary hover:underline">geoffreymagana21@gmail.com</a>.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
