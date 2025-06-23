import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import InfoPage from "./info";
import { APP_DESCRIPTION } from "@/lib/config";
import { APP_TITLE } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get user data from Supabase for server-side authentication
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  let userProfile: UserProfile | null = null;

  console.log('RootLayout - Auth user data:', data.user ? 'User found' : 'No user');

  if (data.user) {
    const { data: userProfileData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user?.id)
      .single();
      
    console.log('RootLayout - User profile data from DB:', userProfileData);
    console.log('RootLayout - User profile error:', error);
      
    userProfile = {
      ...userProfileData,
      profile_image: data.user?.user_metadata.avatar_url || userProfileData?.profile_image || "",
      display_name: data.user?.user_metadata.name || userProfileData?.display_name || "",
      email: data.user?.email || userProfileData?.email || "",
      created_at: userProfileData?.created_at || new Date().toISOString(),
      last_active_at: userProfileData?.last_active_at || new Date().toISOString(),
    } as UserProfile;
    
    console.log('RootLayout - Final user profile:', userProfile);
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <main className="flex min-h-screen flex-col bg-background">
          <InfoPage initialUser={userProfile}>
            {children}
          </InfoPage>
          <Toaster position="top-center" theme="dark" />
        </main>
      </body>
    </html>
  );
}
