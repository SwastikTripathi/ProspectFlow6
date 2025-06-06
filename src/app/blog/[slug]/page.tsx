
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Tables } from '@/lib/database.types';
import { format, parseISO } from 'date-fns';
import { Loader2, Tag, Facebook, Twitter, Linkedin, Link as LinkIcon, Globe, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Article from '../components/Article';
import { TableOfContents, type TocItem } from '../components/TableOfContents';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Around } from "@theme-toggles/react";
import "@theme-toggles/react/css/Around.css";
import { Progress } from '@/components/ui/progress';


const NAVBAR_HEIGHT_OFFSET = 80;

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


export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { toast } = useToast();

  const [post, setPost] = useState<Tables<'posts'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const headingElementsRef = useRef<HTMLElement[]>([]);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleThemeHandler = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setError("No post slug provided.");
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (dbError) {
          if (dbError.code === 'PGRST116') { // Not found
            notFound();
            return;
          }
          throw dbError;
        }
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch post.');
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (!post || !mainContentRef.current) {
      setTocItems([]);
      return;
    }

    const headings = Array.from(
      mainContentRef.current.querySelectorAll('h1, h2') // Only H1 and H2 for TOC
    ) as HTMLElement[];

    headingElementsRef.current = headings;

    const newTocItems = headings.map((heading, index) => {
      const text = heading.textContent || '';
      const level = parseInt(heading.tagName.substring(1), 10);
      let id = heading.id;
      if (!id) {
        id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        heading.id = id;
      }
      return { id, level, text };
    });
    setTocItems(newTocItems);
  }, [post]);


  const handleScroll = useCallback(() => {
    if (!headingElementsRef.current.length || !tocItems.length || !mainContentRef.current) return;

    let currentActiveIndex = -1;
    for (let i = headingElementsRef.current.length - 1; i >= 0; i--) {
      const heading = headingElementsRef.current[i];
      const rect = heading.getBoundingClientRect();
      if (rect.top < NAVBAR_HEIGHT_OFFSET + 20) { 
        currentActiveIndex = i;
        break;
      }
    }
    
    const newActiveId = currentActiveIndex !== -1 ? headingElementsRef.current[currentActiveIndex].id : null;
    setActiveHeadingId(newActiveId);
    
    let percentage = 0;
    if (currentActiveIndex !== -1 && tocItems.length > 0) {
      percentage = ((currentActiveIndex + 1) / tocItems.length) * 100;
    }
    
    if (mainContentRef.current && (window.innerHeight + window.scrollY) >= (mainContentRef.current.offsetTop + mainContentRef.current.offsetHeight - 30) ) {
      percentage = 100;
    }

    setScrollPercentage(Math.min(100, Math.max(0, percentage)));

  }, [tocItems.length]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll(); 
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-[5vw] md:px-[10vw]">
            <Link href="/landing" className="mr-6 flex items-center space-x-2"><Logo /></Link>
         </div>
        </header>
        <main className="flex-1 py-12 md:py-16 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-[5vw] md:px-[10vw]">
           <Link href="/landing" className="mr-6 flex items-center space-x-2"><Logo /></Link>
         </div>
        </header>
        <main className="flex-1 py-12 md:py-16 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
        </main>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-[5vw] md:px-[10vw]">
          <Link href="/landing" className="mr-6 flex items-center space-x-2"><Logo /></Link>
         </div>
        </header>
        <main className="flex-1 py-12 md:py-16 text-center">
          <p className="text-muted-foreground">Post not found.</p>
          <Link href="/blog"><Button variant="link">Back to Blog</Button></Link>
        </main>
      </div>
    );
  }

  const displayDate = post.published_at ? format(parseISO(post.published_at), 'MMMM d, yyyy') : 'Date unavailable';
  const authorName = post.author_name_cache || 'ProspectFlow Team';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-[5vw] md:px-[10vw]">
          <Link href="/landing" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full text-primary font-semibold">
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/about">About</Link>
            </Button>
            <Around
              toggled={theme === 'dark'}
              onClick={toggleThemeHandler}
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

      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-[5vw] md:px-[8vw] lg:px-[10vw] max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 lg:gap-x-12 xl:gap-x-16">
            {/* Left Column: Article Content */}
            <div className="lg:col-span-8 order-2 lg:order-1">
              <div className="mb-4">
                <p className="font-semibold text-foreground">{authorName}</p>
                <p className="text-sm text-muted-foreground">{displayDate}</p>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-bold tracking-tight mb-3 text-gray-900 dark:text-gray-100 leading-tight">
                {post.title}
              </h1>

              <div className="mb-8">
                <Link href="#" className="text-sm text-sky-600 dark:text-sky-500 hover:underline flex items-center">
                  <Tag className="h-4 w-4 mr-1.5" />
                  Close Features and News
                </Link>
              </div>
              
              <div ref={mainContentRef}>
                <Article content={post.content} />
              </div>
              
              {/* CTA and Author Bio */}
              <div className="mt-12 pt-8">
                 <div className="text-center mb-12">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 px-6 rounded-lg shadow-md" asChild>
                        <Link href="/pricing">START YOUR FREE 14-DAY TRIAL <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                 </div>

                 <hr className="border-black/10 dark:border-white/10" />

                 <div className="mt-8 py-4">
                    <p className="text-sm text-muted-foreground mb-1">Article written by</p>
                    <h3 className="text-xl font-bold text-foreground mb-2">Kaleigh Moore</h3>
                    <p className="text-base text-muted-foreground leading-relaxed mb-4">
                        Freelance writer for eCommerce & SaaS companies. I write blogs and articles for eCommerce platforms & the SaaS tools that integrate with them.
                    </p>
                    <a href="https://twitter.com/example" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <Twitter size={20} />
                    </a>
                 </div>
              </div>

            </div>

            {/* Right Column: Sticky Sidebar (Image, TOC, Share) */}
            <div className="lg:col-span-4 order-1 lg:order-2 mb-10 lg:mb-0">
              <div className="sticky top-24 space-y-6">
                {post.cover_image_url && (
                  <div className="aspect-[16/10] relative rounded-xl overflow-hidden shadow-lg border border-border/20">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title || 'Blog post cover image'}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                      priority
                      data-ai-hint="woman stress laptop" 
                    />
                  </div>
                )}
                {!post.cover_image_url && (
                   <div className="aspect-[16/10] relative rounded-xl overflow-hidden shadow-lg border border-border/20 bg-muted flex items-center justify-center">
                      <Image
                        src="https://placehold.co/600x375.png" 
                        alt="Placeholder image"
                        width={600}
                        height={375}
                        className="object-cover"
                        data-ai-hint="woman stress laptop"
                      />
                   </div>
                )}
                
                <TableOfContents
                  tocItems={tocItems}
                  isLoading={isLoading}
                  scrollPercentage={scrollPercentage}
                  activeHeadingId={activeHeadingId}
                  postTitle={post.title}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-300 mt-auto">
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
              <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-primary transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
    
