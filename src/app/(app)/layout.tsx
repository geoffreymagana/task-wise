
'use client';

import { ThemeProvider } from '@/components/common/theme-provider';
import AppHeader from '@/components/common/header';
import type { Task } from '@/lib/types';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const handleTaskCreated = (newTask: Task) => {};
  const handleTasksImported = (newTasks: Task[]) => {};

  return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AppHeader onTaskCreated={handleTaskCreated} onTasksImported={handleTasksImported} allTasks={[]} />
        <main className="app-container">{children}</main>
      </ThemeProvider>
  );
}
