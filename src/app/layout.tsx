'use client';

import '@/app/globals.css';
import { Toaster } from "@/components/ui/toaster"
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>TaskWise</title>
        <meta name="description" content="Intelligent Task Management" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
        <Script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js" type="module" strategy="beforeInteractive"></Script>
      </head>
      <body className="app-body">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
