"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

// Adapted from React Bits AnimatedContent. See REACT-BITS-LICENSE.txt.
interface AnimatedContentProps {
  children: ReactNode;
  className?: string;
  distance?: number;
  delay?: number;
  scale?: number;
  rotate?: number;
}

export default function AnimatedContent({
  children,
  className,
  distance = 28,
  delay = 0,
  scale = 1,
  rotate = 0,
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const animation = gsap.fromTo(
        element,
        { y: distance, scale, rotation: rotate },
        {
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 1.05,
          delay,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
      return () => animation.revert();
    });
    return () => media.revert();
  }, [distance, delay, scale, rotate]);

  // Content is visible in server HTML and stays readable throughout the entrance.
  return <div ref={ref} className={className}>{children}</div>;
}
