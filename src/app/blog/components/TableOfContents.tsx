
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export interface TocItem {
  id: string;
  level: number;
  text: string;
}

interface TableOfContentsProps {
  tocItems: TocItem[];
  isLoading: boolean;
  scrollPercentage: number;
  activeHeadingId?: string | null;
  postTitle: string;
}

export function TableOfContents({ tocItems, isLoading, scrollPercentage, activeHeadingId, postTitle }: TableOfContentsProps) {
  const { toast } = useToast();
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = () => {
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl)
        .then(() => toast({ title: 'Link Copied!', description: 'Article link copied to clipboard.' }))
        .catch(err => toast({ title: 'Failed to Copy', description: 'Could not copy link.', variant: 'destructive' }));
    }
  };

  if (isLoading) {
    return (
      <div className="relative pl-3 space-y-3 animate-pulse"> {/* Adjusted pl for progress bar space */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted rounded-full"></div> {/* Overall Progress Bar Track */}
        <div className="h-6 bg-muted rounded w-3/4 mb-3"></div> {/* TOC Title Skeleton */}
        <div className="space-y-1.5"> {/* TOC Items Skeleton */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${60 + i * 5}%`, marginLeft: `${i * 0.25}rem` }}></div>
          ))}
        </div>
        <div className="h-5 bg-muted rounded w-1/2 mt-4 mb-1"></div> {/* Share Title Skeleton */}
        <div className="flex space-x-2"> {/* Share Icons Skeleton */}
            <div className="h-5 w-5 bg-muted rounded-full"></div>
            <div className="h-5 w-5 bg-muted rounded-full"></div>
            <div className="h-5 w-5 bg-muted rounded-full"></div>
            <div className="h-5 w-20 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!tocItems || tocItems.length === 0) {
    return (
        <div className="pl-3"> {/* Adjusted pl */}
            <h3 id="toc-heading" className="text-lg font-semibold text-foreground mb-3">
                Table of Contents
            </h3>
            <p className="text-sm text-muted-foreground">No headings found for this post.</p>
        </div>
    );
  }

  return (
    <nav className="space-y-4 text-sm relative" aria-labelledby="toc-heading">
      {/* Overall Article Progress Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted rounded-full overflow-hidden">
        <div
          className="bg-primary transition-height duration-100 ease-linear"
          style={{ height: `${scrollPercentage}%` }}
          aria-hidden="true"
        />
      </div>

      {/* TOC Content (indented from overall progress bar) */}
      <div className="ml-3"> {/* Indent all TOC content */}
        <h3 id="toc-heading" className="text-lg font-semibold text-foreground mb-3">
          Table of Contents
        </h3>
        <ul className="space-y-1">
          {tocItems.map((item) => {
            const isActive = item.id === activeHeadingId;
            return (
              <li key={item.id} className="relative">
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "block py-1.5 pr-2 text-sm transition-colors duration-150",
                    "hover:text-primary",
                    isActive ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground/80",
                    item.level === 1 && 'pl-2', // Base padding for level 1
                    item.level === 2 && 'pl-5', // Indent level 2
                    item.level === 3 && 'pl-8', // Indent level 3
                    item.level >= 4 && 'pl-10 text-xs' // Indent level 4+
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-sm" aria-hidden="true"></span>
                  )}
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-4 border-t border-border/60">
          <h4 className="text-sm font-semibold text-foreground mb-2">Share this article</h4>
          <div className="flex items-center space-x-1.5">
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary h-8 w-8">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                <Facebook size={18} />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary h-8 w-8">
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(postTitle)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                <Twitter size={18} />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary h-8 w-8">
              <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(postTitle)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                <Linkedin size={18} />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary h-8 px-2 text-xs"
              onClick={handleCopyLink}
              disabled={!currentUrl}
            >
              <LinkIcon className="mr-1.5 h-3.5 w-3.5" /> Copy link
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

