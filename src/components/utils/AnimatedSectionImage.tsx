
'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface AnimatedSectionImageProps extends Omit<ImageProps, 'alt' | 'src'> {
  src: string; // Ensure src is always a string for direct use
  alt: string;
  animationDirection: 'left' | 'right' | 'up';
  wrapperClassName?: string;
  // layout prop is implicitly handled by ImageProps, common values are 'fill', 'responsive', 'intrinsic'
  // width and height might be required by Image depending on layout
}

export function AnimatedSectionImage({
  src,
  alt,
  animationDirection,
  wrapperClassName = '',
  className, // className for the Next/Image component itself
  ...imageProps // Spread remaining ImageProps (like width, height, layout, priority, quality, etc.)
}: AnimatedSectionImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  let initialTransform = '';
  if (animationDirection === 'left') {
    initialTransform = '-translate-x-full';
  } else if (animationDirection === 'right') {
    initialTransform = 'translate-x-full';
  } else if (animationDirection === 'up') {
    initialTransform = 'translate-y-24'; // Increased from translate-y-16
  }

  const dynamicClasses = isVisible
    ? 'opacity-100 translate-x-0 translate-y-0' // Final state for all
    : `opacity-0 ${initialTransform}`; // Initial state based on direction

  // For layout="fill", the parent needs to be relative and have dimensions.
  // For other layouts, the Image component itself dictates dimensions.
  // The wrapperClassName is applied to the div that holds the Image.
  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out transform', // Base transition classes
        wrapperClassName, // User-provided wrapper classes (e.g., for aspect-ratio, relative positioning for fill)
        dynamicClasses // Apply dynamic visibility and transform
      )}
    >
      <Image
        src={src}
        alt={alt}
        className={className} // Classes for the Image component itself
        {...imageProps} // Pass all other ImageProps down
      />
    </div>
  );
}
