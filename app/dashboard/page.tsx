"use client";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import BottomNavigation from "../components/dashboard/BottomNavigation";
import DatabaseError from "../components/errors/DatabaseError";
import { useDatabase } from "../contexts/DatabaseContext";
import DefaultLoading from "../components/default-loading";

export default function DashboardPage() {
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
      <div className="container mx-auto p-2 space-y-6 pb-20 md:pb-6">
        <DashboardHeader />
        <DashboardStats />
      </div>
      <BottomNavigation />
    </>
  );
} 