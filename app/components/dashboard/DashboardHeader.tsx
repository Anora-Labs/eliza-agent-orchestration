"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { WeiDB } from "@/app/types/database";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const { getUserProfile } = useDatabase();
  const [profile, setProfile] = useState<WeiDB['userProfile']['value'] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getUserProfile();
      setProfile(profile);
    };
    fetchProfile();
  }, [getUserProfile]);

  return (
    <Card className="bg-card border-0 shadow-md py-4">
      <CardContent className="py-2 px-4 relative">
        <div className="flex items-center">
          <div className="flex flex-row items-center gap-6">
            <Avatar 
              className="h-16 w-16 border-1 border-primary cursor-pointer"
              onClick={() => router.push("/")} // redirect to landing page
            >
              <AvatarImage src="/wei-icon.png" alt="Wei Icon" />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                WEI
              </AvatarFallback>
            </Avatar>
            <div className="w-full">
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-2xl font-bold">Hey, {profile?.name.split(" ")[0]}!</h1>
                <Button 
                  variant="default" 
                  size="xs" 
                  className="rounded-lg absolute right-4"
                  onClick={() => {
                    console.log("moving to chat screen.");
                    router.push("/chat");
                  }}
                >
                  Chat!<ArrowRight className="size-4" />
                </Button>
              </div>
              <p className="mt-2 text-muted-foreground">What's on the agenda today?</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 