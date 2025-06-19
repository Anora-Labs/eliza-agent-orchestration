"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Providers } from "./providers";
import { usePathname } from "next/navigation";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (!isMobile && pathname !== "/") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Mobile Only App</h1>
          <p>Please open this application on a mobile device to use it properly.</p>
          <p>or decrease your browser window size to ~410px</p>
        </div>
      </div>
    );
  }

  return <Providers>{children}</Providers>;
}
