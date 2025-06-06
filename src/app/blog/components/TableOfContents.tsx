
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react'; // Assuming Twitter is used for X
import { useToast } from '@/hooks/use-toast';


export interface TocItem {
  id: string;
  level: number; 
  text: string;
}

interface TableOfContentsProps {
  tocItems: TocItem[];
  isLoading: boolean;
  activeHeadingId?: string | null;
  postTitle: string;
}

export function TableOfContents({ tocItems, isLoading, activeHeadingId, postTitle }: TableOfContentsProps) {
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
      <div className="space-y-3 animate-pulse">
        <div className="h-6 bg-muted rounded w-3/4 mb-3"></div> {/* TOC Title Skeleton */}
        <div className="ml-3 pl-3 border-l border-muted space-y-1.5"> {/* Items Skeleton */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${60 + i * 5}%` }}></div>
          ))}
        </div>
        <div className="h-5 bg-muted rounded w-1/2 mt-6 mb-1"></div> {/* Share Title Skeleton */}
        <div className="flex space-x-1.5"> {/* Share Icons Skeleton */}
            <div className="h-8 w-8 bg-muted rounded-md"></div>
            <div className="h-8 w-8 bg-muted rounded-md"></div>
            <div className="h-8 w-8 bg-muted rounded-md"></div>
            <div className="h-8 w-20 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!tocItems || tocItems.length === 0) {
    return (
        <div> 
            <h3 id="toc-heading" className="text-lg font-semibold text-foreground mb-3">
                Table of Contents
            </h3>
            <p className="text-sm text-muted-foreground">No subheadings found for this post.</p>
            {/* Share section can still be shown even if no TOC items */}
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
    );
  }

  return (
    <nav className="space-y-4 text-sm" aria-labelledby="toc-heading">
      <div> {/* Wrapper for TOC list */}
        <h3 id="toc-heading" className="text-lg font-semibold text-foreground mb-3">
          Table of Contents
        </h3>
        <ul className="space-y-1 border-l border-transparent relative ml-px"> {/* Removed border-gray-200 dark:border-gray-700 */}
          {tocItems.map((item) => {
            const isActive = item.id === activeHeadingId;
            return (
              <li key={item.id} className="relative">
                {/* Removed the span element that created the side bar */}
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "block py-1.5 pr-2 pl-4 text-sm transition-colors duration-150",
                    isActive 
                        ? "text-foreground underline underline-offset-4 decoration-primary decoration-2" 
                        : "text-muted-foreground hover:text-foreground/80",
                  )}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60">
        <h4 className="text-sm font-semibold text-foreground mb-2">Share this article</h4>
        <div className="flex items-center space-x-1.5">
          <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary h-8 w-8">
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
              <Facebook size={18} />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary h-8 w-8">
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(postTitle)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)">
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
    </nav>
  );
}

