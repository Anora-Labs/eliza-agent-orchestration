"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Providers } from "./providers";
import { usePathname } from "next/navigation";
import type { UserProfile } from "@/types/user";

export default function InfoPage({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode;
  initialUser: UserProfile | null;
}) {
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

  return <Providers initialUser={initialUser}>{children}</Providers>;
}
