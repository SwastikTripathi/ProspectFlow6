
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/Logo';
import { Around } from "@theme-toggles/react";
import "@theme-toggles/react/css/Around.css";
import { cn } from '@/lib/utils';
import { ArrowRight, Users, Zap, Focus, ShieldCheck, TrendingUp, HeartHandshake, Facebook, Twitter, Youtube, Linkedin, Globe } from 'lucide-react';

const valuesData = [
  {
    icon: <Focus className="h-10 w-10 text-primary mb-4" />,
    title: 'Simplicity & Focus',
    description: "We build tools that are intuitive, easy to learn, and a joy to use, allowing you to concentrate on what's important: making connections.",
    dataAiHint: "zen minimalist"
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-primary mb-4" />,
    title: 'Empowerment',
    description: 'We equip you with powerful features to take control of your outreach, track your progress, and achieve your goals effectively.',
    dataAiHint: "growth chart"
  },
  {
    icon: <Users className="h-10 w-10 text-primary mb-4" />,
    title: 'Meaningful Connections',
    description: 'We believe in the power of genuine relationships and design ProspectFlow to help you nurture and expand your professional network.',
    dataAiHint: "people networking"
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary mb-4" />,
    title: 'Integrity & Trust',
    description: 'We are committed to transparency, data security, and building a product that you can rely on every step of your journey.',
    dataAiHint: "security shield"
  },
];

const footerLinks = {
    product: [
      { name: 'Overview', href: '#' }, { name: 'Communication', href: '#' }, { name: 'Automation', href: '#' }, { name: 'Integrations', href: '#' },
      { name: 'Reporting', href: '#' }, { name: 'SMS', href: '#' }, { name: 'Calling', href: '#' }, { name: 'Security', href: '#' },
    ],
    pricing: [
      { name: 'Pricing', href: '/pricing' }, { name: 'Close vs Other CRMs', href: '#' }, { name: 'Close for Startups', href: '#' },
      { name: 'Customer Stories', href: '#' }, { name: 'Inbound Sales', href: '#' }, { name: 'Outbound Sales', href: '#' },
    ],
    resources: [
      { name: 'Blog', href: '/blog' }, { name: 'Ebooks + Templates', href: '#' }, { name: 'Guides', href: '#' }, { name: 'See a demo video', href: '#' },
      { name: 'Office Hours', href: '#' }, { name: 'Sales Tools', href: '#' },
    ],
    company: [
      { name: 'About', href: '/about' }, { name: 'Careers', href: '#' }, { name: 'Partner with Close', href: '#' }, { name: 'Brand Guidelines', href: '#' },
      { name: 'Terms', href: '#' }, { name: 'Privacy', href: '#' }, { name: 'GDPR', href: '#' }, { name: 'CCPA', href: '#' },
    ],
    getHelp: [
      { name: '+1-833-GO-CLOSE', href: 'tel:+18334625673' }, { name: 'Help Center', href: '#' }, { name: 'API Documentation', href: '#' },
      { name: 'Download the Close App', href: '#' }, { name: 'Product Updates', href: '#' }, { name: '2025 Product Roadmap', href: '#' },
      { name: 'System Status', href: '#' },
    ],
};


export default function AboutPage() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-[5vw] md:px-[10vw]">
          <Link href="/landing" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full text-primary font-semibold">
              <Link href="/about">About</Link>
            </Button>
            <Around
              toggled={theme === 'dark'}
              onClick={toggleTheme}
              title="Toggle theme"
              aria-label="Toggle theme"
              className={cn(
                "theme-toggle text-foreground/70 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "h-7 w-7 p-0.5"
              )}
              style={{ '--theme-toggle__around--duration': '500ms' } as React.CSSProperties}
            />
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild className="shadow-md rounded-full">
              <Link href="/auth?action=signup">Try for free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-background text-center">
          <div className="container mx-auto px-[5vw] md:px-[10vw]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6 font-headline text-foreground">
              Connecting Ambition with <span className="text-primary">Opportunity</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-md sm:text-lg md:text-xl text-muted-foreground mb-10">
              At ProspectFlow, we believe in the power of meaningful connections. Discover our story, our mission, and the values that drive us to help you succeed in your professional outreach.
            </p>
            <Image
              src="https://placehold.co/1200x500.png"
              alt="Diverse team collaborating"
              width={1200}
              height={500}
              className="rounded-xl shadow-2xl mx-auto object-cover"
              data-ai-hint="team collaboration"
              priority
            />
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-[5vw] md:px-[10vw]">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-headline text-foreground">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    ProspectFlow was born from a simple observation: the world of professional outreach – whether for job hunting, sales, or networking – was often fragmented, overwhelming, and inefficient. We saw brilliant individuals missing out on opportunities simply because they lacked the right tools to manage their connections and follow-ups effectively.
                  </p>
                  <p>
                    Driven by a passion for technology and a belief in human potential, we set out to create a solution. A platform that wasn't just another CRM, but a dedicated companion for anyone proactively building their future. We envisioned a tool that would be powerful yet intuitive, sophisticated yet simple, helping users cut through the noise and focus on what truly matters: forging genuine connections.
                  </p>
                  <p>
                    After months of research, design, and development, ProspectFlow came to life – a testament to our commitment to empowering individuals to achieve their ambitious goals.
                  </p>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-xl shadow-xl overflow-hidden">
                <Image
                  src="https://placehold.co/600x450.png"
                  alt="Founders brainstorming or early product sketch"
                  width={600}
                  height={450}
                  className="object-cover w-full h-full"
                  data-ai-hint="brainstorming session"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-[5vw] md:px-[10vw] text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 font-headline text-foreground">
              Our Mission & Vision
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="text-left p-6 border border-border rounded-lg shadow-lg bg-card">
                <Zap className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-3 font-headline text-foreground">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide professionals with the most efficient, intuitive, and empowering tools to manage their outreach, build strong networks, and achieve their career and business goals.
                </p>
              </div>
              <div className="text-left p-6 border border-border rounded-lg shadow-lg bg-card">
                <HeartHandshake className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-3 font-headline text-foreground">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading platform individuals turn to worldwide for maximizing their professional potential through effective, organized, and genuine outreach.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-[5vw] md:px-[10vw]">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-headline text-foreground">
              The Values That Guide Us
            </h2>
            <p className="text-center text-muted-foreground mb-12 md:mb-16 max-w-2xl mx-auto">
              These principles are at the heart of everything we do at ProspectFlow, from product development to customer support.
            </p>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {valuesData.map((value) => (
                <Card key={value.title} className="text-center shadow-lg hover:shadow-xl transition-shadow bg-card">
                  <CardHeader className="items-center pb-3">
                    {React.cloneElement(value.icon)}
                    <CardTitle className="font-headline text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 text-center bg-primary/90 text-primary-foreground">
          <div className="container mx-auto px-[5vw] md:px-[10vw]">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 font-headline">
              Ready to Transform Your Outreach?
            </h2>
            <p className="max-w-xl mx-auto text-md sm:text-lg mb-10 opacity-90">
              Join thousands of professionals who are streamlining their connections and achieving their goals with ProspectFlow.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl bg-background text-primary hover:bg-background/90 font-semibold rounded-full"
              asChild
            >
              <Link href="/auth?action=signup">Get Started for Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-[5vw] md:px-[10vw] py-12 md:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Product</h5>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Pricing & Use Cases</h5>
              <ul className="space-y-2">
                {footerLinks.pricing.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Resources</h5>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Company</h5>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Get Help</h5>
              <ul className="space-y-2">
                {footerLinks.getHelp.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
              <div className="mt-4">
                 <Button variant="outline" className="w-full justify-between bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-slate-50">
                    <span>Language</span>
                    <Globe className="h-4 w-4 opacity-50" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo />
            </div>
            <div className="text-sm text-slate-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ProspectFlow Inc. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-primary transition-colors"><Twitter size={20} /></a>
              <a href="#" aria-label="YouTube" className="text-slate-400 hover:text-primary transition-colors"><Youtube size={20} /></a>
              <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-primary transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
