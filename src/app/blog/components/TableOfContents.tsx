
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TocItem {
  id: string;
  level: number;
  text: string;
}

interface TableOfContentsProps {
  tocItems: TocItem[];
  isLoading: boolean;
}

export function TableOfContents({ tocItems, isLoading }: TableOfContentsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
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
    <nav className="space-y-2 text-sm" aria-labelledby="toc-heading">
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
    </nav>
  );
}
