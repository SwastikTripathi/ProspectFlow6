
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
  postTitle: string;
}

export function TableOfContents({ tocItems, isLoading, scrollPercentage, postTitle }: TableOfContentsProps) {
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
      <div className="relative pl-3 space-y-3 animate-pulse">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted rounded-full"></div>
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${60 + i * 10}%`, marginLeft: `${i * 0.5}rem` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!tocItems || tocItems.length === 0) {
    return <p className="text-sm text-muted-foreground">No table of contents for this post.</p>;
  }

  return (
    <nav className="space-y-2 text-sm relative" aria-labelledby="toc-heading">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted rounded-full overflow-hidden">
        <div
          className="bg-primary transition-height duration-100 ease-linear"
          style={{ height: `${scrollPercentage}%` }}
        />
      </div>
      <div className="ml-3"> {/* Offset content to not overlap with progress bar */}
        <h3 id="toc-heading" className="font-semibold text-lg mb-3 text-foreground">On this page</h3>
        <ul className="space-y-1">
          {tocItems.map((item) => (
            <li key={item.id} className={cn(
              item.level === 1 && 'font-medium',
              item.level === 2 && 'ml-3',
              item.level === 3 && 'ml-6 text-xs',
              item.level >= 4 && 'ml-8 text-xs opacity-80'
            )}>
              <a
                href={`#${item.id}`}
                className="text-muted-foreground hover:text-primary transition-colors block py-1 hover:underline"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-4 border-t border-border/60">
          <h4 className="text-sm font-semibold text-foreground mb-2">Share this article</h4>
          <div className="flex items-center space-x-1">
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-accent/10" aria-label="Share on Facebook">
              <Facebook size={18} />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(postTitle)}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-accent/10" aria-label="Share on Twitter">
              <Twitter size={18} />
            </a>
            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(postTitle)}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-accent/10" aria-label="Share on LinkedIn">
              <Linkedin size={18} />
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-accent/10 px-2 py-1.5 h-auto text-xs"
              onClick={handleCopyLink}
              disabled={!currentUrl}
            >
              <LinkIcon className="mr-1 h-3.5 w-3.5" /> Copy link
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

