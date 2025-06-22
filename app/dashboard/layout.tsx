import { UserProvider } from "@/providers/user-provider";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/user";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user data from Supabase for server-side authentication
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  let userProfile = null;

  if (data.user) {
    const { data: userProfileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user?.id)
      .single();
      
    userProfile = {
      ...userProfileData,
      profile_image: data.user?.user_metadata.avatar_url,
      display_name: data.user?.user_metadata.name,
      email: data.user?.email,
      created_at: data.user?.user_metadata.created_at,
      last_active_at: data.user?.user_metadata.last_active_at,
    } as UserProfile;
  }

  return (
    <UserProvider initialUser={userProfile}>
      {children}
    </UserProvider>
  );
} 