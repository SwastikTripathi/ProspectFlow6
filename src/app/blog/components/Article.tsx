
'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
// Ensure this is imported in globals.css or here <-- REMOVED FROM HERE
import { cn } from '@/lib/utils';

interface ArticleProps {
  content: string;
  className?: string;
}

// Define NAVBAR_HEIGHT_OFFSET here as well if not globally accessible,
// or ideally pass it as a prop if it can vary. For simplicity now, hardcoded.
const NAVBAR_HEIGHT_OFFSET = 80;

export default function Article({ content, className }: ArticleProps) {
  return (
    <article 
      className={cn(
        "prose prose-medium lg:prose-xl dark:prose-invert font-sans break-words",
        // Specific overrides based on the user's image of a Medium-like article
        "prose-p:text-gray-700 prose-p:dark:text-gray-300 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-[1.05rem]", 
        "prose-headings:text-gray-900 prose-headings:dark:text-gray-100",
        "prose-h1:text-3xl prose-h1:sm:text-4xl prose-h1:md:text-[2.5rem] prose-h1:font-bold prose-h1:tracking-tight prose-h1:leading-tight prose-h1:mb-3", // Matching title style from image
        "prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4", // Styling for "Step X" headings
        "prose-h3:text-xl prose-h3:md:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3",
        "prose-h4:text-lg prose-h4:md:text-xl prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-2",
        "prose-a:text-sky-600 prose-a:dark:text-sky-500 prose-a:no-underline hover:prose-a:underline", // Link styling
        "prose-blockquote:border-l-primary prose-blockquote:text-gray-600 prose-blockquote:dark:text-gray-400 prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal",
        "prose-pre:bg-gray-900 prose-pre:dark:bg-gray-900 prose-pre:text-gray-100 prose-pre:dark:text-gray-200 prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto",
        className
      )}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
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
