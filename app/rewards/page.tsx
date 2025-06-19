"use client";

import { useDatabase } from "@/app/contexts/DatabaseContext";
import DatabaseError from "@/app/components/errors/DatabaseError";
import RewardsDashboard from "@/app/components/rewards/RewardsDashboard";
import BottomNavigation from "@/app/components/dashboard/BottomNavigation";
import DefaultLoading from "@/app/components/default-loading";

export default function RewardsPage() {
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
      <div className="container mx-auto p-2 space-y-6 pb-20">
        <RewardsDashboard />
      </div>
      <BottomNavigation />
    </>
  );
} 