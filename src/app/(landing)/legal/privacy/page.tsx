import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-8">Privacy Policy</h1>
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Your Data, Your Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-600">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          
            <h2 className="text-xl font-bold pt-4">1. Introduction</h2>
            <p>
                Welcome to TaskWise. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
            </p>

            <h2 className="text-xl font-bold pt-4">2. Information We Collect</h2>
            <p>
                TaskWise is designed to be privacy-first. All task data you create is stored locally in your browser's Local Storage. We do not transmit this data to our servers. The only information that leaves your device is the data sent to our AI provider (e.g., Google AI) for processing features like task parsing, and this data is not associated with your personal identity.
            </p>

            <h2 className="text-xl font-bold pt-4">3. How We Use Your Information</h2>
            <p>
                Since we do not store your personal task data on our servers, we do not use it for any purpose other than the direct functionality of the app on your own device. Data sent to AI models is used solely to provide the requested feature and is governed by the privacy policy of the AI provider.
            </p>
            
            <h2 className="text-xl font-bold pt-4">4. Data Security</h2>
            <p>
                Your task data is as secure as your own device. We rely on your browser's built-in security features to protect the information stored in Local Storage.
            </p>

            <h2 className="text-xl font-bold pt-4">5. Changes to This Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>

            <h2 className="text-xl font-bold pt-4">6. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:geoffreymagana21@gmail.com" className="text-primary hover:underline">geoffreymagana21@gmail.com</a>.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
