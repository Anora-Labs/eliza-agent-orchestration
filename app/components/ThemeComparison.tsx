"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ThemeComparison() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState(50); // % of viewport width
  const [isDragging, setIsDragging] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Hide tip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle initial mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply themes to document sections based on position
  useEffect(() => {
    if (!mounted || pathname !== "/") return;
    
    // Update the clip path to be a vertical line
    document.documentElement.style.setProperty(
      "--theme-clip-path",
      `polygon(0% 0%, ${position}% 0%, ${position}% 100%, 0% 100%)`
    );
    
    // Set the divider position
    document.documentElement.style.setProperty("--divider-position", `${position}%`);
    
    // Clean up when component unmounts
    return () => {
      document.documentElement.style.removeProperty("--theme-clip-path");
      document.documentElement.style.removeProperty("--divider-position");
    };
  }, [position, mounted, pathname]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setShowTip(false);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleDrag = (event: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    let clientX;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
    } else {
      clientX = event.clientX;
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    
    // Only update the horizontal position
    setPosition(Math.min(Math.max(x, 0), 100));
  };

  // Set up event listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDrag(e);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleDrag(e);
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  if (!mounted || pathname !== "/") return null;

  return (
    <>
      {/* Light Theme Layer - will be clipped */}
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-10 overflow-hidden"
      >
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: 'var(--theme-clip-path, polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%))',
          }}
        >
          <style jsx global>{`
            .light-theme-section {
              --background: white;
              --foreground: black;
              --card: white;
              --card-foreground: black;
              --popover: white;
              --popover-foreground: black;
              --primary: oklch(0.2 0.004 286.32);
              --primary-foreground: white;
              --secondary: oklch(0.94 0.006 286.033);
              --secondary-foreground: black;
              --muted: oklch(0.94 0.006 286.033);
              --muted-foreground: oklch(0.4 0.015 286.067);
              --accent: oklch(0.94 0.006 286.033);
              --accent-foreground: black;
              --destructive: oklch(0.704 0.191 22.216);
              --border: oklch(0 0 0 / 15%);
              --input: oklch(0 0 0 / 15%);
              --ring: oklch(0.552 0.016 285.938);
            }
          `}</style>
          <div className="light-theme-section absolute inset-0 w-full h-full bg-white">
            {/* Light theme content is included here via CSS variables */}
          </div>
        </div>
      </div>

      {/* Vertical Divider Line */}
      <div 
        className="absolute inset-0 w-full h-full z-20 pointer-events-none theme-divider"
        aria-hidden="true"
      >
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-sm"
          style={{
            left: `var(--divider-position, 50%)`,
            transform: 'translateX(-50%)'
          }}
        />
      </div>

      {/* User tip that fades out */}
      {showTip && (
        <div className="absolute max-w-lg bottom-32 left-1/2 transform -translate-x-1 z-50 bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-lg text-xs shadow-lg backdrop-blur-sm animate-fade-in-up">
          Drag the slider to explore light and dark themes
        </div>
      )}

      {/* Divider Handle Button */}
      <div
        className="absolute z-30 w-4 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center cursor-ew-resize shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{
          left: `var(--divider-position, 50%)`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          touchAction: 'none',
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="h-4 w-0.5 bg-gray-500 rounded-full" />
      </div>
    </>
  );
} 