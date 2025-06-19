"use client";

import { useDatabase } from "@/app/contexts/DatabaseContext";
import DatabaseError from "@/app/components/errors/DatabaseError";
import ProfileDashboard from "@/app/components/profile/ProfileDashboard";
import BottomNavigation from "@/app/components/dashboard/BottomNavigation";
import ButtonSettings from "@/app/components/ButtonSettings";
import DefaultLoading from "@/app/components/default-loading";

export default function ProfilePage() {
  const { error, isLoading } = useDatabase();

  if (error) {
    return <DatabaseError error={error} onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return (
      <DefaultLoading text="loading..." />
    );
  }

  return (
    <>
      <div className="container mx-auto p-2 space-y-6 pb-20 relative">
        <div className="absolute top-2 right-2 z-10">
          <ButtonSettings />
        </div>
        <ProfileDashboard />
      </div>
      <BottomNavigation />
    </>
  );
} 