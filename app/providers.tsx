"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { TranscriptProvider } from "./contexts/TranscriptContext";
import { EventProvider } from "./contexts/EventContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import { UserCacheProvider } from "./contexts/UserCacheContext";
import { ChatProvider } from "./contexts/ChatContext";
import RealTimeStreamingMode from "./RealTimeStreamingMode";
import { usePathname } from "next/navigation";
import { DBLoader } from "./components/DBLoader";
import WhatsNewInfo from "./components/updates/WhatsNewInfo";
import { FeedbackWidget } from "./components/feedback-widget";
import { UserProvider } from "@/providers/user-provider";
import type { UserProfile } from "@/types/user";

export function Providers({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode;
  initialUser: UserProfile | null;
}) {
  const pathname = usePathname();
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem forcedTheme={pathname === "/" ? undefined : "dark"}>
      <UserProvider initialUser={initialUser}>
        <DatabaseProvider>
          <DBLoader>
            <UserCacheProvider>
              <ChatProvider>
                <EventProvider>
                  <TranscriptProvider>
                    {pathname !== "/" && <WhatsNewInfo />}
                    {children}
                    {pathname !== "/" && <RealTimeStreamingMode />}
                    {pathname === "/" && <FeedbackWidget />}
                  </TranscriptProvider>
                </EventProvider>
              </ChatProvider>
            </UserCacheProvider>
          </DBLoader>
        </DatabaseProvider>
      </UserProvider>
    </ThemeProvider>
  );
} 