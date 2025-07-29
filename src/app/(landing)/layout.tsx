'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Menu } from 'lucide-react';
import './landing.css';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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

  const pathname = usePathname();

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white text-gray-800 font-body">
          <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <div className="container flex h-16 items-center px-4 md:px-8 mx-auto">
                  <div className="mr-4 flex-shrink-0">
                      <Link href="/" className="flex items-center gap-2">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-lg">
                              <defs>
                                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 0.8}} />
                                  <stop offset="100%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                                  </linearGradient>
                              </defs>
                              <path d="M8 7H19V9H8V7ZM8 11H19V13H8V11ZM8 15H19V17H8V15ZM5 7H6V9H5V7ZM5 11H6V13H5V11ZM5 15H6V17H5V15Z" fill="url(#grad1)"/>
                              <rect x="3" y="4" width="18" height="16" rx="2" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none"/>
                          </svg>
                          <h1 className="text-2xl font-bold font-headline">TaskWise</h1>
                      </Link>
                  </div>

                  <nav className="hidden md:flex flex-1 items-center justify-center space-x-6 text-sm font-medium">
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

                  <div className="flex flex-1 items-center justify-end md:hidden">
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

                  <div className="hidden md:flex items-center justify-end flex-shrink-0">
                    <Link href="/dashboard">
                        <Button>
                            Go to App
                            <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </Link>
                  </div>
              </div>
          </header>
          {children}
          <footer className="border-t bg-gray-50">
              <div className="container mx-auto py-12 px-4 md:px-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div>
                          <h4 className="font-semibold mb-2 font-headline">TaskWise</h4>
                          <p className="text-sm text-gray-500">The intelligent way to manage your tasks.</p>
                      </div>
                       <div>
                          <h4 className="font-semibold mb-2 font-headline">Product</h4>
                          <ul className="space-y-2 text-sm">
                              <li><Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</Link></li>
                              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
                              <li><Link href="/dashboard" className="text-gray-600 hover:text-gray-900">App</Link></li>
                          </ul>
                      </div>
                       <div>
                          <h4 className="font-semibold mb-2 font-headline">Legal</h4>
                          <ul className="space-y-2 text-sm">
                              <li><Link href="/legal/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
                              <li><Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                          </ul>
                      </div>
                       <div>
                          <h4 className="font-semibold mb-2 font-headline">Contact</h4>
                          <ul className="space-y-2 text-sm">
                               <li><a href="mailto:geoffreymagana21@gmail.com" className="text-gray-600 hover:text-gray-900">geoffreymagana21@gmail.com</a></li>
                               <li><a href="tel:0742663614" className="text-gray-600 hover:text-gray-900">0742 663 614</a></li>
                               <li><a href="https://github.com/geoffreymagana" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 flex items-center gap-1"><Github size={14}/> GitHub</a></li>
                          </ul>
                      </div>
                  </div>
                  <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500">
                      <p>&copy; {date} TaskWise. All rights reserved.</p>
                  </div>
              </div>
          </footer>
      </div>
    </>
  );
}
