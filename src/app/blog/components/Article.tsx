
'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // Ensure this is imported in globals.css or here
import { cn } from '@/lib/utils';

interface ArticleProps {
  content: string;
  className?: string;
}

export default function Article({ content, className }: ArticleProps) {
  return (
    <article 
      className={cn(
        "prose prose-medium lg:prose-xl dark:prose-invert font-sans break-words",
        // Removed mx-auto, px-4, py-12 as layout is handled by parent page
        // Specific overrides to match image more closely:
        "prose-p:text-gray-700 prose-p:dark:text-gray-300 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-[1.05rem]", // Adjusted paragraph text color and size
        "prose-headings:text-gray-900 prose-headings:dark:text-gray-100",
        "prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4", // Styling for "Step X" headings
        "prose-a:text-sky-600 prose-a:dark:text-sky-500 prose-a:no-underline hover:prose-a:underline", // Link styling
        "prose-blockquote:border-l-primary prose-blockquote:text-gray-600 prose-blockquote:dark:text-gray-400",
        "prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal",
        "prose-pre:bg-gray-900 prose-pre:dark:bg-gray-900 prose-pre:text-gray-100 prose-pre:dark:text-gray-200 prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto",
        className
      )}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
            // Ensure headings have IDs for TOC linking
            h1: ({node, ...props}) => {
                const id = String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                return <h1 id={id} {...props} style={{scrollMarginTop: `${NAVBAR_HEIGHT_OFFSET}px`}} />;
            },
            h2: ({node, ...props}) => {
                const id = String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                return <h2 id={id} {...props} style={{scrollMarginTop: `${NAVBAR_HEIGHT_OFFSET}px`}} />;
            },
            h3: ({node, ...props}) => {
                const id = String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                return <h3 id={id} {...props} style={{scrollMarginTop: `${NAVBAR_HEIGHT_OFFSET}px`}} />;
            },
            h4: ({node, ...props}) => {
                const id = String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                return <h4 id={id} {...props} style={{scrollMarginTop: `${NAVBAR_HEIGHT_OFFSET}px`}} />;
            },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

// Define NAVBAR_HEIGHT_OFFSET here as well if not globally accessible,
// or ideally pass it as a prop if it can vary. For simplicity now, hardcoded.
const NAVBAR_HEIGHT_OFFSET = 80;
