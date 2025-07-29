
'use client';

import '@/app/globals.css';
import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/common/theme-provider';
import AppHeader from '@/components/common/header';
import type { Task } from '@/lib/types';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');

  const handleTaskCreated = (newTask: Task) => {};
  const handleTasksImported = (newTasks: Task[]) => {};

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>TaskWise</title>
        <meta name="description" content="Intelligent Task Management" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body>
          {isAppPage ? (
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col h-screen">
                <AppHeader onTaskCreated={handleTaskCreated} onTasksImported={handleTasksImported} allTasks={[]} />
                <main className="flex-grow overflow-y-auto">{children}</main>
              </div>
              <Toaster />
            </ThemeProvider>
          ) : (
            <>
              {children}
            </>
          )}
      </body>
    </html>
  );
}
