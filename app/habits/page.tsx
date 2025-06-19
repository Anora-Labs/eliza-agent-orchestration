"use client";

import { useDatabase } from "@/app/contexts/DatabaseContext";
import DatabaseError from "@/app/components/errors/DatabaseError";
import HabitsDashboard from "@/app/components/habits/HabitsDashboard";
import BottomNavigation from "@/app/components/dashboard/BottomNavigation";
import DefaultLoading from "../components/default-loading";

export default function HabitsPage() {
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
        <HabitsDashboard />
      </div>
      <BottomNavigation />
    </>
  );
} 