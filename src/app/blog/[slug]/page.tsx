
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Tables } from '@/lib/database.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CalendarDays, UserCircle as UserIcon, Edit3, Trash2, ArrowRight, Facebook, Twitter, Youtube, Linkedin, Globe as FooterGlobeIcon } from 'lucide-react'; // Added Youtube here
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/icons/Logo';
import { Around } from "@theme-toggles/react";
import "@theme-toggles/react/css/Around.css";
import { cn, slugify } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import { OWNER_EMAIL } from '@/lib/config';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { TableOfContents, type TocItem } from '../components/TableOfContents';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type PostWithAuthor = Tables<'posts'>;

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
  const router = useRouter();
  const { toast } = useToast();

  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const articleContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user && user.email === OWNER_EMAIL) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user ?? null;
        setCurrentUser(user);
        if (user && user.email === OWNER_EMAIL) {
            setIsOwner(true);
        } else {
            setIsOwner(false);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    if (!slug) {
      setError('No slug provided.');
      setIsLoading(false);
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
          .eq('status', 'published')
          .single();

        if (dbError) {
          if (dbError.code === 'PGRST116') {
            notFound();
          }
          throw dbError;
        }
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch post.');
        console.error(`Error fetching post with slug "${slug}":`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post?.content) {
      const newTocItems: TocItem[] = [];
      const headingRegex = /^(#{1,4})\s+(.*)/gm;
      let match;
      const tempContent = post.content.replace(/```[\s\S]*?```/g, '');

      while ((match = headingRegex.exec(tempContent)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = slugify(text);
        if (text) {
            newTocItems.push({ id, level, text });
        }
      }
      setTocItems(newTocItems);
    } else {
      setTocItems([]);
    }
  }, [post?.content]);

  useEffect(() => {
    const articleElement = articleContentRef.current;
    if (!articleElement) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const articleTop = articleElement.offsetTop;
      const articleHeight = articleElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      
      let scrolledPastArticleStart = Math.max(0, scrollTop - articleTop);
      
      let scrollableDistanceInArticle = articleHeight - viewportHeight;
      if (scrollableDistanceInArticle <=0) { 
        setScrollPercentage(scrollTop > articleTop ? 100: 0); 
        return;
      }

      let percentage = (scrolledPastArticleStart / scrollableDistanceInArticle) * 100;
      percentage = Math.min(100, Math.max(0, percentage));
      setScrollPercentage(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    window.addEventListener('resize', handleScroll, { passive: true });


    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [post?.content, isLoading]); 


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

  const handleDeletePost = async () => {
    if (!post || !isOwner) {
      toast({ title: 'Error', description: 'Cannot delete post.', variant: 'destructive' });
      return;
    }
    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (deleteError) throw deleteError;

      toast({ title: 'Post Deleted', description: `"${post.title}" has been successfully deleted.` });
      router.push('/blog');
    } catch (error: any) {
      toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const headingRenderer = (level: number) => ({ node, children, ...props }: any) => {
    const textContent = React.Children.toArray(children).reduce((acc: string, child: any) => {
        if (typeof child === 'string') return acc + child;
        if (child.props && child.props.children) return acc + React.Children.toArray(child.props.children).join('');
        return acc;
    }, '');
    const id = slugify(textContent);
    return React.createElement(`h${level}`, { id, ...props }, children);
  };

  const markdownComponents = {
    h1: headingRenderer(1),
    h2: headingRenderer(2),
    h3: headingRenderer(3),
    h4: headingRenderer(4),
    h5: headingRenderer(5),
    h6: headingRenderer(6),
  };

  if (isLoading && !post) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow text-center text-destructive py-20">
          <p>Error: {error}</p>
          <Link href="/blog" passHref>
            <Button className="mt-4">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
         <div className="flex flex-col min-h-screen">
            <div className="flex-grow text-center text-muted-foreground py-20">
            <p>Post not found.</p>
            <Link href="/blog" passHref>
                <Button className="mt-4">Back to Blog</Button>
            </Link>
            </div>
        </div>
    );
  }

  const displayDate = post.published_at ? format(parseISO(post.published_at), 'PPP') : format(parseISO(post.created_at), 'PPP');

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
            <Button variant="ghost" asChild className="rounded-full text-primary font-semibold">
              <Link href="/blog">Blog</Link>
            </Button>
             <Button variant="ghost" asChild className="rounded-full">
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

      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-[5vw] md:px-[10vw] max-w-6xl">
            <div className="mb-8 flex justify-between items-center">
                <Button variant="outline" asChild className="group">
                <Link href="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Blog
                </Link>
                </Button>
                {isOwner && (
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                    <Link href={`/blog/edit/${post.slug}`}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </Link>
                    </Button>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post "{post.title}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePost} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm Delete
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </div>
                )}
            </div>

            <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-10 xl:gap-16">
                <div className="min-w-0 order-first"> {/* Changed order */}
                    <article>
                        <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 font-headline text-foreground">
                            {post.title}
                        </h1>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                            <UserIcon className="mr-1.5 h-4 w-4" />
                            <span>{post.author_name_cache || 'ProspectFlow Team'}</span>
                            </div>
                            <div className="flex items-center">
                            <CalendarDays className="mr-1.5 h-4 w-4" />
                            <span>{displayDate}</span>
                            </div>
                        </div>
                        </header>

                        {post.cover_image_url && (
                        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-lg mb-8">
                            <Image
                            src={post.cover_image_url}
                            alt={post.title || 'Blog post cover image'}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            priority
                            data-ai-hint="article content visual"
                            />
                        </div>
                        )}

                        <div 
                          ref={articleContentRef} 
                          className="prose prose-lg dark:prose-invert prose-headings:font-headline prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-code:bg-muted prose-code:text-foreground prose-code:p-1 prose-code:rounded-sm prose-code:font-code"
                        >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {post.content}
                        </ReactMarkdown>
                        </div>
                    </article>

                    <section className="mt-4 py-6">
                        <div className="flex justify-center">
                        <Button size="lg" asChild className="shadow-md rounded-full">
                            <Link href="/auth?action=signup">
                            START YOUR FREE 14-DAY TRIAL <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        </div>
                    </section>

                    <section className="mt-10 py-8 border-t border-border">
                        <div className="flex items-start gap-6">
                        <Avatar className="h-20 w-20 flex-shrink-0">
                            <AvatarImage src="https://placehold.co/80x80.png" alt={post.author_name_cache || "Author"} data-ai-hint="professional portrait" />
                            <AvatarFallback>{post.author_name_cache ? post.author_name_cache.substring(0,2).toUpperCase() : "AU"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Article written by</p>
                            <h4 className="text-xl font-bold font-headline text-foreground mb-2">{post.author_name_cache || 'ProspectFlow Team'}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                            {post.author_name_cache === 'Swastik Tripathi'
                             ? "Founder of ProspectFlow. Passionate about helping professionals connect and achieve their goals through streamlined outreach and productivity tools."
                             : "A valued contributor to the ProspectFlow blog, sharing insights on professional development and outreach strategies."
                            }
                            </p>
                        </div>
                        </div>
                    </section>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-12rem)] overflow-y-auto pl-4 border-l border-border/60 py-2 order-last"> {/* Changed order */}
                    <TableOfContents tocItems={tocItems} isLoading={isLoading} scrollPercentage={scrollPercentage} postTitle={post.title || ''} />
                </aside>
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
                    <FooterGlobeIcon className="h-4 w-4 opacity-50" />
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

