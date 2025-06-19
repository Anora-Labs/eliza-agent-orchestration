'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { CaretRight, GithubLogo } from '@phosphor-icons/react/dist/ssr';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

// Import ThemeComparison with dynamic import to prevent hydration issues
const ThemeComparison = dynamic(() => import('@/app/components/ThemeComparison'), {
  ssr: false,
});

export default function HomePage() {
  // Ensure dark mode is set properly when the component loads
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="w-full h-screen mx-auto bg-background flex flex-col items-center justify-center px-4 gap-8 relative overflow-hidden select-none">
      {/* Add the ThemeComparison component */}
      <ThemeComparison />
      
      <h1 className="text-zinc-500 text-xl md:text-3xl font-bold text-center z-20">
        The AI Agents For Personal Growth
      </h1>
      
      <div className="relative w-1/2 max-w-md aspect-square z-20">
        <Image 
          src="/wei-square.png" 
          alt="logo" 
          fill
          className="object-contain rounded-3xl"
        />
      </div>

      <p className="text-zinc-500 text-sm md:text-lg text-center italic z-20">hey, i'm Wei - "helping you form good habits..."</p>

      <div className="flex flex-wrap gap-4 w-full max-w-3xl mx-auto justify-center z-20">
        {/* Standard buttons that change with theme */}
        <Button 
          variant="outline" 
          size="lg"
          className="text-zinc-500 hover:text-zinc-400"
        >
          <Link href="https://github.com/Anora-Labs/eliza-agent-orchestration" target="_blank" className='flex flex-row gap-1 items-center'>
            <GithubLogo className="size-4" />
            <span>Open Source</span>
          </Link>
        </Button>
        
        <Button 
          variant="default" 
          size="lg"
          className="bg-primary text-zinc-500"
        >
          <Link href="/dashboard" className='flex flex-row gap-1 items-center'>
            <span>Try Now</span>
            <CaretRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
