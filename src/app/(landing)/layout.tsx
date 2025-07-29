
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github, Menu, ListPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';


export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const [date, setDate] = useState('');
  useEffect(() => {
    setDate(new Date().getFullYear().toString());
  }, []);

  const navLinks = [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/help', label: 'Help Center' },
  ];

  return (
    <div className="flex flex-col min-h-screen font-body bg-white">
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center px-4 md:px-8 mx-auto">
            <div className="flex items-center gap-2 mr-auto">
                <Link href="/" className="flex items-center gap-2">
                    <ListPlus className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold font-headline text-gray-900">TaskWise</h1>
                </Link>
            </div>

            <nav className="hidden md:flex items-center justify-center space-x-6 text-sm font-medium">
                {navLinks.map(link => (
                    <Link 
                        key={link.href} 
                        href={link.href} 
                        className={cn(
                            "text-gray-600 hover:text-gray-900 transition-colors relative group",
                            pathname === link.href && "text-primary font-semibold"
                        )}
                    >
                        {link.label}
                        <span className={cn(
                            "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                            pathname === link.href ? "w-full" : "w-0"
                        )}></span>
                    </Link>
                ))}
            </nav>

            <div className="flex items-center justify-end ml-auto">
                 <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8">
                                {navLinks.map(link => (
                                    <Link key={link.href} href={link.href} className="text-lg font-medium">{link.label}</Link>
                                ))}
                                <Link href="/dashboard">
                                    <Button className="w-full mt-4">Go to App</Button>
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="hidden md:flex items-center justify-end">
                <Link href="/dashboard">
                    <Button>
                        Go to App
                    </Button>
                </Link>
                </div>
            </div>
        </div>
    </header>
    <main className="flex-grow">
      {children}
    </main>
    <footer className="bg-gray-50 text-gray-900">
        <div className="container mx-auto py-12 px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h4 className="font-semibold mb-2 font-headline">TaskWise</h4>
                    <p className="text-sm text-gray-500">The intelligent way to manage your tasks.</p>
                </div>
                  <div>
                    <h4 className="font-semibold mb-2 font-headline">Product</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 hover:underline">How It Works</Link></li>
                        <li><Link href="/about" className="text-gray-600 hover:text-gray-900 hover:underline">About</Link></li>
                        <li><Link href="/dashboard" className="text-gray-600 hover:text-gray-900 hover:underline">App</Link></li>
                    </ul>
                </div>
                  <div>
                    <h4 className="font-semibold mb-2 font-headline">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/legal/terms" className="text-gray-600 hover:text-gray-900 hover:underline">Terms of Service</Link></li>
                        <li><Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900 hover:underline">Privacy Policy</Link></li>
                    </ul>
                </div>
                  <div>
                    <h4 className="font-semibold mb-2 font-headline">Contact</h4>
                    <ul className="space-y-2 text-sm">
                          <li><a href="mailto:geoffreymagana21@gmail.com" className="text-gray-600 hover:text-gray-900 hover:underline">geoffreymagana21@gmail.com</a></li>
                          <li><a href="tel:0742663614" className="text-gray-600 hover:text-gray-900 hover:underline">0742 663 614</a></li>
                          <li><a href="https://github.com/geoffreymagana" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 hover:underline flex items-center gap-1"><Github size={14}/> GitHub</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>&copy; {date} TaskWise. All rights reserved.</p>
            </div>
        </div>
    </footer>
  </div>
  );
}
