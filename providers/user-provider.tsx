// app/providers/user-provider.tsx
"use client"

import { createClient } from "@/lib/supabase/client"
import { createContext, useContext, useEffect, useState } from "react"
import { UserProfile } from "@/types/user"

type UserContextType = {
  user: UserProfile | null
  isLoading: boolean
  updateUser: (updates: Partial<UserProfile>) => Promise<void>
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: UserProfile | null
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (initialUser?.id) {
      refreshUserFromSession(initialUser.id)
    }
  }, [initialUser])

  // Setup new user on the server 
  const setupNewUser = async () => {
    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error setting up user:', data.error);
        return false;
      }
      
      console.log(`User setup ${data.isNewUser ? 'created' : 'updated'} successfully`);
      return true;
    } catch (error) {
      console.error('Error setting up user:', error);
      return false;
    }
  };

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          // Setup user profile
          await setupNewUser();
          
          // Fetch user profile after setup
          await refreshUserFromSession(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Helper function to fetch user data from session
  const refreshUserFromSession = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      
      if (data) {
        // Get user metadata from auth
        const { data: authData } = await supabase.auth.getUser();
        
        setUser({
          ...data,
          profile_image: authData?.user?.user_metadata?.avatar_url || data.profile_image || "",
          display_name: authData?.user?.user_metadata?.name || data.display_name || "",
          // Ensure required fields have default values
          email: data.email || "",
          created_at: data.created_at || new Date().toISOString(),
          last_active_at: data.last_active_at || new Date().toISOString(),
        } as UserProfile);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data from the server
  const refreshUser = async () => {
    if (!user?.id) return;
    await refreshUserFromSession(user.id);
  };

  // Update user data both in DB and local state
  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)

      if (error) throw error

      // Update local state optimistically
      setUser((prev) => (prev ? { ...prev, ...updates } : null))
    } catch (err) {
      console.error("Failed to update user:", err)
    } finally {
      setIsLoading(false);
    }
  }

  // Sign out and reset user state
  const signOut = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Reset user state
      setUser(null)
    } catch (err) {
      console.error("Failed to sign out:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Set up realtime subscription for user data changes
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`public:users:id=eq.${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setUser((previous) => ({
            ...previous,
            ...(payload.new as UserProfile),
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase])

  return (
    <UserContext.Provider
      value={{ 
        user, 
        isLoading, 
        updateUser, 
        refreshUser, 
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
